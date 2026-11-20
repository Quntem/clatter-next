"use client"
import { Button } from "@workspace/ui/components/button";
import { CheckIcon, MoreVerticalIcon, PlusCircleIcon, TrashIcon, UserPlusIcon, XIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Usable, use, useState } from "react";
import { trpc } from "@/lib/trpc";
import { InviteUserDialog } from "@/components/client/inviteUserDialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Channel } from "@workspace/backend/generated/prisma/client";
import { CreateChannelDialog } from "@/createChannelDialog";

export default function AdminHome({params}: {params: Usable<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const [createChannelDialogOpen, setCreateChannelDialogOpen] = useState(false)
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    const membership = trpc.workspace.getMembership.useQuery({workspaceId: workspace.data?.id})
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null)
    const [deleteChannelDialogOpen, setDeleteChannelDialogOpen] = useState(false)
    const deactivate = trpc.workspace.modifyUserActivation.useMutation({
        onSuccess: () => {
            workspace.refetch()
        }
    })
    return <div className="p-8">
        <CreateChannelDialog open={createChannelDialogOpen} setOpen={setCreateChannelDialogOpen} workspace={workspace} />
        <DeleteChannelDialog open={deleteChannelDialogOpen} setOpen={setDeleteChannelDialogOpen} channel={channelToDelete} setChannel={setChannelToDelete} workspace={workspace} />
        <div className="w-full flex flex-row items-center">
            <h1 className="text-2xl font-medium">Channels</h1>
            <div className="flex-1" />
            <Button onClick={() => {
                setCreateChannelDialogOpen(true)
            }}>
                <PlusCircleIcon /> Create Channel
            </Button>
        </div>
        <div className="w-full mt-6 rounded-lg overflow-hidden border-1">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead className="w-[35px]" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workspace.data?.channels.filter(item => item.visibility !== "DIRECT").map(item => {
                        return <TableRow key={item.id}>
                            <TableCell>
                                {item.name}
                            </TableCell>
                            <TableCell>
                                {item.id}
                            </TableCell>
                            <TableCell>
                                {item.default}
                            </TableCell>
                            <TableCell>
                                {item.required}
                            </TableCell>
                            <TableCell>
                                {item.visibility}
                            </TableCell>
                            <TableCell className="p-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={<Button size="icon" variant={"ghost"}>
                                        <MoreVerticalIcon />
                                    </Button>} />
                                    <DropdownMenuContent className="w-auto">
                                        <DropdownMenuItem variant={"destructive"} onClick={() => {
                                            setChannelToDelete(item)
                                            setDeleteChannelDialogOpen(true)
                                        }}>
                                            <TrashIcon /> Delete Channel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </div>
    </div>
}

function DeleteChannelDialog({open, setOpen, workspace, channel, setChannel}: {open: boolean, setOpen: (data: boolean) => void, workspace: ReturnType<typeof trpc.workspace.get.useQuery>, channel: Channel | null, setChannel: (data: Channel | null) => void}) {
    const deleteChannel = trpc.channel.delete.useMutation({
        onSuccess: () => {
            workspace.refetch()
            setOpen(false)
            setChannel(null)
        }
    })
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Are you sure you want to delete "{channel?.name || ""}"
                </DialogTitle>
                <DialogDescription>
                    This action cannot be undone, All messages in this channel will be deleted
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant={"outline"} onClick={() => {
                    setOpen(false)
                    setChannel(null)
                }}><XIcon />Cancel</Button>
                <Button variant={"destructive"} onClick={() => {
                    if (!channel) return
                    deleteChannel.mutate({channelId: channel.id})
                }}><TrashIcon />Delete</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}