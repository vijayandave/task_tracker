import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { isTokenExpired } from "@/lib/auth-utils";

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

    let updatedTask;
    try {
      updatedTask = await prisma.task.update({
        where: { id },
        data: {
          completed: !task.completed,
        },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    } catch (error: any) {
      // Handle case where taskTags table doesn't exist yet
      if (error.message?.includes("taskTags") || error.message?.includes("does not exist")) {
        updatedTask = await prisma.task.update({
          where: { id },
          data: {
            completed: !task.completed,
          },
        });
        (updatedTask as any).taskTags = [];
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      ...updatedTask,
      tags: (updatedTask as any).taskTags?.map((tt: any) => tt.tag.name) || [],
    });
  } catch (error) {
    console.error("Toggle task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
