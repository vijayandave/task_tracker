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
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing start and end parameters" },
        { status: 400 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Convert tasks to calendar events format
    const events = tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate?.toISOString() || "",
      extendedProps: {
        description: task.description,
        priority: task.priority,
        completed: task.completed,
      },
      backgroundColor: task.completed
        ? "#9ca3af"
        : task.priority === "HIGH"
          ? "#ef4444"
          : task.priority === "MEDIUM"
            ? "#f59e0b"
            : "#3b82f6",
      borderColor: "transparent",
      classNames: task.completed ? ["line-through", "opacity-50"] : [],
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Get calendar events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
