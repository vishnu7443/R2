/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `saleDate` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Supplier` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `InventoryTransaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `supplierId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_productId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_saleId_fkey";

-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Supplier_email_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "createdAt",
DROP COLUMN "pincode",
DROP COLUMN "state",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "updatedAt",
ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "purchaseDate",
DROP COLUMN "status",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "totalPrice",
DROP COLUMN "unitPrice",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "saleDate",
DROP COLUMN "status",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "SaleItem" DROP COLUMN "totalPrice",
DROP COLUMN "unitPrice",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "companyName",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "InventoryTransaction";

-- DropEnum
DROP TYPE "PurchaseStatus";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SaleStatus";

-- DropEnum
DROP TYPE "TransactionType";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
