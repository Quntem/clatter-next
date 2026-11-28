-- AlterTable
ALTER TABLE "ChannelMembership" ADD COLUMN     "lastReadAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "readReceipts" BOOLEAN NOT NULL DEFAULT true;
