
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
You are an intelligent AI content classification system for a knowledge management app.
Your task is to analyze content and return a STRICT hierarchical structure as a JSON object.

${context}

IMPORTANT RULES (MUST FOLLOW):
1. You MUST ALWAYS return BOTH:
   * "category" → a broad domain
   * "subcategory" → a specific topic inside that category

2. Category rules:
   * Must be high-level (e.g., Coding, Finance, Health, Productivity, Education, Business, Science, Design, Personal, General)
   * NEVER use specific topics like "DSA", "React", "Stocks" as a category

3. Subcategory rules:
   * Must be specific and belong under the category
   * Examples:
     * Binary Search → category: Coding, subcategory: DSA
     * React Hooks → category: Coding, subcategory: Web Development
     * Stock Investing → category: Finance, subcategory: Stock Market

4. STRICT MAPPING (VERY IMPORTANT):
   * If topic is DSA → category MUST be "Coding"
   * If topic is Web Development → category MUST be "Coding"
   * If topic is Machine Learning → category MUST be "Coding"
   * If topic is Stocks/Investing → category MUST be "Finance"
   * NEVER return "DSA" as category

5. Consistency rules:
   * Capitalize properly (e.g., "Coding", "DSA")
   * Avoid duplicates like "coding", "CODING"
   * Keep naming consistent

6. Dynamic system behavior:
   * Assume categories and subcategories are NOT pre-created
   * Always generate appropriate new ones if needed
   * Do NOT restrict to fixed lists

7. Even if content is unclear:
   * Still return best possible category and subcategory

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "title": "A clear, specific title for this content (max 80 chars)",
  "summary": "A useful 2-4 sentence summary of the core idea or key insight",
  "category": "Broad category",
  "subcategory": "Specific subcategory",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    "Specific recall question 1?",
    "Specific recall question 2?"
  ],
  "importanceScore": 7,
  "keyInsight": "The single most important takeaway in one sentence",
  "quality": "useful"
}

DO NOT:
* Add markdown
* Add explanations
* Skip fields
ONLY RETURN VALID JSON.
`;
}
