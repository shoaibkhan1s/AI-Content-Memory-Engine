import { GoogleGenerativeAI } from "@google/generative-ai";

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("⏳ Fetching available models for your API key...");
    // The SDK doesn't have a direct listModels, so we check the common ones
    const models = ["gemini-1.5-flash","gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash-8b"];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ ${m} is WORKING`);
      } catch (e: any) {
        console.log(`❌ ${m} FAILED: ${e.message.split('\n')[0]}`);
      }
    }
  } catch (error: any) {
    console.error("Critical Error:", error.message);
  }
}

checkModels();
