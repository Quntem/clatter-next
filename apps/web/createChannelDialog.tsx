import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog"
import { Field, FieldDescription, FieldTitle } from "@workspace/ui/components/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@workspace/ui/components/select"
import { EyeIcon, LockIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { trpc } from "./lib/trpc"
import { Input } from "@workspace/ui/components/input"

export function CreateChannelDialog({open, setOpen, workspace}: {open: boolean, setOpen: (data: boolean) => void, workspace: {data: any; refetch: () => Promise<unknown>}}) {
    const [channelName, setChannelName] = useState("")
    const [channelVisibility, setChannelVisibility] = useState<"PUBLIC" | "PRIVATE" | null>(null)
    const createChannel = trpc.channel.create.useMutation({
        onSuccess: () => {
            workspace.refetch()
            setOpen(false)
        }
    })
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Create Channel
                </DialogTitle>
            </DialogHeader>
            <Field>
                <FieldTitle>Channel Name</FieldTitle>
                <FieldDescription>Channel Name must not contain spaces or uppercase letters</FieldDescription>
                <Input placeholder="Channel Name" value={channelName} onChange={ev => setChannelName(ev.target.value)} />
            </Field>
            <Field>
                <FieldTitle>Visibility</FieldTitle>
                <Select value={channelVisibility} onValueChange={setChannelVisibility}>
                    <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="PUBLIC">
                                <EyeIcon /> Public
                            </SelectItem>
                            <SelectItem value="PRIVATE">
                                <LockIcon /> Private
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
            <DialogFooter>
                <Button disabled={channelName == "" || channelName !== channelName.toLowerCase() || channelVisibility == null || channelName.includes(" ")} onClick={() => {
                    if (workspace.data) createChannel.mutate({name: channelName, visibility: channelVisibility ?? "PUBLIC", workspaceId: workspace.data.id})
                }}><PlusIcon />Create</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}
