"use client"
import { Button } from "@workspace/ui/components/button";
import { CheckIcon, ImageIcon, MoreVerticalIcon, SaveIcon, TextIcon, UserPlusIcon, XIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Usable, use, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { InviteUserDialog } from "@/components/client/inviteUserDialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Separator } from "@workspace/ui/components/separator";
import { Input } from "@workspace/ui/components/input";

export default function AdminHome({params}: {params: Usable<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const [workspaceName, setWorkspaceName] = useState(null)
    const [workspaceImage, setWorkspaceImage] = useState(null)
    const [inviteUserDialogOpen, setInviteUserDialogOpen] = useState(false)
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    useEffect(() => {
        if (workspace.data && workspaceName == null && workspaceName == null) {
            setWorkspaceName(workspace.data.name)
            setWorkspaceImage(workspace.data.image || "")
        }
    }, [workspace])
    const membership = trpc.workspace.getMembership.useQuery({workspaceId: workspace.data?.id})
    const updateWorkspace = trpc.workspace.update.useMutation({
        onSuccess: () => {
            workspace.refetch()
        }
    })
    return <div className="p-8">
        <div className="w-full flex flex-row items-center">
            <h1 className="text-2xl font-medium">Workspace Info</h1>
            <div className="flex-1" />
            <Button onClick={() => {
                updateWorkspace.mutate({workspaceId: workspace.data.id, image: workspaceImage, name: workspaceName})
            }}>
                <SaveIcon /> Save Changes
            </Button>
        </div>
        <div className="w-full mt-6 rounded-lg overflow-hidden border-1 flex flex-col">
            <Item>
                <ItemMedia variant={"icon"}><ImageIcon /></ItemMedia>
                <ItemContent>
                    <ItemTitle>
                        Workspace Image
                    </ItemTitle>
                    <ItemDescription>
                        Give your workspace an image to identify it easily
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Input value={workspaceImage} onChange={ev => setWorkspaceImage(ev.target.value)} />
                </ItemActions>
            </Item>
            <Separator />
            <Item>
                <ItemMedia variant={"icon"}><TextIcon /></ItemMedia>
                <ItemContent>
                    <ItemTitle>
                        Workspace Name
                    </ItemTitle>
                    <ItemDescription>
                        Name your workspace
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Input value={workspaceName} onChange={ev => setWorkspaceName(ev.target.value)} />
                </ItemActions>
            </Item>
        </div>
    </div>
}