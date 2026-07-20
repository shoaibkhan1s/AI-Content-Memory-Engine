import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import ReviewState from "@/lib/db/models/ReviewState";
import ContentItem from "@/lib/db/models/ContentItem";
import ActivityLog from "@/lib/db/models/ActivityLog";
import { getAppBaseUrl, sendEmail } from "@/lib/email/resend";
import { weeklyDigestTemplate } from "@/lib/email/weeklyDigestTemplate";
import { generateWeeklyDigestAI, WeeklyDigestStats } from "@/lib/ai/generateWeeklyDigest";
import { waitUntil } from "@vercel/functions";

function isAllowed(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("x-cron-secret") === secret;
}

// Function to calculate consecutive days of activity
async function calculateStreak(userId: any, upToDate: Date = new Date()): Promise<number> {
  const logs = await ActivityLog.find({ userId, timestamp: { $lte: upToDate } })
    .select("timestamp")
    .sort({ timestamp: -1 })
    .lean();
    
  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(upToDate);
  currentDate.setHours(0, 0, 0, 0);

  const uniqueDates = Array.from(
    new Set(
      logs.map((log: any) => {
        const d = new Date(log.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )
  ).sort((a, b) => b - a);

  const mostRecent = uniqueDates[0];
  const yesterday = new Date(currentDate.getTime() - 86400000).getTime();
  
  if (mostRecent !== currentDate.getTime() && mostRecent !== yesterday) {
    return 0; // Streak broken
  }

  let expectedDate = mostRecent;
  for (const time of uniqueDates) {
    if (time === expectedDate) {
      streak++;
      expectedDate -= 86400000;
    } else {
      break;
    }
  }

  return streak;
}

// Calculate longest streak historically
async function calculateLongestStreak(userId: any): Promise<number> {
  const logs = await ActivityLog.find({ userId })
    .select("timestamp")
    .sort({ timestamp: 1 }) // oldest first
    .lean();
    
  if (!logs || logs.length === 0) return 0;

  const uniqueDates = Array.from(
    new Set(
      logs.map((log: any) => {
        const d = new Date(log.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )
  ).sort((a, b) => a - b); // ascending

  let longest = 0;
  let currentStreak = 0;
  let prevDate = 0;

  for (const time of uniqueDates) {
    if (prevDate === 0) {
      currentStreak = 1;
    } else {
      const diffDays = (time - prevDate) / 86400000;
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    if (currentStreak > longest) longest = currentStreak;
    prevDate = time;
  }

  return longest;
}

async function processUserDigest(user: any, baseUrl: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Lifetime Stats
  const lifetimeResources = await ContentItem.countDocuments({ userId: user._id, status: { $ne: "deleted" } });
  const lifetimeReviews = await ActivityLog.countDocuments({ userId: user._id, actionType: "review" });
  const lifetimeCategoriesArray = await ContentItem.distinct("category", { userId: user._id, status: { $ne: "deleted" }, category: { $ne: "" } });
  const lifetimeCategories = lifetimeCategoriesArray.length;
  const longestStreak = await calculateLongestStreak(user._id);

  // Aggregate content items saved in last 7 days
  const recentContent = await ContentItem.find({
    userId: user._id,
    createdAt: { $gte: sevenDaysAgo },
    status: { $ne: "deleted" }
  }).lean();

  const recentActivityLogs = await ActivityLog.find({
    userId: user._id,
    timestamp: { $gte: sevenDaysAgo }
  }).lean();

  if (recentContent.length === 0 && recentActivityLogs.length === 0) {
    return { skipped: true, reason: "Inactive" };
  }

  // Videos, Notes, Links
  const videosSaved = recentContent.filter((c: any) => c.type === "youtube").length;
  const notesSaved = recentContent.filter((c: any) => c.type === "note" || c.type === "idea" || c.type === "snippet").length;
  const linksSaved = recentContent.filter((c: any) => c.type === "link" || c.type === "instagram").length;
  const aiCategoriesGenerated = recentContent.filter((c: any) => c.processingStatus === "done").length;

  // Determine top category and most saved type
  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};

  for (const item of recentContent as any[]) {
    if (item.category && item.category !== "General") categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    if (item.subcategory) subcategoryCounts[item.subcategory] = (subcategoryCounts[item.subcategory] || 0) + 1;
    if (item.type) typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  }

  const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0] || "General";
  const topSubcategories = Object.keys(subcategoryCounts).sort((a, b) => subcategoryCounts[b] - subcategoryCounts[a]).slice(0, 5);
  const mostSavedContentType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0] || "link";

  // Heatmap calculation
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const heatmapData: Record<string, number> = {
    "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0
  };
  for (const log of recentActivityLogs as any[]) {
    const d = new Date(log.timestamp);
    const dayStr = dayNames[d.getDay()];
    heatmapData[dayStr]++;
  }
  const heatmap = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => ({
    day, count: heatmapData[day]
  }));

  const reviewsCompleted = recentActivityLogs.filter((log: any) => log.actionType === "review").length;
  const reviewsPending = await ReviewState.countDocuments({
    userId: user._id,
    isCompleted: false,
    nextReviewDate: { $lte: new Date() }
  });

  const learningStreak = await calculateStreak(user._id);

  const stats: WeeklyDigestStats = {
    videosSaved,
    notesSaved,
    linksSaved,
    aiCategoriesGenerated,
    reviewsCompleted,
    reviewsPending,
    learningStreak,
    topCategory,
    topSubcategories,
    mostSavedContentType,
    lifetimeResources,
    lifetimeReviews,
    lifetimeCategories,
    longestStreak,
    heatmap,
  };

  // Memory of the Week
  const memoryCandidates = recentContent
    .filter((c: any) => c.processingStatus === "done")
    .sort((a: any, b: any) => (b.importanceScore || 0) - (a.importanceScore || 0));
  
  let memoryOfTheWeek = undefined;
  if (memoryCandidates.length > 0) {
    const mem = memoryCandidates[0] as any;
    memoryOfTheWeek = {
      title: mem.title,
      category: mem.category,
      summary: mem.summary,
    };
  }

  // On This Day Resource
  let onThisDayResource = undefined;
  const intervals = [365, 180, 90, 30]; // prioritizing a year ago
  for (const days of intervals) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - days);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);

    const historicItems = await ContentItem.find({
      userId: user._id,
      status: { $ne: "deleted" },
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    if (historicItems && historicItems.length > 0) {
      const hItem = historicItems[0] as any;
      onThisDayResource = {
        daysAgo: days,
        title: hItem.title || "Untitled",
        summary: hItem.summary || "No summary available."
      };
      break;
    }
  }

  // Generate AI Insight
  const aiInsight = await generateWeeklyDigestAI(stats, memoryOfTheWeek);

  // Send Email
  const tpl = weeklyDigestTemplate({
    name: user.name,
    stats,
    ai: aiInsight,
    onThisDay: onThisDayResource,
    dashboardUrl: `${baseUrl}/library`
  });

  await sendEmail({
    to: user.email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  return { success: true };
}

export async function GET(req: NextRequest) {
  if (!isAllowed(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const baseUrl = getAppBaseUrl();

    const users = await User.find({ emailVerified: true }).select("name email").lean();

    // The digest generation is independent of the email sender logic in processUserDigest
    // Using waitUntil helps avoid Vercel timeouts for background jobs.
    waitUntil((async () => {
      console.log(`Starting weekly digest for ${users.length} users...`);
      for (const u of users) {
        try {
          await processUserDigest(u, baseUrl);
        } catch (err) {
          console.error(`Failed to process digest for ${u.email}:`, err);
        }
      }
      console.log("Weekly digest batch completed.");
    })());

    return NextResponse.json({ success: true, message: "Weekly digest processing started." });
  } catch (err) {
    console.error("GET /api/cron/weekly-digest error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
