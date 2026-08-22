/*
  Warnings:

  - You are about to drop the column `refundAt` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "refundAt",
ADD COLUMN     "refundedAt" TEXT,
ALTER COLUMN "refundAmount" DROP DEFAULT;
