type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
};

export async function groqGenerateJson(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const messages: GroqChatMessage[] = [
    {
      role: "system",
      content:
        "You are a strict JSON generator. Return ONLY valid JSON. Do not wrap in markdown. Do not include extra text.",
    },
    { role: "user", content: prompt },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
    }),
  });

  const data = (await res.json()) as GroqChatCompletionResponse;

  if (!res.ok) {
    const msg = data?.error?.message || `Groq request failed (${res.status})`;
    throw new Error(msg);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  return text.trim();
}

