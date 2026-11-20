-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_parentChannelId_fkey";

-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelMembership" DROP CONSTRAINT "ChannelMembership_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelMembership" DROP CONSTRAINT "ChannelMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalChannelConnection" DROP CONSTRAINT "ExternalChannelConnection_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalChannelConnection" DROP CONSTRAINT "ExternalChannelConnection_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_inReplyToId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sentById_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceGroup" DROP CONSTRAINT "WorkspaceGroup_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceGroupMembership" DROP CONSTRAINT "WorkspaceGroupMembership_workspaceGroupId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceGroupMembership" DROP CONSTRAINT "WorkspaceGroupMembership_workspaceMembershipId_fkey";

-- AlterTable
ALTER TABLE "WorkspaceMembership" ADD COLUMN     "deactivated" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "WorkspaceGroup" ADD CONSTRAINT "WorkspaceGroup_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceGroupMembership" ADD CONSTRAINT "WorkspaceGroupMembership_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "WorkspaceGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceGroupMembership" ADD CONSTRAINT "WorkspaceGroupMembership_workspaceMembershipId_fkey" FOREIGN KEY ("workspaceMembershipId") REFERENCES "WorkspaceMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMembership" ADD CONSTRAINT "ChannelMembership_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMembership" ADD CONSTRAINT "ChannelMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WorkspaceMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalChannelConnection" ADD CONSTRAINT "ExternalChannelConnection_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalChannelConnection" ADD CONSTRAINT "ExternalChannelConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_parentChannelId_fkey" FOREIGN KEY ("parentChannelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_inReplyToId_fkey" FOREIGN KEY ("inReplyToId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "WorkspaceMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
