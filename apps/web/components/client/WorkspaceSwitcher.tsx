"use client"
import { trpc } from "@/lib/trpc"
import { Workspace } from "@workspace/backend/generated/prisma/client"
import { Button } from "@workspace/ui/components/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { CheckIcon, Layers3Icon, PlusCircleIcon, PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { InputGroup, InputGroupInput, InputGroupText } from "@workspace/ui/components/input-group"
import { Field, FieldTitle } from "@workspace/ui/components/field"
import { usePathname, useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"

export function WorkspaceSwitcherSidebar() {
    const workspaces = trpc.workspace.list.useQuery()
    const router = useRouter()
    const pathname = usePathname()

    return <div className="bg-sidebar w-[70px] border-r-1 h-full flex flex-col items-center gap-4 pt-4">
        {workspaces.data?.map(item => (
            <WorkspaceSwitcherSidebarItem key={item.workspace.slug} workspace={item} active={pathname.startsWith(`/client/${item.workspace.slug}`)} onClick={() => router.push("/client/" + item.workspace.slug)} />
        ))}
        <CreateWorkspaceDialog workspaces={workspaces} />
    </div>
}

export function CreateWorkspaceDialog({workspaces}: {workspaces: ReturnType<typeof trpc.workspace.list.useQuery>}) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [workspaceName, setWorkspaceName] = useState("")
    const [workspaceSlug, setWorkspaceSlg] = useState("")
    const createWorkspaceMutation = trpc.workspace.create.useMutation()
    const invites = trpc.workspace.getInvites.useQuery()
    const actionInvite = trpc.workspace.actionInvite.useMutation({
        onSuccess: () => {
            invites.refetch()
            workspaces.refetch()
        }
    })
    return <>
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant={"outline"} className="w-[40px] h-[40px]">
                <PlusIcon />
            </Button>} />
            <DropdownMenuContent className="w-auto">
                <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                    <PlusCircleIcon /> Create New Workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Invites</DropdownMenuLabel>
                    {invites.data?.filter(item => item.status == "PENDING").map(item => {
                        return <DropdownMenuSub key={item.id}>
                            <DropdownMenuSubTrigger>
                                <Layers3Icon />
                                {item.workspace.name}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => {
                                    actionInvite.mutate({action: "ACCEPT", inviteId: item.id})
                                }}>
                                    <CheckIcon /> Accept
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    actionInvite.mutate({action: "REJECT", inviteId: item.id})
                                }}>
                                    <XIcon /> Decline
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    })}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create Workspace
                    </DialogTitle>
                    <DialogDescription>
                        Create a new Workspace
                    </DialogDescription>
                </DialogHeader>
                <Field>
                    <FieldTitle>Workspace Name</FieldTitle>
                    <Input placeholder="Workspace Name" value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} />
                </Field>
                <Field>
                    <FieldTitle>Workspace Slug</FieldTitle>
                    <InputGroup>
                        <InputGroupText className="pl-2">workspace.clatter.work/</InputGroupText>
                        <InputGroupInput className="pl-0" placeholder="slug" value={workspaceSlug} onChange={event => setWorkspaceSlg(event.target.value)} />
                    </InputGroup>
                </Field>
                <DialogFooter>
                    <Button variant={"outline"} onClick={() => setDialogOpen(false)}>
                        <XIcon />Cancel
                    </Button>
                    <Button onClick={() => {
                        createWorkspaceMutation.mutateAsync({
                            name: workspaceName,
                            slug: workspaceSlug
                        }).then(() => {
                            workspaces.refetch()
                        })
                    }}>
                        <CheckIcon />Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}

export function WorkspaceSwitcherSidebarItem({active, onClick, workspace}: {active?: boolean, onClick?: () => void, workspace: Workspace}) {
    return <Tooltip>
        <TooltipTrigger render={<div className={`w-[40px] h-[40px] rounded-lg border-foreground transition-all ${active ? "border-2 p-0.5" : "border-0"}`} onClick={onClick}>
            <div className={`bg-black w-full h-full transition-all overflow-hidden ${active ? "rounded-sm" : "rounded-lg"}`}>
                <img src={workspace.image || "/client/assets/wsicon.png"} />
            </div>
        </div>} />
        <TooltipContent side="right">{workspace.workspace.name}</TooltipContent>
    </Tooltip>
}