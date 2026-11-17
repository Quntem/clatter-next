import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@workspace/ui/components/input-group";
import { Separator } from "@workspace/ui/components/separator";
import { CrownIcon, PlusIcon, SendIcon, SmileIcon } from "lucide-react";

export default function() {
    return <div className="flex h-full w-full flex-col">
        <div className="flex-1 flex flex-col py-4">
            <div className="flex-1 flex flex-col px-6 pb-4">
                <div className="flex-1" />
                <div className="text-xl mb-1">
                    #channel-name
                </div>
                <div className="mb-4">This is the start of this channel</div>
                <Separator />
            </div>
            <MessageItem />
            <MessageItem compact />
        </div>
        <div className="w-full p-6 pt-0">
            <InputGroup>
                <InputGroupTextarea rows={1} placeholder="Message #Channel" />
                <InputGroupAddon className="flex flex-row" align={"block-end"}>
                    <Button size="icon-sm">
                        <PlusIcon />
                    </Button>
                    <Button size="icon-sm" variant={"ghost"}>
                        <SmileIcon />
                    </Button>
                    <div className="flex-1" />
                    <Button size="icon-sm">
                        <SendIcon />
                    </Button>
                </InputGroupAddon>
            </InputGroup>
        </div>
    </div>
}

function MessageItem({compact=false}: {compact?: boolean}) {
    return <div className="w-full px-6 pb-1 pt-1 hover:bg-black/5 flex flex-row gap-3">
        {compact ? <div className="w-[40px] mt-0.5" /> : <div className="h-[40px] w-[40px] rounded-md border-1 bg-muted mt-0.5">
            
        </div>}
        <div className="flex flex-col">
            {!compact && <div className="flex flex-row items-center gap-1">
                <div className="font-semibold text-sm">Username</div>
                <CrownIcon size="12" />
            </div>}
            <div>Message Content</div>
        </div>
    </div>
}