"use client"
import { skipToken } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { CheckIcon, MoreVerticalIcon, UserPlusIcon, XIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { use, useState } from "react";
import { trpc } from "@/lib/trpc";
import { InviteUserDialog } from "@/components/client/inviteUserDialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";

export default function AdminHome({params}: {params: Promise<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const [inviteUserDialogOpen, setInviteUserDialogOpen] = useState(false)
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    const membership = trpc.workspace.getMembership.useQuery(workspace.data ? {workspaceId: workspace.data.id} : skipToken)
    const deactivate = trpc.workspace.modifyUserActivation.useMutation({
        onSuccess: () => {
            workspace.refetch()
        }
    })
    return <div className="p-8">
        <InviteUserDialog open={inviteUserDialogOpen} setOpen={setInviteUserDialogOpen} workspace={workspace} />
        <div className="w-full flex flex-row items-center">
            <h1 className="text-2xl font-medium">Members</h1>
            <div className="flex-1" />
            <Button onClick={() => {
                setInviteUserDialogOpen(true)
            }}>
                <UserPlusIcon /> Invite Member
            </Button>
        </div>
        <div className="w-full mt-6 rounded-lg overflow-hidden border-1">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead className="w-[35px]" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workspace.data?.memberships.map(item => {
                        return <TableRow key={item.id}>
                            <TableCell>
                                {item.name}
                            </TableCell>
                            <TableCell>
                                {item.user.email}
                            </TableCell>
                            <TableCell>
                                {item.role}
                            </TableCell>
                            <TableCell>
                                {item.status}
                            </TableCell>
                            <TableCell>
                                {item.deactivated ? "Deactivated" : "Active"}
                            </TableCell>
                            <TableCell className="p-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={<Button size="icon" variant={"ghost"}>
                                        <MoreVerticalIcon />
                                    </Button>} />
                                    <DropdownMenuContent className="w-auto">
                                        <DropdownMenuItem variant={item.deactivated ? "default" : "destructive"} disabled={item.id == membership.data?.id} onClick={() => {
                                            deactivate.mutate({membershipId: item.id, action: item.deactivated ? "ACTIVATE" : "DEACTIVATE"})
                                        }}>
                                            {item.deactivated ? <><CheckIcon /> Activate User</> : <><XIcon /> Deactivate User</>}
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
