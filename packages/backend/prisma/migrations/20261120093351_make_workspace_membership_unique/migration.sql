/*
  Warnings:

  - A unique constraint covering the columns `[userId,workspaceId]` on the table `WorkspaceMembership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkspaceInvite" ADD COLUMN     "invitedById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_userId_workspaceId_key" ON "WorkspaceMembership"("userId", "workspaceId");

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "WorkspaceMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
