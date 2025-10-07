/*
  Warnings:

  - You are about to drop the column `items` on the `GroceryList` table. All the data in the column will be lost.
  - You are about to drop the column `weekStart` on the `GroceryList` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[familyId,item,unidade,brand]` on the table `PantryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `GroceryList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `GroceryList` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListCategory" AS ENUM ('MERCEARIA', 'LATICINIOS', 'LIMPEZA', 'HORTIFRUTI', 'BEBIDAS', 'OUTROS');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELED');

-- DropIndex
DROP INDEX "GroceryList_familyId_weekStart_key";

-- DropIndex
DROP INDEX "PantryItem_familyId_item_unidade_key";

-- AlterTable
ALTER TABLE "GroceryList" DROP COLUMN "items",
DROP COLUMN "weekStart",
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" "ListCategory" NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PantryItem" ADD COLUMN     "brand" TEXT;

-- CreateTable
CREATE TABLE "GroceryListItem" (
    "id" TEXT NOT NULL,
    "groceryListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "unidade" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "notes" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroceryListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingTrip" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "groceryListId" TEXT,
    "storeName" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'OPEN',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "totalSpent" DECIMAL(10,2),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingTripItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "listItemId" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "unidade" TEXT NOT NULL,
    "qtyPlanned" INTEGER,
    "qtyBought" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "lineTotal" DECIMAL(10,2),
    "pantryUpsertedAt" TIMESTAMP(3),
    "pantryItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingTripItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShoppingTrip_familyId_status_idx" ON "ShoppingTrip"("familyId", "status");

-- CreateIndex
CREATE INDEX "GroceryList_familyId_category_idx" ON "GroceryList"("familyId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "PantryItem_familyId_item_unidade_brand_key" ON "PantryItem"("familyId", "item", "unidade", "brand");

-- AddForeignKey
ALTER TABLE "GroceryListItem" ADD CONSTRAINT "GroceryListItem_groceryListId_fkey" FOREIGN KEY ("groceryListId") REFERENCES "GroceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingTrip" ADD CONSTRAINT "ShoppingTrip_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingTrip" ADD CONSTRAINT "ShoppingTrip_groceryListId_fkey" FOREIGN KEY ("groceryListId") REFERENCES "GroceryList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingTrip" ADD CONSTRAINT "ShoppingTrip_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingTripItem" ADD CONSTRAINT "ShoppingTripItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "ShoppingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingTripItem" ADD CONSTRAINT "ShoppingTripItem_listItemId_fkey" FOREIGN KEY ("listItemId") REFERENCES "GroceryListItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
