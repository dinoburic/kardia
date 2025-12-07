import { NextResponse } from "next/server";
import { evaluateMeasurement } from "@/lib/heart";
import { prisma } from "@/db/client";

export async function GET() {

  const latest = await prisma.measurement.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return NextResponse.json(
      { message: "No measurements yet" },
      { status: 404 }
    );
  }

  const evalResult = evaluateMeasurement({
    heartRate: latest.heartRate,
    spo2: latest.spo2,
    temperature: latest.temperature,
    motionLevel: latest.motionLevel,
  });

  return NextResponse.json({
    ...latest,
    status: evalResult.status,
    score: evalResult.score,
  });
}
