import { NextResponse } from "next/server";
import { prisma } from "@/db/client";

export async function GET() { // Frontend poziva ovu rutu (GET)
    try {
        // Postavi status mjerenja na aktivno u bazi
        await prisma.measurementStatus.update({
            where: { id: 1 },
            data: { isActive: true },
        });

        console.log("Measurement command received. Status set to ACTIVE.");
        
        return NextResponse.json({ message: "Measurement command successful, device is now listening for data." });

    } catch (error) {
        console.error("ERROR setting measurement status:", error);
        return NextResponse.json(
            { message: "Internal Server Error initiating measurement" },
            { status: 500 }
        );
    }
}