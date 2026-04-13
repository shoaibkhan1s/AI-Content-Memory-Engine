import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/middleware";
import RelatedContent from "@/lib/db/models/RelatedContent";
import { connectDB } from "@/lib/db/mongoose";
import ContentItem from "@/lib/db/models/ContentItem";
import ActivityLog from "@/lib/db/models/ActivityLog";

import { updateContentSchema } from "@/lib/utils/validators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid content id",
        },
        { status: 400 },
      );
    }

    const item = await ContentItem.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Content not found",
        },
        { status: 404 },
      );
    }

    const relatedDoc = await RelatedContent.findOne({ contentId: id })
      .populate("relatedContentIds", "title category tags summary")
      .lean();

    const related = relatedDoc?.relatedContentIds || [];

    //Non blocking activity log (don't await faster response)
    ActivityLog.create({
      userId: user.userId,
      actionType: "view",
      contentId: id,
      metadata: {},
    }).catch((err) => console.error("ActivityLog error:", err));

    return NextResponse.json({
      success: true,
      data: {
        item,
        related,
      },
    });
  } catch (err) {
    console.error("GET /api/content/id : ", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  try {
    const body = await req.json();
    const parsed = updateContentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    await connectDB();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid content Id",
        },
        { status: 400 },
      );
    }

    const updatedItem = await ContentItem.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId,
      },
      { ...parsed.data, updatedAt: new Date() },
      { new: true },
    ).lean();

    if (!updatedItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Content not found",
        },
        { status: 404 },
      );
    }

    ActivityLog.create({
      userId: user.userId,
      actionType: "edit",
      contentId: id,
      metadata: { updatedFields: Object.keys(parsed.data) },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Content updated successfully",
    });
  } catch (err) {
    console.error("PUT /api/content/id : ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}



export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid content ID" },
        { status: 400 }
      );
    }

    const item = await ContentItem.findOneAndUpdate(
      { _id: id, userId: user.userId, status: { $ne: "deleted" } },
      { status: "deleted", updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Content not found or already deleted" },
        { status: 404 }
      );
    }

    ActivityLog.create({
      userId: user.userId,
      actionType: "delete",
      contentId: id,
      metadata: {},
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    });

  } catch (err) {
    console.error("DELETE /api/content/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
