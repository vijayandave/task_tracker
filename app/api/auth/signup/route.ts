import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth-utils";
import { getZodErrorMessage } from "@/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(validation.error) },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

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

    // Return user without password
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
        },
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
