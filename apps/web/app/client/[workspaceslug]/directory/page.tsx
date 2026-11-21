"use client"
import { InviteUserDialog } from "@/components/client/inviteUserDialog";
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Separator } from "@workspace/ui/components/separator";
import { BookUserIcon, CheckIcon, MessageSquareIcon, MoreVerticalIcon, SearchIcon, UserIcon, UserPlusIcon, UsersIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Usable, use, useState } from "react";

export default function({params}: {params: Usable<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const router = useRouter()
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    const [inviteUserDialogOpen, setInviteUserDialogOpen] = useState(false)
    const membership = trpc.workspace.getMembership.useQuery({workspaceId: workspace.data?.id})
    const createWorkspace = trpc.channel.createOrGetDirectMessage.useMutation()
    const deactivate = trpc.workspace.modifyUserActivation.useMutation({
        onSuccess: () => {
            workspace.refetch()
        }
    })
    return <div className="flex flex-col w-full h-full">
        <div className="h-[50px] w-full border-b-1 px-2 flex flex-row items-center">
            <Button variant={"ghost"}>
                <BookUserIcon />
                Directory
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
                setInviteUserDialogOpen(true)
            }}>
                <UserPlusIcon />
            </Button>}
            <InviteUserDialog open={inviteUserDialogOpen} setOpen={setInviteUserDialogOpen} workspace={workspace} />
        </div>
        <div className="flex-1 p-4">
            <div className={"max-w-[70%] mx-auto"}>
                <ItemGroup className="gap-0 rounded-xl! border-1 overflow-hidden">
                    {workspace.data?.memberships.map((item, index) => {
                        return <div key={index}>
                            {index !== 0 && <Separator />}
                            <Item className="hover:bg-foreground/5 rounded-none py-1 flex">
                                <ItemMedia variant={"icon"} className="pt-1.5">
                                    <UserIcon />
                                </ItemMedia>
                                <ItemContent className="flex flex-row">
                                    <ItemTitle>
                                        {item.name}:
                                    </ItemTitle>
                                    <ItemDescription>
                                        {item.deactivated ? "Deactivated" : `${item.status} • ${item.role}`}
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={<Button size="icon" variant={"ghost"}>
                                            <MoreVerticalIcon />
                                        </Button>} />
                                        <DropdownMenuContent className="w-auto">
                                            <DropdownMenuItem variant={item.deactivated ? "default" : "destructive"} onClick={() => {
                                                deactivate.mutate({membershipId: item.id, action: item.deactivated ? "ACTIVATE" : "DEACTIVATE"})
                                            }}>
                                                {item.deactivated ? <><CheckIcon /> Activate User</> : <><XIcon /> Deactivate User</>}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                createWorkspace.mutateAsync({workspaceId: workspace.data.id, userId: item.userId}).then(res => {
                                                    router.push("/client/" + workspaceslug + "/channel/" + res.id)
                                                })
                                            }}>
                                                <MessageSquareIcon /> Direct message
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </ItemActions>
                            </Item>
                        </div>
                    })}
                </ItemGroup>
            </div>
        </div>
    </div>
}