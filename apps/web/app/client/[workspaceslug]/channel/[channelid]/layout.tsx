"use client"
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { HashIcon, LockIcon, MoreHorizontalIcon, MoreVerticalIcon, SearchIcon } from "lucide-react";
import { Usable, use } from "react";

export default function({children, params}: {children: React.JSX.Element, params: Usable<{workspaceslug: string, channelid: string}>}) {
    const { workspaceslug, channelid } = use(params)
    const channel = trpc.channel.get.useQuery({id: channelid})
    return <div className="flex flex-col w-full h-full">
        <div className="h-[50px] w-full border-b-1 px-2 flex flex-row items-center">
            <Button variant={"ghost"}>
                {channel.data?.visibility == "PRIVATE" ? <LockIcon /> : <HashIcon />}
                {channel.data?.name}
            </Button>
            {/* <p className="text-sm text-muted-foreground ml-2">Channel Description</p> */}
            <div className="flex-1" />
            <Button variant={"ghost"} size="icon">
                <SearchIcon />
            </Button>
            <Button variant={"ghost"} size="icon">
                <MoreVerticalIcon />
            </Button>
        </div>
        <div className="flex-1">
            {children}
        </div>
    </div>
}