/*
  Warnings:

  - A unique constraint covering the columns `[familyId,weekStart]` on the table `GroceryList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `weekStart` to the `GroceryList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroceryList" ADD COLUMN     "weekStart" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GroceryList_familyId_weekStart_key" ON "GroceryList"("familyId", "weekStart");
