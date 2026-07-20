import { WeeklyDigestStats, WeeklyDigestAIResponse } from "@/lib/ai/generateWeeklyDigest";

type WeeklyDigestTemplateParams = {
  name: string;
  stats: WeeklyDigestStats;
  ai: WeeklyDigestAIResponse;
  dashboardUrl: string;
  onThisDay?: {
    daysAgo: number;
    title: string;
    summary: string;
  };
};

export function weeklyDigestTemplate({
  name,
  stats,
  ai,
  dashboardUrl,
  onThisDay
}: WeeklyDigestTemplateParams) {
  const safeName = name?.trim() || "there";
  
  // Format Date Range
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const dateRangeStr = `${weekAgo.toLocaleDateString('en-US', dateOptions)} - ${now.toLocaleDateString('en-US', dateOptions)}`;

  // Heatmap rendering logic
  const renderHeatmap = () => {
    return stats.heatmap.map((item) => {
      let dots = "—";
      if (item.count > 0) {
        dots = Array(Math.min(item.count, 5)).fill("●").join("");
      }
      return `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #F3F4F6;">
          <span style="color: #6B7280; font-size: 14px;">${item.day}</span>
          <span style="color: #E8632A; font-weight: 700; letter-spacing: 2px;">${dots}</span>
        </div>
      `;
    }).join("");
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #F9FAFB;
          color: #111827;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          color: #E8632A;
          font-weight: 800;
          font-size: 24px;
          letter-spacing: -0.5px;
        }
        .date-range {
          font-size: 13px;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 8px;
        }
        h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 20px 0 10px;
          color: #111827;
        }
        p {
          font-size: 16px;
          color: #4B5563;
          margin: 0 0 20px;
        }
        .card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .card-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #E8632A;
          margin-bottom: 12px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-box {
          background: #F9FAFB;
          border-radius: 8px;
          padding: 16px;
          text-align: left;
          border: 1px solid #F3F4F6;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
          margin-top: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
        }
        .stat-sub {
          font-size: 12px;
          color: #10B981;
          font-weight: 500;
          margin-top: 4px;
        }
        .achievement {
          background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
          border: 1px solid #FDBA74;
          color: #C2410C;
          padding: 16px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 24px;
        }
        .memory-box {
          background: #111827;
          color: #F9FAFB;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .memory-box .card-title {
          color: #FDBA74;
        }
        .memory-box p {
          color: #D1D5DB;
        }
        .cta-container {
          text-align: center;
          margin: 40px 0;
        }
        .btn {
          display: inline-block;
          background-color: #E8632A;
          color: #FFFFFF !important;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(232, 99, 42, 0.2);
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
        }
        .motivation {
          font-style: italic;
          color: #6B7280;
          font-size: 14px;
          margin-bottom: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Recallify</div>
          <div class="date-range">${dateRangeStr}</div>
        </div>

        <h1>Hi ${safeName} 👋</h1>
        <p>Here's what you accomplished this week.</p>

        ${ai.achievement ? `<div class="achievement">${ai.achievement}</div>` : ''}

        <div class="card">
          <div class="card-title">Weekly Progress</div>
          <p style="color: #111827; font-weight: 500; font-size: 15px;">You captured ${stats.videosSaved + stats.notesSaved + stats.linksSaved} new pieces of knowledge.<br/>You reviewed ${stats.reviewsCompleted} concepts.</p>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">📺 Videos</div>
            <div class="stat-value">${stats.videosSaved}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">📝 Notes</div>
            <div class="stat-value">${stats.notesSaved}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">🔥 Streak</div>
            <div class="stat-value">${stats.learningStreak} Days</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">⏳ Pending</div>
            <div class="stat-value">${stats.reviewsPending} Reviews</div>
          </div>
          <div class="stat-box" style="grid-column: 1 / -1;">
            <div class="stat-label">📚 Knowledge Base</div>
            <div class="stat-value">${stats.lifetimeResources} Resources</div>
            <div class="stat-sub">+${stats.videosSaved + stats.notesSaved + stats.linksSaved} this week</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Activity Heatmap</div>
          <div style="margin-top: 16px;">
            ${renderHeatmap()}
          </div>
        </div>

        <div class="card">
          <div class="card-title">Top Categories & Types</div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">TOP CATEGORY</div>
            <div style="font-weight: 600; color: #111827; font-size: 18px;">${stats.topCategory || "None"}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">MOST SAVED</div>
            <div style="font-weight: 600; color: #111827; font-size: 18px; text-transform: capitalize;">${stats.mostSavedContentType || "None"}</div>
          </div>
          ${stats.topSubcategories.length > 0 ? `
          <div>
            <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">TOP SUBCATEGORIES</div>
            <div style="color: #4B5563;">${stats.topSubcategories.join(" • ")}</div>
          </div>
          ` : ''}
        </div>

        <div class="card">
          <div class="card-title">AI Insight</div>
          <p style="color: #111827; font-weight: 500; font-size: 15px; margin: 0;">${ai.insight}</p>
        </div>

        ${ai.biggestWin ? `
        <div class="card" style="background: #F8FAFC; border-color: #E2E8F0;">
          <div class="card-title" style="color: #0369A1;">Biggest Win</div>
          <p style="color: #0F172A; font-weight: 500; margin: 0;">${ai.biggestWin}</p>
        </div>
        ` : ''}

        ${ai.memoryRecap ? `
        <div class="memory-box">
          <div class="card-title">⭐ Memory of the Week</div>
          <p style="color: #FFFFFF; font-weight: 500; font-size: 16px; margin-bottom: 12px;">${ai.memoryRecap}</p>
          <p style="font-size: 14px; margin-bottom: 0;">${ai.memoryReason}</p>
        </div>
        ` : ''}

        ${onThisDay ? `
        <div class="card">
          <div class="card-title">On This Day</div>
          <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 8px;">${onThisDay.daysAgo} DAYS AGO</div>
          <h3 style="margin: 0 0 8px; font-size: 16px; color: #111827;">You learned: ${onThisDay.title}</h3>
          <p style="margin: 0; font-size: 14px; color: #4B5563;">${onThisDay.summary}</p>
        </div>
        ` : ''}

        <div class="card">
          <div class="card-title">Recommended Next Step</div>
          <h3 style="margin: 0 0 8px; font-size: 18px; color: #111827;">${ai.recommendation.topic}</h3>
          <p style="margin: 0; font-size: 14px;">${ai.recommendation.reason}</p>
        </div>

        <div class="card">
          <div class="card-title">Lifetime Progress</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
            <div>
              <div style="font-size: 12px; color: #6B7280; font-weight: 600;">LIFETIME RESOURCES</div>
              <div style="font-weight: 700; color: #111827; font-size: 20px;">${stats.lifetimeResources}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280; font-weight: 600;">LIFETIME REVIEWS</div>
              <div style="font-weight: 700; color: #111827; font-size: 20px;">${stats.lifetimeReviews}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280; font-weight: 600;">CATEGORIES CREATED</div>
              <div style="font-weight: 700; color: #111827; font-size: 20px;">${stats.lifetimeCategories}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280; font-weight: 600;">LONGEST STREAK</div>
              <div style="font-weight: 700; color: #111827; font-size: 20px;">${stats.longestStreak} Days</div>
            </div>
          </div>
        </div>

        <div class="cta-container">
          <a href="${dashboardUrl}" class="btn">Resume Learning &rarr;</a>
        </div>

        <div class="footer">
          <div class="motivation">"${ai.motivation}"</div>
          <p style="font-size: 12px; color: #9CA3AF;">This is an automated weekly digest from Recallify.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: "Your Weekly Learning Digest | Recallify",
    html,
    text: `Hi ${safeName}, your weekly learning digest is here! Visit ${dashboardUrl} to see your progress.`,
  };
}
