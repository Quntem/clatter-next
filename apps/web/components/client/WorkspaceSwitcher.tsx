"use client"
import { trpc } from "@/lib/trpc"
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
import { useReadyNavigation } from "@/lib/queries"

export function WorkspaceSwitcherSidebar() {
    const workspaces = trpc.workspace.list.useQuery()
    const pathname = usePathname()
    const nav = useReadyNavigation()
    const [pendingSlug, setPendingSlug] = useState<string | null>(null)

    return <div className="bg-sidebar w-17.5 border-r h-full flex flex-col items-center gap-4 pt-4">
        {workspaces.data?.map(item => {
            const slug = item.workspace.slug
            const active = pendingSlug ? pendingSlug === slug : pathname === `/client/${slug}` || pathname.startsWith(`/client/${slug}/`)
            return <WorkspaceSwitcherSidebarItem key={slug} workspace={item} active={active} onClick={() => {
                setPendingSlug(slug)
                nav.toWorkspace(slug).finally(() => setPendingSlug(null))
            }} />
        })}
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
            <DropdownMenuTrigger render={<Button variant={"outline"} className="w-10 h-10 cursor-pointer">
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
                    <Button disabled={!workspaceName.trim() || !workspaceSlug.trim() || createWorkspaceMutation.isPending} onClick={() => {
                        createWorkspaceMutation.mutateAsync({
                            name: workspaceName,
                            slug: workspaceSlug
                        }).then(() => {
                            workspaces.refetch()
                            setDialogOpen(false)
                            setWorkspaceName("")
                            setWorkspaceSlg("")
                        })
                    }}>
                        <CheckIcon />Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}

export function WorkspaceSwitcherSidebarItem({active, onClick, workspace}: {active?: boolean, onClick?: () => void, workspace: {workspace: {name: string; slug: string; image: string | null}}}) {
    return <Tooltip>
        <TooltipTrigger render={
            <div className="group relative w-10 h-10 cursor-pointer" onClick={onClick}>
                <div className={`absolute -left-3.5 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-foreground transition-[height,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${active ? "h-5 opacity-100" : "h-0 opacity-0 group-hover:h-2 group-hover:opacity-100"}`} />
                <div className={`bg-black w-full h-full overflow-hidden transition-[border-radius,transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${active ? "rounded-lg shadow-md" : "rounded-[20px] group-hover:rounded-lg"}`}>
                    <img className="size-full object-cover" draggable={false} src={workspace?.workspace?.image || "/client/assets/wsicon.png"}/>
                </div>
            </div>
        } />
        <TooltipContent side="right">{workspace.workspace.name}</TooltipContent>
    </Tooltip>
}
