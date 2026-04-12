import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { signToken } from "@/lib/auth/jwt";
import { signupSchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  try {
    // Step 1: Read the JSON body sent by the frontend
    const body = await req.json();

    // Step 2: Validate the input using Zod
    // If name/email/password don't match rules, this throws an error
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    // Step 3: Connect to MongoDB
    await connectDB();

    // Step 4: Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email Already Exist" },
        { status: 409 },
      );
    }

    // Step 5: Hash the password (NEVER store plain text passwords)
    // 12 = "salt rounds" — higher = more secure but slower. 12 is the sweet spot.
    const passwordHash = await bcrypt.hash(password, 12);

    // Step 6: Create the user in MongoDB
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    // Step 7: Create a JWT token with user info inside it
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    // Step 8: Build the response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          },
        },
        message: "Account Create Successfully",
      },
      {
        status: 200,
      },
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.log("error in Post route of signup : ", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
