/*
  Warnings:

  - Made the column `bio` on table `doctors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "contactNumber" DROP NOT NULL;
