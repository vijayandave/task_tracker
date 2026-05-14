import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    }

    return NextResponse.json(
      { message: "Logged out successfully" },
      {
        status: 200,
        headers: {
          "Set-Cookie": "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
