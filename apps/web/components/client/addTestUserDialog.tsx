import { createDevAccount } from "@/lib/devAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Field, FieldTitle } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Plus } from "lucide-react";
import { useState } from "react";

export function AddTestUserDialog({open, setOpen, workspace}: {open: boolean, setOpen: (data: boolean) => void, workspace: {data: any; refetch: () => Promise<unknown>}}) {
  const [name, setName] = useState("")
  const addDevMember = trpc.workspace.addDevMember.useMutation({
    onSuccess: () => {
      workspace.refetch()
      setName("")
      setOpen(false)
    }
  })
  const submit = () => {
    const account = createDevAccount(name.trim(), false)
    addDevMember.mutate({ workspaceId: workspace.data.id, id: account.user.id, name: account.user.name })
  }
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Test User To "{workspace?.data?.name}"</DialogTitle>
      </DialogHeader>
      <Field>
        <FieldTitle>Name</FieldTitle>
        <Input placeholder="Test user name" value={name} onChange={ev => setName(ev.target.value)} />
      </Field>
      {addDevMember.error && <p className="text-sm text-destructive">{addDevMember.error.message}</p>}
      <DialogFooter>
        <Button disabled={!name.trim() || addDevMember.isPending} onClick={submit}>
          <Plus />Add Test User
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}