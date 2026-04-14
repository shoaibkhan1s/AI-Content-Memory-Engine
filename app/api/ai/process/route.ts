import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { requireAuth } from "@/lib/auth/middleware";
import { processContent } from "@/lib/ai/processContent";
import { connectDB } from "@/lib/db/mongoose";
import ContentItem from "@/lib/db/models/ContentItem";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: "contentId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Only allow re-processing items that belong to this user
    const item = await ContentItem.findOne({
      _id: contentId,
      userId: user.userId,
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 }
      );
    }

    // Trigger background processing (same function, same background pattern)
    waitUntil(
      processContent(contentId, user.userId).catch((err) =>
        console.error("Re-processing failed:", err)
      )
    );

    return NextResponse.json(
      { success: true, message: "Re-processing started" },
      { status: 202 }
    );

  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
