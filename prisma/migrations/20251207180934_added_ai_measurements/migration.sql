/*
  Warnings:

  - You are about to drop the column `movement` on the `Measurement` table. All the data in the column will be lost.
  - Added the required column `motionLevel` to the `Measurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Measurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Measurement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HeartStatus" AS ENUM ('OK', 'ELEVATED', 'WARNING');

-- AlterTable
ALTER TABLE "Measurement" DROP COLUMN "movement",
ADD COLUMN     "motionLevel" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "status" "HeartStatus" NOT NULL DEFAULT 'OK',
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "sex" TEXT;

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "HeartStatus" NOT NULL,
    "score" INTEGER NOT NULL,
    "avgHeartRate" DOUBLE PRECISION NOT NULL,
    "maxHeartRate" INTEGER NOT NULL,
    "minHeartRate" INTEGER NOT NULL,
    "avgSpo2" DOUBLE PRECISION NOT NULL,
    "summaryText" TEXT NOT NULL,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
