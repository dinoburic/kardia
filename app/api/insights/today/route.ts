
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId") ?? "0");
  if (!userId) {
    return NextResponse.json({ message: "Missing userId" }, { status: 400 });
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const measurements = await prisma.measurement.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
        lte: now,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!measurements.length) {
    return NextResponse.json(
      { message: "No data for today", insight: null },
      { status: 200 }
    );
  }

  const avgHeartRate =
    measurements.reduce((sum, m) => sum + m.heartRate, 0) /
    measurements.length;
  const avgSpo2 =
    measurements.reduce((sum, m) => sum + m.spo2, 0) / measurements.length;
  const maxHeartRate = Math.max(...measurements.map((m) => m.heartRate));
  const minHeartRate = Math.min(...measurements.map((m) => m.heartRate));
  const avgScore =
    measurements.reduce((sum, m) => sum + m.score, 0) / measurements.length;

  let status: "OK" | "ELEVATED" | "WARNING" = "OK";
  if (avgScore < 60) status = "WARNING";
  else if (avgScore < 80) status = "ELEVATED";

  let summary = "";
  if (status === "OK") {
    summary =
      "Your heart metrics look balanced today. Keep your routine steady and stay hydrated.";
  } else if (status === "ELEVATED") {
    summary =
      "Your heart shows some elevated patterns today. It might help to take breaks, reduce stress and avoid heavy exertion.";
  } else {
    summary =
      "Several readings are outside the optimal range. If you feel unwell, consider resting and consulting a medical professional.";
  }

  const insight = {
    status,
    score: Math.round(avgScore),
    avgHeartRate: Math.round(avgHeartRate),
    maxHeartRate,
    minHeartRate,
    avgSpo2: Math.round(avgSpo2),
    summaryText: summary,
  };

  return NextResponse.json({ insight }, { status: 200 });
}
