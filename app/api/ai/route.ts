import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Function to safely extract JSON from potentially messy LLM output
const extractJson = (text: string): string => {
  // Regex looks for the content inside optional ```json...``` block
  const match = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  
  if (match && match[1]) {
    // If markdown wrapper is found, return only the content inside the brackets
    return match[1];
  }
  
  // As a fallback (if no markdown), try to clean surrounding whitespace and return
  return text.trim();
};

export async function POST(req: NextRequest) {
  try {
    const { text, heartRate, spo2, temperature, motionLevel } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 300,
      
      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content: `
                    You are KardiaAI — a smart cardiology safety assistant. 
                    You evaluate heart rate, SpO₂, body temperature, and movement patterns.
                    Your job:

                    1. Assess cardiovascular risk (low / medium / high)
                    2. Explain what caused the risk
                    3. Provide clear, calm recommendations
                    4. If risk is HIGH, also provide an urgent alert message.
                    5. Keep responses medically cautious: NO diagnosis.

                    Return output strictly as a JSON object. DO NOT include any text, markdown, or commentary outside the JSON object.
                    {
                    "text": "...",
                    "risk": "low|medium|high",
                    "factors": "...",
                    "recommendation": "...",
                    "alert": ""
                    }
        `,
        },
        {
          role: "user",
          content: `User message: "${text}".
                    `,
        },
      ],
    });

    const aiRaw = completion.choices[0]?.message?.content ?? "";

    const cleanJsonString = extractJson(aiRaw);
    
    const parsed = JSON.parse(cleanJsonString);

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    console.error("KARDIA AI ERROR:", err);

    return NextResponse.json(
      {
        error: "Greška na serveru prilikom obrade AI zahtjeva. Parsiranje JSON-a nije uspelo.",
        details: err instanceof Error ? err.message : "Nepoznata greška",
      },
      { status: 500 }
    );
  }
}