import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { hashEmailVerificationToken } from "@/lib/auth/emailVerification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
    }

    const tokenHash = hashEmailVerificationToken(token);
    await connectDB();

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("GET /api/auth/verify error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

