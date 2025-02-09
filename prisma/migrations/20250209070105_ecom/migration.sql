/*
  Warnings:

  - Added the required column `p_id` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "p_id" INTEGER NOT NULL;
