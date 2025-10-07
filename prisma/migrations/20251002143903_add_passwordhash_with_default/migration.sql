/*
  Warnings:

  - You are about to drop the column `quantity` on the `PantryItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `PantryItem` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `GroceryLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecipeItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,weekStart]` on the table `GroceryList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `genero` to the `Household` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idade` to the `Household` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Household` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peso` to the `Household` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade` to the `PantryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidade` to the `PantryItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroceryLine" DROP CONSTRAINT "GroceryLine_groceryListId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_householdId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeItem" DROP CONSTRAINT "RecipeItem_recipeId_fkey";

-- DropIndex
DROP INDEX "GroceryList_userId_weekStart_idx";

-- DropIndex
DROP INDEX "Household_userId_key";

-- DropIndex
DROP INDEX "PantryItem_userId_item_unit_idx";

-- AlterTable
ALTER TABLE "GroceryList" ADD COLUMN     "items" JSONB;

-- AlterTable
ALTER TABLE "Household" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "genero" TEXT NOT NULL,
ADD COLUMN     "idade" INTEGER NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "MealPlan" ALTER COLUMN "timezone" DROP NOT NULL,
ALTER COLUMN "jsonPlan" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PantryItem" DROP COLUMN "quantity",
DROP COLUMN "unit",
ADD COLUMN     "comprado" BOOLEAN,
ADD COLUMN     "quantidade" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unidade" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "GroceryLine";

-- DropTable
DROP TABLE "Member";

-- DropTable
DROP TABLE "Recipe";

-- DropTable
DROP TABLE "RecipeItem";

-- CreateIndex
CREATE UNIQUE INDEX "GroceryList_userId_weekStart_key" ON "GroceryList"("userId", "weekStart");
