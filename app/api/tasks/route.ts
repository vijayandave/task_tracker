import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validation";
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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const completed = searchParams.get("completed");
    const tagFilter = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (completed !== null) {
      where.completed = completed === "true";
    }

    let tasks, total;
    
    try {
      if (tagFilter) {
        // Filter by tag
        [tasks, total] = await Promise.all([
          prisma.task.findMany({
            where: {
              ...where,
              taskTags: {
                some: {
                  tag: {
                    name: tagFilter.toLowerCase(),
                    userId: user.id,
                  },
                },
              },
            },
            orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
            skip,
            take: limit,
            include: {
              taskTags: {
                include: {
                  tag: true,
                },
              },
            },
          }),
          prisma.task.count({
            where: {
              ...where,
              taskTags: {
                some: {
                  tag: {
                    name: tagFilter.toLowerCase(),
                    userId: user.id,
                  },
                },
              },
            },
          }),
        ]);
      } else {
        [tasks, total] = await Promise.all([
          prisma.task.findMany({
            where,
            orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
            skip,
            take: limit,
            include: {
              taskTags: {
                include: {
                  tag: true,
                },
              },
            },
          }),
          prisma.task.count({ where }),
        ]);
      }
    } catch (error: any) {
      // Handle case where taskTags table doesn't exist yet
      if (error.message?.includes("taskTags") || error.message?.includes("does not exist")) {
        [tasks, total] = await Promise.all([
          prisma.task.findMany({
            where,
            orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
            skip,
            take: limit,
          }),
          prisma.task.count({ where }),
        ]);
      } else {
        throw error;
      }
    }

    const tasksWithTags = tasks.map((task: any) => ({
      ...task,
      tags: task.taskTags?.map((tt: any) => tt.tag.name) || [],
    }));

    return NextResponse.json({
      tasks: tasksWithTags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(validation.error) },
        { status: 400 }
      );
    }

    const { title, description, dueDate, recurring, recurrenceEndDate, tags } =
      validation.data;

    // Ensure default priority hashtag (medium) is included
    const tagNames = tags || [];
    const normalizedTags = tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean);
    
    // Check if any priority tag exists, if not add medium as default
    const priorityTags = ['low', 'medium', 'high'];
    const hasPriorityTag = normalizedTags.some((t) => priorityTags.includes(t));
    if (!hasPriorityTag) {
      normalizedTags.push('medium');
    }

    // Process tags: create or find existing tags, then link them
    let task;
    try {
      const tagConnections = await Promise.all(
        normalizedTags.map(async (tagName: string) => {
          // Find or create tag
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

      task = await prisma.task.create({
        data: {
          userId: user.id,
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          recurring,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
          taskTags: {
            create: validTagIds.map((tagId) => ({
              tagId,
            })),
          },
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
      // Handle case where tags tables don't exist yet - create task without tags
      if (error.message?.includes("tag") || error.message?.includes("does not exist")) {
        task = await prisma.task.create({
          data: {
            userId: user.id,
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : null,
            recurring,
            recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
          },
        });
        (task as any).taskTags = [];
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      {
        ...task,
        tags: (task as any).taskTags?.map((tt: any) => tt.tag?.name || tt.tag) || normalizedTags,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
