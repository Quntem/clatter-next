/*
  Warnings:

  - A unique constraint covering the columns `[keystoneId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantWorkspaceVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterEnum
ALTER TYPE "ChannelVisibility" ADD VALUE 'DIRECT';

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "parentChannelId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "inReplyToId" TEXT,
ADD COLUMN     "reactions" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "tenantVisibility" "TenantWorkspaceVisibility" NOT NULL DEFAULT 'PUBLIC';

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "keystoneId" TEXT NOT NULL,
    "userAllowWorkspaceCreation" BOOLEAN NOT NULL DEFAULT false,
    "primaryWorkspaceId" TEXT,
    "keystoneObject" JSONB,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalChannelConnection" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalChannelConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_keystoneId_key" ON "Tenant"("keystoneId");

-- CreateIndex
CREATE UNIQUE INDEX "User_keystoneId_key" ON "User"("keystoneId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalChannelConnection" ADD CONSTRAINT "ExternalChannelConnection_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalChannelConnection" ADD CONSTRAINT "ExternalChannelConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_parentChannelId_fkey" FOREIGN KEY ("parentChannelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_inReplyToId_fkey" FOREIGN KEY ("inReplyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
