"use client"
import { keepPreviousData, skipToken } from "@tanstack/react-query";
import { InviteUserDialog } from "@/components/client/inviteUserDialog";
import { CreateChannelDialog } from "@/createChannelDialog";
import { trpc } from "@/lib/trpc";
import { ChannelMembership } from "@workspace/backend/generated/prisma/client";
import { Button } from "@workspace/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Separator } from "@workspace/ui/components/separator";
import { BookUserIcon, CheckIcon, HandshakeIcon, HashIcon, LockIcon, MessageSquareIcon, MoreVerticalIcon, PlusIcon, SearchIcon, UserIcon, UserPlusIcon, UsersIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useMembership, useReadyNavigation, useWorkspace } from "@/lib/queries";

export default function({params}: {params: Promise<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const workspace = useWorkspace(workspaceslug)
    const [createChannelDialogOpen, setCreateChannelDialogOpen] = useState(false)
    const membership = useMembership(workspace.data?.id)
    const nav = useReadyNavigation()
    const createWorkspace = trpc.channel.createOrGetDirectMessage.useMutation()
    const deactivate = trpc.workspace.modifyUserActivation.useMutation({
        onSuccess: () => {
            workspace.refetch()
        }
    })
    return <div className="flex flex-col w-full h-full">
        <div className="h-12.5 w-full border-b px-2 flex flex-row items-center">
            <Button variant={"ghost"}>
                <HashIcon />
                Channels
            </Button>
            {/* <p className="text-sm text-muted-foreground ml-2">Channel Description</p> */}
            <div className="flex-1" />
            {/* <Button variant={"ghost"} size="icon">
                <SearchIcon />
            </Button>
            <Button variant={"ghost"} size="icon">
                <MoreVerticalIcon />
            </Button> */}
            {membership.data?.role != "MEMBER" && <Button variant={"ghost"} size="icon" onClick={() => {
                setCreateChannelDialogOpen(true)
            }}>
                <PlusIcon />
            </Button>}
            <CreateChannelDialog open={createChannelDialogOpen} setOpen={setCreateChannelDialogOpen} workspace={workspace} />
        </div>
        <div className="flex-1 p-4 gap-4 flex flex-col">
            <div className={"max-w-[70%] w-full mx-auto"}>
                <div className="text-lg pb-2 pt-2">
                    Your channels
                </div>
                <ItemGroup className="gap-0 rounded-xl! border-1 overflow-hidden">
                    {workspace.data?.channels.filter(item => item.visibility !== "DIRECT").map((item, index) => {
                        return <div key={index}>
                            {index !== 0 && <Separator />}
                            <Item className="hover:bg-foreground/5 rounded-none py-1 flex" onClick={() => nav.toChannel(workspaceslug, item.id)}>
                                <ItemMedia variant={"icon"} className="pt-1.5">
                                    {item.workspaceId !== workspace.data?.id || item.externalConnections.length > 0 ? <HandshakeIcon /> : item.visibility == "PUBLIC" ? <HashIcon /> : <LockIcon />}
                                </ItemMedia>
                                <ItemContent className="flex flex-row">
                                    <ItemTitle>
                                        {item.name}
                                    </ItemTitle>
                                    <ItemDescription>
                                        {item.members.length} Member{item.members.length == 1 ? "" : "s"}
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions onClick={ev => ev.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={<Button size="icon" variant={"ghost"}>
                                            <MoreVerticalIcon />
                                        </Button>} />
                                        <DropdownMenuContent className="w-auto">
                                            
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </ItemActions>
                            </Item>
                        </div>
                    })}
                </ItemGroup>
            </div>
            {workspace.data?.availableChannels.filter(item => item.members.filter(el => el.membership.id == membership.data?.id).length == 0).filter(item => item.visibility !== "DIRECT").length !== 0 && <div className={"max-w-[70%] w-full mx-auto"}>
                <div className="text-lg pb-2 pt-2">
                    Available channels
                </div>
                <ItemGroup className="gap-0 rounded-xl! border-1 overflow-hidden">
                    {workspace.data?.availableChannels.filter(item => item.members.filter(el => el.membership.id == membership.data?.id).length == 0).filter(item => item.visibility !== "DIRECT").map((item, index) => {
                        return <div key={index}>
                            {index !== 0 && <Separator />}
                            <Item className="hover:bg-foreground/5 rounded-none py-1 flex" onClick={() => nav.toChannel(workspaceslug, item.id)}>
                                <ItemMedia variant={"icon"} className="pt-1.5">
                                    {item.workspaceId !== workspace.data?.id || item.externalConnections.length > 0 ? <HandshakeIcon /> : item.visibility == "PUBLIC" ? <HashIcon /> : <LockIcon />}
                                </ItemMedia>
                                <ItemContent className="flex flex-row">
                                    <ItemTitle>
                                        {item.name}
                                    </ItemTitle>
                                    <ItemDescription>
                                        {item.members.length} Member{item.members.length == 1 ? "" : "s"}
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions onClick={ev => ev.stopPropagation()}>
                                    <div className="h-[32px]" />
                                    {/* <DropdownMenu>
                                        <DropdownMenuTrigger render={<Button size="icon" variant={"ghost"}>
                                            <MoreVerticalIcon />
                                        </Button>} />
                                        <DropdownMenuContent className="w-auto">
                                            
                                        </DropdownMenuContent>
                                    </DropdownMenu> */}
                                </ItemActions>
                            </Item>
                        </div>
                    })}
                </ItemGroup>
            </div>}
        </div>
    </div>
}
