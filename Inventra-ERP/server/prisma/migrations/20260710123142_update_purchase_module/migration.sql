/*
  Warnings:

  - Added the required column `updatedAt` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL;
