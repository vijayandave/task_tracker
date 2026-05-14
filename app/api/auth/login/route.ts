import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth-utils";
import { getZodErrorMessage } from "@/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(validation.error) },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const sessionToken = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
      "hex"
    );

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: expiresAt,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
