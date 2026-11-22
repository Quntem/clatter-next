import { trpc } from "@/lib/trpc"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog"
import { Field, FieldTitle } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { PlusIcon, SaveIcon } from "lucide-react"
import { useEffect, useState } from "react"

export function UserSettingsDialog({open, setOpen, workspace}: {open: boolean, setOpen: (data: boolean) => void, workspace: ReturnType<typeof trpc.workspace.get.useQuery>}) {
    const membership = trpc.workspace.getMembership.useQuery({workspaceId: workspace?.data?.id})
    const updateMembership = trpc.workspace.updateMembership.useMutation({
        onSuccess: () => {
            membership.refetch()
            workspace.refetch()
        }
    })
    const [name, setName] = useState(null)
    const [picture, setPicture] = useState(null)
    useEffect(() => {
        if (membership.data && name == null && picture == null) {
            setName(membership.data.name)
            setPicture(membership.data.profilePicture || "")
        }
    }, [membership])
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>User Settings</DialogTitle>
            </DialogHeader>
            <Field>
                <FieldTitle>Name</FieldTitle>
                <Input placeholder="Name" value={name} onChange={ev => setName(ev.target.value)} />
            </Field>
            <Field>
                <FieldTitle>Picture</FieldTitle>
                <Input placeholder="Picture" value={picture} onChange={ev => setPicture(ev.target.value)} />
            </Field>
            <DialogFooter>
                <Button onClick={() => {
                    updateMembership.mutate({workspaceId: workspace.data.id, profilePicture: picture, name: name})
                }}>
                    <SaveIcon />Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}