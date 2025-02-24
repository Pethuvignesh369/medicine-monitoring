/*
  Warnings:

  - You are about to alter the column `name` on the `Facility` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `Medicine` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `updatedAt` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Facility` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('Dispensary', 'Hospital', 'ClinicianCenter', 'Polyclinic');

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
DROP COLUMN "type",
ADD COLUMN     "type" "FacilityType" NOT NULL;

-- AlterTable
ALTER TABLE "Medicine" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "MedicineUsage" (
    "id" SERIAL NOT NULL,
    "medicineId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "usageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicineUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicineUsage_medicineId_idx" ON "MedicineUsage"("medicineId");

-- CreateIndex
CREATE INDEX "MedicineUsage_usageDate_idx" ON "MedicineUsage"("usageDate");

-- CreateIndex
CREATE INDEX "Medicine_facilityId_idx" ON "Medicine"("facilityId");

-- CreateIndex
CREATE INDEX "Medicine_expiryDate_idx" ON "Medicine"("expiryDate");

-- AddForeignKey
ALTER TABLE "MedicineUsage" ADD CONSTRAINT "MedicineUsage_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
