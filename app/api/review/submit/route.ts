import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/middleware";
import { connectDB } from "@/lib/db/mongoose";
import ReviewState from "@/lib/db/models/ReviewState";
import ContentItem from "@/lib/db/models/ContentItem";
import { reviewSchema } from "@/lib/utils/validators";
import { sm2Update } from "@/lib/review/sm2";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const contentId = body?.contentId;
    if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ success: false, error: "Invalid contentId" }, { status: 400 });
    }

    const parsed = reviewSchema.safeParse({ result: body?.result });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await ContentItem.findOne({
      _id: contentId,
      userId: user.userId,
      status: { $ne: "deleted" },
    })
      .select("_id importanceScore")
      .lean();

    if (!item) {
      return NextResponse.json({ success: false, error: "Content not found" }, { status: 404 });
    }

    const state = await ReviewState.findOne({
      contentId,
      userId: user.userId,
    });

    if (!state) {
      return NextResponse.json({ success: false, error: "Review state not found" }, { status: 404 });
    }

    const updated = sm2Update({
      state: {
        interval: state.interval,
        easeFactor: state.easeFactor,
        recallStrength: state.recallStrength,
        recallCount: state.recallCount,
      },
      result: parsed.data.result,
      importanceScore: item.importanceScore ?? 5,
    });

    state.lastReviewDate = new Date();
    state.nextReviewDate = updated.nextReviewDate;
    state.interval = updated.interval;
    state.easeFactor = updated.easeFactor;
    state.recallStrength = updated.recallStrength;
    state.recallCount = updated.recallCount;
    state.reviewHistory.push({
      reviewedAt: new Date(),
      result: parsed.data.result,
      strength: updated.recallStrength,
    } as any);

    await state.save();

    return NextResponse.json({
      success: true,
      data: {
        contentId,
        nextReviewDate: state.nextReviewDate,
        recallStrength: state.recallStrength,
        interval: state.interval,
        easeFactor: state.easeFactor,
      },
      message: "Review recorded",
    });
  } catch (err) {
    console.error("POST /api/review/submit error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

