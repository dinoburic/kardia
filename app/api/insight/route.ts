import { NextResponse } from 'next/server';


const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface Measurement {
  id: number;
  createdAt: string;
  heartRate: number;
  spo2: number;
  temperature: number; 
  motionLevel: number;
  status?: string;
  score?: number;
}

interface RequestBody {
    measurements: Measurement[];
}


export async function POST(request: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Internal Server Error: GROQ_API_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    const { measurements }: RequestBody = await request.json();

    if (!measurements || measurements.length === 0) {
      return NextResponse.json(
        { error: "Bad Request: Missing or empty 'measurements' array." },
        { status: 400 }
      );
    }

    const dataForAI = JSON.stringify(measurements, null, 2);

    const systemPrompt = `
      You are an expert health and wellness analyst. Your task is to analyze a series of physiological and environmental measurements.
      
      The metrics provided are:
      - 'heartRate' (BPM): Normal resting range is 60-90 BPM.
      - 'spo2' (%): Oxygen saturation. Normal is 96% and above.
      - 'temperature' (°C): This represents the ROOM TEMPERATURE, not body temperature. Ideal range for sleep/rest is 20-24°C.
      - 'motionLevel' (%): Activity level/movement. Low (<20) to High (>60).
      
      Analyze the provided JSON data and generate a single, comprehensive insight summary. The insight must be structured, professional, and actionable.

      Your response must ONLY contain the insight text. Do not include any titles, headers, or conversational filler.
      
      Focus on the following points:
      1. Overall Status: Summarize the average state of the user's health metrics (BPM, SpO2).
      2. Trends/Anomalies: Point out any sustained high/low readings in any metric.
      3. Environmental Impact: Comment on the relationship between Room Temperature and Motion/Heart Rate.
      4. Recommendation: Provide a single, relevant wellness recommendation based on the data.
      `;
      
    const userPrompt = `
      --- MEASUREMENT DATA (JSON ARRAY) ---
      ${dataForAI}
      --- END OF DATA ---
    `;
    
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", groqResponse.status, errorText);
      return NextResponse.json(
        { error: `Groq API failed with status ${groqResponse.status}` },
        { status: 502 }
      );
    }

    const groqJson = await groqResponse.json();
    
    const insightText = groqJson.choices[0].message.content.trim();

    return NextResponse.json({ insight: insightText });

  } catch (error) {
    console.error("AI Insight Generation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during AI analysis." },
      { status: 500 }
    );
  }
}