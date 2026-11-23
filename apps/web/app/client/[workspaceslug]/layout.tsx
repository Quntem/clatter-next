"use client"
import { keepPreviousData, skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@workspace/ui/components/dropdown-menu";
import { Field, FieldTitle } from "@workspace/ui/components/field";
import { SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenuButton, SidebarGroupLabel, Sidebar } from "@workspace/ui/components/sidebar";
import { ChevronDownIcon, UserPlusIcon, WrenchIcon, PaintbrushIcon, IdCardIcon, UsersIcon, ExternalLinkIcon, SettingsIcon, LogOutIcon, SquarePenIcon, BookUserIcon, HashIcon, LockIcon, HandshakeIcon, UserIcon, UserShield, LayoutGridIcon, SparklesIcon, PencilIcon, PlusIcon, EyeIcon, ShieldXIcon, InfoIcon } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { use, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth";
import { InviteUserDialog } from "@/components/client/inviteUserDialog";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty"
import { CreateChannelDialog } from "@/createChannelDialog";
import { UserSettingsDialog } from "@/components/client/userSettings";
import { useMembership, useWorkspace } from "@/lib/queries";

export default function WorkspaceLayout({children, params}: {children: React.ReactNode, params: Promise<{workspaceslug: string}>}) {
    const router = useRouter()
    const pathname = usePathname()
    const { workspaceslug } = use(params)
    const [userSettingsDialogOpen, setUserSettingsDialogOpen] = useState(false)
    const [createChannelDialogOpen, setCreateChannelDialogOpen] = useState(false)
    const [inviteUserDialogOpen, setInviteUserDialogOpen] = useState(false)
    const workspace = useWorkspace(workspaceslug)
    const auth = useAuthContext()
    const membership = useMembership(workspace.data?.id)
    if (workspace.isError || membership.isError) {
        return <div className="w-full h-full flex flex-col items-center justify-center">
            <Empty>
                <EmptyMedia variant={"icon"}>
                    <ShieldXIcon />
                </EmptyMedia>
                <EmptyContent>
                    <EmptyTitle>Error</EmptyTitle>
                    <EmptyDescription>
                        {workspace.error?.message}
                    </EmptyDescription>
                </EmptyContent>
            </Empty>
        </div>
    }
    return <div className="flex-1 flex flex-row">
        <UserSettingsDialog open={userSettingsDialogOpen} setOpen={setUserSettingsDialogOpen} workspace={workspace} />
        <CreateChannelDialog open={createChannelDialogOpen} setOpen={setCreateChannelDialogOpen} workspace={workspace} />
        <InviteUserDialog open={inviteUserDialogOpen} setOpen={setInviteUserDialogOpen} workspace={workspace} />
        <Sidebar collapsible="none" className="border-r w-75 shrink-0">
            <SidebarHeader className="h-12.5 border-b flex flex-row">
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant={"ghost"}>
                        {workspace.data?.name}<ChevronDownIcon />
                    </Button>} />
                    <DropdownMenuContent className="w-auto" align={"start"}>
                        <DropdownMenuItem disabled={membership.data?.role == "MEMBER"} onClick={() => setInviteUserDialogOpen(true)}>
                            <UserPlusIcon />Invite User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <WrenchIcon />Server Admin
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem disabled={membership.data?.role == "MEMBER"} onClick={() => router.push(`/admin/${workspaceslug}/external-connections`)}>
                                    <HandshakeIcon />External Connections
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    window.open("/admin/" + workspaceslug + "/channels", "_blank")
                                }}>
                                    <HashIcon />
                                    Channels
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    window.open("/admin/" + workspaceslug + "/workspace-info", "_blank")
                                }}>
                                    <InfoIcon />
                                    Workspace Info
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    window.open("/admin/" + workspaceslug + "/users", "_blank")
                                }}>
                                    <UsersIcon />
                                    Users
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                    window.open("/admin/" + workspaceslug, "_blank")
                                }}>
                                    <ExternalLinkIcon />Admin Center
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={() => setUserSettingsDialogOpen(true)}>
                            <SettingsIcon />User Settings
                        </DropdownMenuItem>
                        {/* <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                            <LogOutIcon />Log Out
                        </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-1" />
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button size={"icon"} variant={"ghost"}>
                        <SquarePenIcon />
                    </Button>} />
                    <DropdownMenuContent className="w-full">
                        {/* <DropdownMenuItem>
                            <PencilIcon /> Compose
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => setCreateChannelDialogOpen(true)}>
                            <HashIcon /> Create Channel
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent className="flex flex-col gap-0">
                        <SidebarMenuButton onClick={() => router.push(`/client/${workspaceslug}/directory`)} isActive={pathname == `/client/${workspaceslug}/directory`}>
                            <BookUserIcon />
                            Directory
                        </SidebarMenuButton>
                        <SidebarMenuButton onClick={() => router.push(`/client/${workspaceslug}/channels`)} isActive={pathname == `/client/${workspaceslug}/channels`}>
                            <HashIcon />
                            All Channels
                        </SidebarMenuButton>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Channels
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {workspace.data?.channels.filter(channel => channel.visibility !== "DIRECT").map(channel => {
                            return <SidebarMenuButton key={channel.id} onClick={() => router.push(`/client/${workspaceslug}/channel/${channel.id}`)} isActive={pathname == `/client/${workspaceslug}/channel/${channel.id}`}>
                                {channel.workspaceId !== workspace.data?.id || channel.externalConnections.length > 0 ? <HandshakeIcon /> : channel.visibility == "PRIVATE" ? <LockIcon /> : <HashIcon />}
                                {channel.name}
                            </SidebarMenuButton>
                        })}
                        {/* <SidebarMenuButton>
                            <HashIcon />
                            channel-1
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <LockIcon />
                            private-channel
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <HandshakeIcon />
                            shared-channel
                        </SidebarMenuButton> */}
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Direct Messages
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {workspace.data?.channels?.filter(channel => channel.visibility == "DIRECT").map(channel => {
                            return <SidebarMenuButton key={channel.id} onClick={() => router.push(`/client/${workspaceslug}/channel/${channel.id}`)} isActive={pathname == `/client/${workspaceslug}/channel/${channel.id}`}>
                                <UserIcon />
                                {channel.members.filter(item => item.userId !== membership.data?.id)[0]?.membership.name}
                            </SidebarMenuButton>
                        })}
                        {/* <SidebarMenuButton>
                            <UserIcon />
                            User
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <UserShield />
                            External User
                        </SidebarMenuButton> */}
                    </SidebarGroupContent>
                </SidebarGroup>
                {/* <SidebarGroup>
                    <SidebarGroupLabel>
                        Apps
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuButton>
                            <LayoutGridIcon />
                            Regular App
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <SparklesIcon />
                            AI Agent
                        </SidebarMenuButton>
                    </SidebarGroupContent>
                </SidebarGroup> */}
            </SidebarContent>
        </Sidebar>
        {children}
    </div>
}
