import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validation";
import { isTokenExpired } from "@/lib/auth-utils";
import { getZodErrorMessage } from "@/lib/error-handler";

async function getUserFromSession(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || isTokenExpired(session.expires)) {
    return null;
  }

  return session.user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...task,
      tags: task.taskTags.map((tt) => tt.tag.name),
    });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(validation.error) },
        { status: 400 }
      );
    }

    const { title, description, dueDate, recurring, recurrenceEndDate, tags } =
      validation.data;

    // Handle tags update if provided
    if (tags !== undefined) {
      // Delete existing task tags
      await prisma.taskTag.deleteMany({
        where: { taskId: id },
      });

      // Ensure at least one priority tag exists
      const tagNames = tags || [];
      const normalizedTags = tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean);
      const priorityTags = ['low', 'medium', 'high'];
      const hasPriorityTag = normalizedTags.some((t) => priorityTags.includes(t));
      if (!hasPriorityTag) {
        normalizedTags.push('medium');
      }

      // Create new tags and link them
      const tagConnections = await Promise.all(
        normalizedTags.map(async (tagName: string) => {
          const tag = await prisma.tag.upsert({
            where: {
              userId_name: {
                userId: user.id,
                name: tagName,
              },
            },
            create: {
              userId: user.id,
              name: tagName,
            },
            update: {},
          });

          return tag.id;
        })
      );

      const validTagIds = tagConnections.filter((id): id is string => id !== null);

      await prisma.taskTag.createMany({
        data: validTagIds.map((tagId) => ({
          taskId: id,
          tagId,
        })),
        skipDuplicates: true,
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(recurring !== undefined && { recurring }),
        ...(recurrenceEndDate !== undefined && {
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        }),
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedTask,
      tags: updatedTask.taskTags.map((tt) => tt.tag.name),
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== user.id) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Task deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
