import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { connectDB } from "@/lib/db/mongoose";
import ReviewState from "@/lib/db/models/ReviewState";
import ContentItem from "@/lib/db/models/ContentItem";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    await connectDB();
    const now = new Date();

    const dueStates = await ReviewState.find({
      userId: user.userId,
      isCompleted: false,
      nextReviewDate: { $lte: now },
    })
      .sort({ nextReviewDate: 1 })
      .limit(50)
      .lean();

    const contentIds = dueStates.map((s: any) => s.contentId);
    const items = await ContentItem.find({
      _id: { $in: contentIds },
      userId: user.userId,
      status: { $ne: "deleted" },
    })
      .select("_id title type category importanceScore aiQuestions processingStatus")
      .lean();

    const itemById = new Map(items.map((it: any) => [it._id.toString(), it]));

    const merged = dueStates
      .map((s: any) => {
        const item = itemById.get(s.contentId.toString());
        if (!item) return null;

        const dueMs = now.getTime() - new Date(s.nextReviewDate).getTime();
        const dueDays = dueMs / (24 * 60 * 60 * 1000);

        // Priority: overdue items first, then importanceScore, then weaker recall
        const importance = item.importanceScore ?? 5;
        const strength = s.recallStrength ?? 0.5;
        const priorityScore = dueDays * 2 + importance * 1.5 + (1 - strength) * 2;

        return {
          reviewState: {
            _id: s._id.toString(),
            contentId: s.contentId.toString(),
            nextReviewDate: s.nextReviewDate,
            recallStrength: s.recallStrength,
            interval: s.interval,
            easeFactor: s.easeFactor,
            recallCount: s.recallCount,
          },
          item,
          priorityScore,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.priorityScore - a.priorityScore)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: merged });
  } catch (err) {
    console.error("GET /api/review/due error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

