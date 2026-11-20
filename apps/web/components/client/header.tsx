import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/ui/components/input-group"
import { InfoIcon, LogOutIcon, MessageSquareIcon, MonitorIcon, MoonIcon, SearchIcon, SettingsIcon, SunIcon, UserIcon, XIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { useAuthContext } from "@/lib/auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Button } from "@workspace/ui/components/button"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@workspace/ui/components/menubar"
import { trpc } from "@/lib/trpc"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export function ClientHeader() {
    const theme = useTheme()
    const auth = useAuthContext()
    const workspaces = trpc.workspace.list.useQuery()
    const router = useRouter()
    const pathname = usePathname()
    return <header className="bg-muted h-[40px] w-full border-b-1 relative flex flex-row items-center">
        {/* <Button variant={"ghost"}>
            <p className="font-bold">Clatter</p> Web App
        </Button> */}
        <Menubar className={"border-none ml-2"}>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem>
                            <XIcon />Quit
                        </MenubarItem>
                        <MenubarItem>
                            <InfoIcon />About Clatter
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Workspaces</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        {workspaces.data?.map(item => {
                            return <MenubarCheckboxItem checked={pathname.startsWith("/client/" + item.workspace.slug)} onClick={() => {
                                router.push("/client/" + item.workspace.slug)
                            }}>
                                {item.workspace.name}
                            </MenubarCheckboxItem>
                        })}
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarSub>
                            <MenubarSubTrigger>
                                {theme.theme == "light" && <SunIcon />}
                                {theme.theme == "dark" && <MoonIcon />}
                                {theme.theme == "system" && <MonitorIcon />}
                                Theme
                            </MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarRadioGroup value={theme.theme} onValueChange={theme.setTheme}>
                                    <MenubarRadioItem value={"light"}>
                                        <SunIcon /> Light
                                    </MenubarRadioItem>
                                    <MenubarRadioItem value={"dark"}>
                                        <MoonIcon /> Dark
                                    </MenubarRadioItem>
                                    <MenubarRadioItem value={"system"}>
                                        <MonitorIcon /> System
                                    </MenubarRadioItem>
                                </MenubarRadioGroup>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
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