/*
  Warnings:

  - You are about to drop the column `userId` on the `GroceryList` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `MealPlan` table. All the data in the column will be lost.
  - You are about to drop the column `householdId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PantryItem` table. All the data in the column will be lost.
  - You are about to drop the `Household` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[familyId,weekStart]` on the table `GroceryList` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[familyId,weekStart]` on the table `MealPlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[familyId,item,unidade]` on the table `PantryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `familyId` to the `GroceryList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyId` to the `MealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyId` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyId` to the `PantryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('OWNER', 'MEMBER');

-- DropForeignKey
ALTER TABLE "GroceryList" DROP CONSTRAINT "GroceryList_userId_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_userId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlan" DROP CONSTRAINT "MealPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_householdId_fkey";

-- DropForeignKey
ALTER TABLE "PantryItem" DROP CONSTRAINT "PantryItem_userId_fkey";

-- DropIndex
DROP INDEX "GroceryList_userId_weekStart_key";

-- DropIndex
DROP INDEX "MealPlan_userId_weekStart_key";

-- DropIndex
DROP INDEX "PantryItem_userId_item_unidade_key";

-- AlterTable
ALTER TABLE "GroceryList" DROP COLUMN "userId",
ADD COLUMN     "familyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "userId",
ADD COLUMN     "familyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "householdId",
ADD COLUMN     "familyId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "PantryItem" DROP COLUMN "userId",
ADD COLUMN     "familyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastname" TEXT NOT NULL;

-- DropTable
DROP TABLE "Household";

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFamily" (
    "userId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFamily_pkey" PRIMARY KEY ("userId","familyId")
);

-- CreateTable
CREATE TABLE "FamilyInvitation" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL DEFAULT 'MEMBER',
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvitation_code_key" ON "FamilyInvitation"("code");

-- CreateIndex
CREATE INDEX "FamilyInvitation_familyId_email_idx" ON "FamilyInvitation"("familyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "GroceryList_familyId_weekStart_key" ON "GroceryList"("familyId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_familyId_weekStart_key" ON "MealPlan"("familyId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PantryItem_familyId_item_unidade_key" ON "PantryItem"("familyId", "item", "unidade");

-- AddForeignKey
ALTER TABLE "UserFamily" ADD CONSTRAINT "UserFamily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFamily" ADD CONSTRAINT "UserFamily_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryList" ADD CONSTRAINT "GroceryList_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
