/*
  Warnings:

  - Made the column `facilityId` on table `Medicine` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_facilityId_fkey";

-- AlterTable
ALTER TABLE "Medicine" ALTER COLUMN "facilityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
