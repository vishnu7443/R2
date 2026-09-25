/*
  Warnings:

  - You are about to drop the column `costPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "costPrice",
DROP COLUMN "minStock",
DROP COLUMN "quantity",
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
