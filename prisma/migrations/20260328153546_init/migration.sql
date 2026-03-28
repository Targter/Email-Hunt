-- CreateEnum
CREATE TYPE "ResumeCategory" AS ENUM ('sde', 'ai', 'webdev');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "categoy" "ResumeCategory";
