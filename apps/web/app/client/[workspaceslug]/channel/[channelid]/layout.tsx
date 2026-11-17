import { Button } from "@workspace/ui/components/button";
import { HashIcon, MoreHorizontalIcon, MoreVerticalIcon, SearchIcon } from "lucide-react";

export default function({children}: {children: React.JSX.Element}) {
    return <div className="flex flex-col w-full h-full">
        <div className="h-[50px] w-full border-b-1 px-2 flex flex-row items-center">
            <Button variant={"ghost"}>
                <HashIcon />
                Channel
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