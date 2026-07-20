import { getGeminiModel } from "./gemini";
import { groqGenerateJson } from "./groq";

function parseJsonFromModel(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

export type WeeklyDigestStats = {
  videosSaved: number;
  notesSaved: number;
  linksSaved: number;
  aiCategoriesGenerated: number;
  reviewsCompleted: number;
  reviewsPending: number;
  learningStreak: number;
  topCategory: string;
  topSubcategories: string[];
  mostSavedContentType: string;
  // Lifetime stats
  lifetimeResources: number;
  lifetimeReviews: number;
  lifetimeCategories: number;
  longestStreak: number;
  // Heatmap
  heatmap: { day: string; count: number }[];
};

export type WeeklyDigestAIResponse = {
  insight: string;
  achievement: string;
  biggestWin: string;
  recommendation: {
    topic: string;
    reason: string;
  };
  motivation: string;
  memoryRecap?: string;
  memoryReason?: string;
};

export async function generateWeeklyDigestAI(
  stats: WeeklyDigestStats,
  memoryOfTheWeek?: { title: string; category: string; summary: string }
): Promise<WeeklyDigestAIResponse> {
  const prompt = `You are an expert learning coach analyzing a user's learning activity for the past week.
You will be provided with their weekly statistics and their 'Memory of the Week'.
Your goal is to generate personalized, encouraging, and highly intelligent insights.

Weekly Stats:
- Videos Saved: ${stats.videosSaved}
- Notes Saved: ${stats.notesSaved}
- Links Saved: ${stats.linksSaved}
- AI Categories Generated: ${stats.aiCategoriesGenerated}
- Reviews Completed: ${stats.reviewsCompleted}
- Reviews Pending: ${stats.reviewsPending}
- Learning Streak: ${stats.learningStreak} days
- Top Category: ${stats.topCategory}
- Top Subcategories: ${stats.topSubcategories.join(", ")}
- Most Saved Content Type: ${stats.mostSavedContentType}

Lifetime Stats:
- Lifetime Resources: ${stats.lifetimeResources}
- Lifetime Reviews: ${stats.lifetimeReviews}
- Lifetime Categories: ${stats.lifetimeCategories}
- Longest Streak: ${stats.longestStreak} days

Memory of the Week:
${memoryOfTheWeek ? `Title: ${memoryOfTheWeek.title}\nCategory: ${memoryOfTheWeek.category}\nSummary: ${memoryOfTheWeek.summary}` : "None"}

Please return ONLY a valid JSON object with the following schema:
{
  "insight": "A personalized insight (2-3 sentences). Example: 'You've focused heavily on Trees and Graphs this week. Before moving to Dynamic Programming, consider reviewing Graph Traversal concepts.' Never use generic text.",
  "achievement": "A short, punchy achievement title based on their stats. Example: '🔥 7 Day Learning Streak' or '🏆 Fast Learner'",
  "biggestWin": "Identify their biggest accomplishment this week. Example: 'Your biggest achievement this week was maintaining a five-day learning streak while consistently reviewing DSA concepts.'",
  "recommendation": {
    "topic": "Recommend ONE specific topic to study next.",
    "reason": "Explain why they should study this next based on their past week."
  },
  "motivation": "A short motivational quote to end the digest. Example: 'Knowledge compounds just like investments. Every concept you revisit today becomes easier to recall tomorrow.'",
  "memoryRecap": "If a Memory of the Week is provided, write a 1-sentence recap of it. If not provided, leave this empty.",
  "memoryReason": "If a Memory of the Week is provided, write 1-2 sentences explaining why reviewing this memory matters based on their learning trend. If not provided, leave empty."
}

Do not include markdown blocks, just the JSON string.`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseJsonFromModel(responseText) as WeeklyDigestAIResponse;
  } catch (geminiErr) {
    console.warn("Gemini weekly digest generation failed, trying Groq fallback:", geminiErr);
    try {
      const groqText = await groqGenerateJson(prompt);
      return parseJsonFromModel(groqText) as WeeklyDigestAIResponse;
    } catch (groqErr) {
      console.error("Groq fallback also failed. Falling back to generic content.", groqErr);
      
      // Fallback to high-quality generic content
      return {
        insight: "You've been making consistent progress in building your knowledge base. Keep exploring new topics and saving valuable resources.",
        achievement: stats.learningStreak > 2 ? `🔥 ${stats.learningStreak} Day Learning Streak` : '📚 Knowledge Builder',
        biggestWin: `You actively managed your knowledge this week, saving ${stats.videosSaved + stats.notesSaved + stats.linksSaved} new resources and completing ${stats.reviewsCompleted} reviews.`,
        recommendation: {
          topic: stats.topCategory || "New Concepts",
          reason: "Continue exploring this area to deepen your understanding and build stronger connections."
        },
        motivation: "Knowledge compounds just like investments. Every concept you revisit today becomes easier to recall tomorrow.",
        memoryRecap: memoryOfTheWeek ? `A quick look back at: ${memoryOfTheWeek.title}` : undefined,
        memoryReason: memoryOfTheWeek ? "Reviewing this material now will help solidify your long-term retention." : undefined
      };
    }
  }
}
