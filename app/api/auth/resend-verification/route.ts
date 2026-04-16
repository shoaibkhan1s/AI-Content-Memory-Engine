import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { generateEmailVerificationToken } from "@/lib/auth/emailVerification";
import { getAppBaseUrl, getResendClient } from "@/lib/email/resend";
import { verificationEmailTemplate } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").toString().toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    // Do not leak whether email exists
    if (!user) {
      return NextResponse.json({ success: true, message: "If the email exists, a verification link was sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email already verified." });
    }

    // Basic anti-spam: only allow resend every 2 minutes
    if (user.emailVerificationExpiresAt) {
      const ageMs = Date.now() - (user.emailVerificationExpiresAt.getTime() - 1000 * 60 * 60);
      if (ageMs < 1000 * 60 * 2) {
        return NextResponse.json(
          { success: false, error: "Please wait before requesting another email." },
          { status: 429 }
        );
      }
    }

    const { token, tokenHash, expiresAt } = generateEmailVerificationToken();
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpiresAt = expiresAt;
    await user.save();

    const baseUrl = getAppBaseUrl();
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    const tpl = verificationEmailTemplate({ name: user.name, verifyUrl });
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AI Memory Engine <onboarding@resend.dev>",
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });

    return NextResponse.json({ success: true, message: "If the email exists, a verification link was sent." });
  } catch (err) {
    console.error("POST /api/auth/resend-verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

