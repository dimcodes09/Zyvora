import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Zyvora AI, a warm and elegant personal gift curator for an Indian gift website.

When recommending gifts, respond ONLY with a valid JSON object like this:
{
  "message": "Your warm conversational reply",
  "gifts": [
    {
      "emoji": "🌸",
      "name": "Gift Name",
      "description": "One-line description",
      "price": "₹2,500",
      "tag": "Best Seller"
    }
  ],
  "suggestions": ["Under ₹1000", "Add personalisation"]
}

Rules:
- If you need more info, set gifts to [] and ask via message
- When ready, always give 3 gift recommendations
- Prices in Indian Rupees (₹)
- Tags: "Best Seller", "Trending", "Luxury Pick", "Budget Friendly", "Unique", "Personalised"
- suggestions are short follow-up chips (max 2)
- Respond ONLY with valid JSON, no markdown or extra text`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const raw = completion.choices[0].message.content ?? "";

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ message: raw, gifts: [], suggestions: [] });
  }
}