import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import ContentItem from "@/lib/db/models/ContentItem";
import { requireAuth } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    await connectDB();

    // Use MongoDB distinct to get all unique categories currently in use by the user
    // We only want active items' categories
    const categories = await ContentItem.distinct("category", { 
      userId: user.userId,
      status: "active" 
    });

    // Ensure they are strictly strings and not empty
    const uniqueCategories = categories.filter((c) => typeof c === "string" && c.trim().length > 0);

    return NextResponse.json({
      success: true,
      data: uniqueCategories,
    });
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
