"use client"
import { trpc } from "@/lib/trpc"
import { Workspace } from "@workspace/backend/generated/prisma/client"
import { Button } from "@workspace/ui/components/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { CheckIcon, PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { InputGroup, InputGroupInput, InputGroupText } from "@workspace/ui/components/input-group"
import { Field, FieldTitle } from "@workspace/ui/components/field"
import { usePathname, useRouter } from "next/navigation"

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
    return <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={<Button variant={"outline"} className="w-[40px] h-[40px]">
            <PlusIcon />
        </Button>} />
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
}

export function WorkspaceSwitcherSidebarItem({active, onClick, workspace}: {active?: boolean, onClick?: () => void, workspace: Workspace}) {
    return <Tooltip>
        <TooltipTrigger render={<div className={`w-[40px] h-[40px] rounded-lg border-foreground transition-all ${active ? "border-2 p-0.5" : "border-0"}`} onClick={onClick}>
            <div className={`bg-black w-full h-full transition-all ${active ? "rounded-sm" : "rounded-lg"}`}></div>
        </div>} />
        <TooltipContent side="right">{workspace.workspace.name}</TooltipContent>
    </Tooltip>
}