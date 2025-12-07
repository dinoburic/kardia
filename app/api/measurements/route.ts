// app/api/measurements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { evaluateMeasurement } from "@/lib/heart";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      apiKey,       
      userId,
      heartRate,
      spo2,
      temperature,
      motionLevel,
    } = body;

    if (
      typeof userId !== "number" ||
      typeof heartRate !== "number" ||
      typeof spo2 !== "number" ||
      typeof temperature !== "number" ||
      typeof motionLevel !== "number"
    ) {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    const evalResult = evaluateMeasurement({
      heartRate,
      spo2,
      temperature,
      motionLevel,
    });

    const measurement = await prisma.measurement.create({
      data: {
        userId,
        heartRate,
        spo2,
        temperature,
        motionLevel,
        status: evalResult.status,
        score: evalResult.score,
        source: "device",
      },
    });

    return NextResponse.json(
      {
        message: "Measurement stored",
        measurement,
        evaluation: evalResult,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in /api/measurements POST:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET() {
  const data = await prisma.measurement.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(data);
}
