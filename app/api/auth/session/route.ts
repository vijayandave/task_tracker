import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { isTokenExpired } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || isTokenExpired(session.expires)) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
