import { NextResponse } from 'next/server';

// Use standard fetch if available, or install a lightweight library like 'axios' if running on old Node environments.
// We will use the native fetch, which is available in modern Next.js environments.

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Define the expected structure for the input body
interface Measurement {
  id: number;
  createdAt: string;
  heartRate: number;
  spo2: number;
  temperature: number; // Room Temperature in °C
  motionLevel: number;
  status?: string;
  score?: number;
}

interface RequestBody {
    measurements: Measurement[];
}

/**
 * Route Handler for POST requests to /api/insight
 * Analyzes health and environmental data using a Groq model.
 */
export async function POST(request: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Internal Server Error: GROQ_API_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    // 1. Parse the request body (must use request.json() in Next.js Route Handlers)
    const { measurements }: RequestBody = await request.json();

    if (!measurements || measurements.length === 0) {
      return NextResponse.json(
        { error: "Bad Request: Missing or empty 'measurements' array." },
        { status: 400 }
      );
    }

    // --- 2. Construct the Detailed Prompt ---
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
    
    // --- 3. Call the Groq API ---
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
    
    // Extract the content from the response
    const insightText = groqJson.choices[0].message.content.trim();

    // --- 4. Send Response to Frontend (Success) ---
    return NextResponse.json({ insight: insightText });

  } catch (error) {
    console.error("AI Insight Generation Error:", error);
    // Return a generic error response
    return NextResponse.json(
      { error: "Internal Server Error during AI analysis." },
      { status: 500 }
    );
  }
}