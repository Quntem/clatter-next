/*
  Warnings:

  - Added the required column `sentById` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "sentById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "WorkspaceMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
