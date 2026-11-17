import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/ui/components/input-group"
import { LogOutIcon, SearchIcon, SettingsIcon, UserIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { useAuthContext } from "@/lib/auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"

export function ClientHeader() {
    const auth = useAuthContext()
    return <header className="bg-muted h-[40px] w-full border-b-1 relative flex flex-row items-center">
        <InputGroup className="bg-white max-w-[600px] absolute left-[50%] -translate-x-[50%] max-h-[28px]">
            <InputGroupAddon>
                <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search Workspace" />
        </InputGroup>
        <div className="flex-1" />
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger render={<DropdownMenuTrigger nativeButton={false} render={<Avatar size={"default"} className="mr-2 size-7">
                    <AvatarFallback className="bg-white dark:bg-black">
                        {(auth.authState?.data?.user.name || "")[0]}
                    </AvatarFallback>
                </Avatar>} />} />
                <TooltipContent>
                    {auth.authState?.data?.user.name} (Quntem Account)
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <UserIcon />
                    User Settings
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                    <LogOutIcon />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </header>
}