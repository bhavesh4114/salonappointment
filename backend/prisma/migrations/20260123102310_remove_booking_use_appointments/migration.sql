/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- DropTable
DROP TABLE "Booking";
