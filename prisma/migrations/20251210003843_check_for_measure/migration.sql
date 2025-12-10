-- CreateTable
CREATE TABLE "MeasurementStatus" (
    "id" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MeasurementStatus_pkey" PRIMARY KEY ("id")
);
