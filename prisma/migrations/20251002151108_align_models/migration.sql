/*
  Warnings:

  - You are about to drop the column `ativo` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `genero` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `idade` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `peso` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `comprado` on the `PantryItem` table. All the data in the column will be lost.
  - You are about to alter the column `quantidade` on the `PantryItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `MealPlan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Household` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,item,unidade]` on the table `PantryItem` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MealPlan" DROP CONSTRAINT "MealPlan_userId_fkey";

-- AlterTable
ALTER TABLE "Household" DROP COLUMN "ativo",
DROP COLUMN "createdAt",
DROP COLUMN "genero",
DROP COLUMN "idade",
DROP COLUMN "nome",
DROP COLUMN "observacoes",
DROP COLUMN "peso",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "PantryItem" DROP COLUMN "comprado",
ALTER COLUMN "quantidade" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "passwordHash" DROP DEFAULT;

-- DropTable
DROP TABLE "MealPlan";

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Household_userId_key" ON "Household"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PantryItem_userId_item_unidade_key" ON "PantryItem"("userId", "item", "unidade");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
