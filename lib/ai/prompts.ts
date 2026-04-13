
export function buildProcessingPrompt(data: {
  type: string;           // "youtube", "instagram", "link", "note", "idea"
  title?: string;         // Page/video title if available
  description?: string;   // OG description or YouTube description
  rawContent: string;     // User's original input
  manualNote?: string;    // User's personal note
  platform?: string;      // "YouTube", "Instagram", "Web"
}): string {
  
  const context = [
    data.platform && `Platform: ${data.platform}`,
    data.title && `Title: ${data.title}`,
    data.description && `Description: ${data.description}`,
    `Content: ${data.rawContent}`,
    data.manualNote && `User's Note: ${data.manualNote}`,
  ]
    .filter(Boolean) 
    .join("\n");       

  return `
You are an intelligent content analysis AI for a personal knowledge management app.

Analyze the following ${data.type} content and return ONLY a valid JSON object.

${context}

Return exactly this JSON structure:
{
  "title": "A clear, specific title for this content (max 80 chars)",
  "summary": "A useful 2-4 sentence summary of the core idea or key insight",
  "category": "Exactly one of: Coding, DSA, Mathematics, Finance, Health, Recipes, Business, Productivity, Education, Self-improvement, Entertainment, Science, Design, Personal, General",
  "subcategory": "A specific subcategory within the category (e.g., if category=Coding then subcategory=Python or DSA or Web Development)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    "Specific recall question 1?",
    "Specific recall question 2?",
    "Specific recall question 3?"
  ],
  "importanceScore": 7,
  "keyInsight": "The single most important takeaway in one sentence",
  "quality": "useful"
}

Rules:
- Return ONLY the JSON object, no explanation, no markdown
- tags: 3-6 specific lowercase tags (e.g. "binary-search" not "programming")
- questions: 2-5 questions that test real understanding
- importanceScore: integer 1-10 (10 = life-changing, 1 = trivial)
- quality: exactly one of "useful", "vague", "low-value"
- If content is unclear or too short, still return valid JSON with best guesses
`;
}
