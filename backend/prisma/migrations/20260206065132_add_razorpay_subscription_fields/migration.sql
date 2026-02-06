/*
  Warnings:

  - A unique constraint covering the columns `[barberId,appointmentDate,appointmentTime]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "barbers" ALTER COLUMN "razorpayCustomerId" DROP NOT NULL,
ALTER COLUMN "razorpaySubscriptionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "appointments_barberId_appointmentDate_appointmentTime_key" ON "appointments"("barberId", "appointmentDate", "appointmentTime");
