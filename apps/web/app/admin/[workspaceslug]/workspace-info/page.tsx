"use client"
import { skipToken } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Check, CheckIcon, Eye, ImageIcon, MoreVerticalIcon, SaveIcon, TextIcon, UserPlusIcon, X, XIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { use, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { InviteUserDialog } from "@/components/client/inviteUserDialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Separator } from "@workspace/ui/components/separator";
import { Input } from "@workspace/ui/components/input";

export default function AdminHome({params}: {params: Promise<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const [workspaceName, setWorkspaceName] = useState<string | null>(null)
    const [workspaceImage, setWorkspaceImage] = useState<string | null>(null)
    const [inviteUserDialogOpen, setInviteUserDialogOpen] = useState(false)
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    useEffect(() => {
        if (workspace.data && workspaceName == null && workspaceName == null) {
            setWorkspaceName(workspace.data.name)
            setWorkspaceImage(workspace.data.image || "")
        }
    }, [workspace])
    const membership = trpc.workspace.getMembership.useQuery(workspace.data ? {workspaceId: workspace.data.id} : skipToken)
    const updateWorkspace = trpc.workspace.update.useMutation({
        onSuccess: () => {
            workspace.refetch()
        }
    })
    return <div className="p-8">
        <div className="w-full flex flex-row items-center">
            <h1 className="text-2xl font-medium">Workspace Info</h1>
            <div className="flex-1" />
            <Button disabled={!workspace.data} onClick={() => {
                if (!workspace.data) return
                updateWorkspace.mutate({workspaceId: workspace.data.id, image: workspaceImage ?? undefined, name: workspaceName ?? undefined})
            }}>
                <SaveIcon /> Save Changes
            </Button>
        </div>
        <div className="w-full mt-6 rounded-lg overflow-hidden border flex flex-col">
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
                    <Input value={workspaceImage ?? ""} onChange={ev => setWorkspaceImage(ev.target.value)} />
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
                    <Input value={workspaceName ?? ""} onChange={ev => setWorkspaceName(ev.target.value)} />
                </ItemActions>
            </Item>
            <Separator />
            <Item>
                <ItemMedia variant={"icon"}><Eye /></ItemMedia>
                <ItemContent>
                    <ItemTitle>Read Status</ItemTitle>
                    <ItemDescription>Show message read indicators on messages</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant={workspace.data?.readReceipts ? "default" : "outline"} disabled={!workspace.data || updateWorkspace.isPending} onClick={() => {
                        if (!workspace.data) return
                        updateWorkspace.mutate({workspaceId: workspace.data.id, readReceipts: !workspace.data.readReceipts})
                    }}>
                        {workspace.data?.readReceipts ? <Check /> : <X />}
                        {workspace.data?.readReceipts ? "Enabled" : "Disabled"}
                    </Button>
                </ItemActions>
            </Item>
        </div>
    </div>
}
