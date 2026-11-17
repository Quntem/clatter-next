import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/ui/components/input-group"
import { SearchIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

export function ClientHeader() {
    return <header className="bg-muted h-[40px] w-full border-b-1 relative flex flex-row items-center">
        <InputGroup className="bg-white max-w-[600px] absolute left-[50%] -translate-x-[50%] max-h-[28px]">
            <InputGroupAddon>
                <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search Workspace" />
        </InputGroup>
        <div className="flex-1" />
        <Avatar size={"default"} className="mr-2 size-7">
            <AvatarFallback className="bg-white dark:bg-black">
                UN
            </AvatarFallback>
        </Avatar>
    </header>
}