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
    const query = searchParams.get("q") || "";

    const tags = await prisma.tag.findMany({
      where: {
        userId: user.id,
        name: {
          contains: query.toLowerCase(),
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 20,
    });

    return NextResponse.json({
      tags: tags.map((tag) => tag.name),
    });
  } catch (error) {
    console.error("Get tags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
