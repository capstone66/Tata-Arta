/*
  Warnings:

  - Added the required column `name` to the `ChildUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChildUser" ADD COLUMN     "name" TEXT NOT NULL;
