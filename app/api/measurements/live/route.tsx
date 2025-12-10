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




export async function POST(req: Request) {
 
  try {
    const statusRecord = await prisma.measurementStatus.findUnique({
      where: { id: 1 }, 
    });

    if (!statusRecord || !statusRecord.isActive) {
        console.warn("POST Rejected: Measurement not requested by user (Status is inactive).");
        
        return NextResponse.json({ message: "Measurement not initiated by user command" }, { status: 403 });
    }
  } catch (statusError) {
   
    console.error("ERROR reading measurement status:", statusError);
    return NextResponse.json(
      { message: "Internal Server Error checking status" },
      { status: 500 }
    );
  }


  
  try {
    const body = await req.json();

    if (!body || typeof body.heartRate !== 'number' || typeof body.temperature !== 'number') {
        return NextResponse.json({ message: "Invalid data format" }, { status: 400 });
    }

    const { heartRate, spo2, temperature, motionLevel } = body;
    
    const userIdToUse = 1; 
    
    const evalResult = evaluateMeasurement({ heartRate, spo2: spo2 || 0, temperature, motionLevel: motionLevel || 0 });

    const newMeasurement = await prisma.measurement.create({
        data: {
            heartRate: heartRate,
            spo2: spo2 || 0,
            temperature: temperature,
            motionLevel: motionLevel || 0,
            userId: userIdToUse, 
            score: evalResult.score, 
        },
    });

    await prisma.measurementStatus.update({
        where: { id: 1 },
        data: { isActive: false },
    });
    console.log("Measurement saved and status reset.");

    return NextResponse.json(
      { message: "Measurement successfully recorded", id: newMeasurement.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("ERROR recording measurement:", error);
    return NextResponse.json(
      { message: "Internal Server Error during recording" },
      { status: 500 }
    );
  }
}
