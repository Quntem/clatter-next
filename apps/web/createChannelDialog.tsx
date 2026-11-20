import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog"
import { Field, FieldTitle } from "@workspace/ui/components/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@workspace/ui/components/select"
import { EyeIcon, LockIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { trpc } from "./lib/trpc"
import { Input } from "@workspace/ui/components/input"

export function CreateChannelDialog({open, setOpen, workspace}: {open: boolean, setOpen: (data: boolean) => void, workspace: ReturnType<typeof trpc.workspace.get.useQuery>}) {
    const [channelName, setChannelName] = useState("")
    const [channelVisibility, setChannelVisibility] = useState(null)
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
                <Button disabled={channelName == "" || channelVisibility == null || channelName.includes(" ")} onClick={() => {
                    createChannel.mutate({name: channelName, visibility: channelVisibility, workspaceId: workspace.data.id})
                }}><PlusIcon />Create</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}