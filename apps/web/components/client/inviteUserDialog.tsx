import { trpc } from "@/lib/trpc"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog"
import { Field, FieldTitle } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { PlusIcon } from "lucide-react"
import { useState } from "react"

export function InviteUserDialog({open, setOpen, workspace}: {open: boolean, setOpen: (data: boolean) => void, workspace: ReturnType<typeof trpc.workspace.get.useQuery>}) {
    const [userEmail, setUserEmail] = useState("")
    const inviteMember = trpc.workspace.invite.useMutation({
        onSuccess: () => {
            workspace.refetch()
            setOpen(false)
        }
    })
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Invite User To "{workspace?.data?.name}"</DialogTitle>
            </DialogHeader>
            <Field>
                <FieldTitle>Email</FieldTitle>
                <Input placeholder="Email" value={userEmail} onChange={ev => setUserEmail(ev.target.value)} />
            </Field>
            <DialogFooter>
                <Button onClick={() => {
                    inviteMember.mutate({email: userEmail, workspaceId: workspace.data.id})
                }}>
                    <PlusIcon />Add User
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}