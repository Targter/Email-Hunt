/*
  Warnings:

  - You are about to drop the column `categoy` on the `Resume` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "categoy",
ADD COLUMN     "category" "ResumeCategory";
