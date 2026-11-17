import { Button } from "@workspace/ui/components/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@workspace/ui/components/dropdown-menu";
import { SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenuButton, SidebarGroupLabel, Sidebar } from "@workspace/ui/components/sidebar";
import { ChevronDownIcon, UserPlusIcon, WrenchIcon, PaintbrushIcon, IdCardIcon, UsersIcon, ExternalLinkIcon, SettingsIcon, LogOutIcon, SquarePenIcon, BookUserIcon, HashIcon, LockIcon, HandshakeIcon, UserIcon, UserShield, LayoutGridIcon, SparklesIcon } from "lucide-react";

export default function WorkspaceLayout({children}: {children: React.JSX.Element}) {
    return <div className="flex-1 flex flex-row">
        <Sidebar collapsible="none" className="border-r-1 w-[300px] shrink-0">
            <SidebarHeader className="h-[50px] border-b-1 flex flex-row">
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant={"ghost"}>
                        Workspace<ChevronDownIcon />
                    </Button>} />
                    <DropdownMenuContent className="w-auto" align={"start"}>
                        <DropdownMenuItem>
                            <UserPlusIcon />Invite User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <WrenchIcon />Server Admin
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                    <PaintbrushIcon />
                                    Customise Workspace
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <IdCardIcon />
                                    Workspace Identity
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <UsersIcon />
                                    Users and Groups
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <ExternalLinkIcon />Admin Center
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem>
                            <SettingsIcon />Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                            <LogOutIcon />Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-1" />
                <Button size={"icon"} variant={"ghost"}>
                    <SquarePenIcon />
                </Button>
            </SidebarHeader>
            <SidebarContent className="gap-0">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenuButton>
                            <BookUserIcon />
                            Directory
                        </SidebarMenuButton>
                        <SidebarMenuButton>
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
                        <SidebarMenuButton>
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
                        </SidebarMenuButton>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Direct Messages
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuButton>
                            <UserIcon />
                            User
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <UserShield />
                            External User
                        </SidebarMenuButton>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
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
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
        {children}
    </div>
}