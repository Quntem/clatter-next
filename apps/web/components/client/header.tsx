import { CodeIcon, InfoIcon, Layers3Icon, LogOutIcon, MessageSquareIcon, MonitorIcon, MoonIcon, Palette, SearchIcon, SettingsIcon, SunIcon, UserIcon, XIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { useAuthContext } from "@/lib/auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Button } from "@workspace/ui/components/button"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@workspace/ui/components/menubar"
import { trpc } from "@/lib/trpc"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@workspace/ui/components/command"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { setWorkspaceTheme, useWorkspaceTheme, WorkspaceTheme } from "@/lib/workspaceTheme"
import { useReadyNavigation } from "@/lib/queries"

export function ClientHeader() {
    const theme = useTheme()
    const auth = useAuthContext()
    const workspaces = trpc.workspace.list.useQuery()
    const router = useRouter()
    const pathname = usePathname()
    const nav = useReadyNavigation()
    const [commandDialogOpen, setCommandDialogOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [aboutDialogOpen, setAboutDialogOpen] = useState(false)
    useEffect(() => {
        const openSearch = (event: Event) => {
            const { query } = (event as CustomEvent<{ query: string }>).detail
            setSearchValue(query)
            setCommandDialogOpen(true)
        }
        window.addEventListener("clatter:open-search", openSearch)
        return () => window.removeEventListener("clatter:open-search", openSearch)
    }, [])
    const workspaceSlug = pathname.startsWith("/client/") ? pathname.split("/")[2] : undefined
    const currentSlug = pathname.split("/")[2]
    const workspaceTheme = useWorkspaceTheme(currentSlug)
    const search = trpc.workspace.search.useQuery(
        { slug: workspaceSlug ?? "", query: searchValue.trim() },
        { enabled: commandDialogOpen && !!workspaceSlug && searchValue.trim().length > 0 }
    )
    return <header className="bg-muted h-10 w-full border-b relative flex flex-row items-center">
        {/* <Button variant={"ghost"}>
            <p className="font-bold">Clatter</p> Web App
        </Button> */}
        <AboutClatterDialog open={aboutDialogOpen} setOpen={setAboutDialogOpen} />
        <Menubar className={"border-none ml-2"}>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={() => window.close()}>
                            <XIcon />Quit
                        </MenubarItem>
                        <MenubarItem onClick={() => setAboutDialogOpen(true)}>
                            <InfoIcon />About
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Workspaces</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        {!workspaces.data?.length && (
                            <MenubarItem disabled>
                                {workspaces.isLoading ? "Loading..." : "You're not in any workspaces"}
                            </MenubarItem>
                        )}
                        {workspaces.data?.map(item => {
                            return <MenubarCheckboxItem key={item.id} checked={pathname === "/client/" + item.workspace.slug || pathname.startsWith("/client/" + item.workspace.slug + "/")} onClick={() => {
                                nav.toWorkspace(item.workspace.slug)
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
                        {currentSlug && <MenubarSub>
                            <MenubarSubTrigger>
                                <Palette /> Palette    
                            </MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarRadioGroup value={workspaceTheme} onValueChange={value => {
                                    setWorkspaceTheme(currentSlug, value as WorkspaceTheme)
                                    window.location.reload()
                                }}>
                                    <MenubarRadioItem value="default">Default</MenubarRadioItem>
                                    <MenubarRadioItem value="blue">Blue</MenubarRadioItem>
                                    <MenubarRadioItem value="blossom">Blossom</MenubarRadioItem>
                                </MenubarRadioGroup>
                            </MenubarSubContent>
                        </MenubarSub>}
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
        {/* <InputGroup className="bg-white max-w-[600px] absolute left-[50%] -translate-x-[50%] max-h-[28px]">
            <InputGroupAddon>
                <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search Workspace" />
        </InputGroup> */}
        <Button variant={"outline"} className="bg-white w-150 absolute left-[50%] translate-x-[-50%] max-h-7" onClick={() => setCommandDialogOpen(true)}>
            <SearchIcon />Search Workspace 
            {/* <Kbd>⌘K</Kbd> */}
        </Button>
        <CommandDialog open={commandDialogOpen} onOpenChange={(open) => {
            setCommandDialogOpen(open)
            if (!open) setSearchValue("")
        }} className="top-2 min-w-150">
            <Command>
                <CommandInput value={searchValue} onValueChange={setSearchValue} placeholder={workspaceSlug ? "Search messages, channels, and people..." : "Search workspaces..."} />
                <CommandList>
                    {searchValue.trim() ? <>
                        {search.isLoading && <CommandEmpty>Searching...</CommandEmpty>}
                        {!search.isLoading && !search.data?.channels.length && !search.data?.users.length && !search.data?.messages.length && <CommandEmpty>No results found.</CommandEmpty>}
                        {!!search.data?.messages.length && <CommandGroup heading="Messages">
                            {search.data.messages.map(message => <CommandItem key={message.id} value={`${searchValue} message ${message.preview} ${message.channelName} ${message.senderName}`} onSelect={() => {
                                setCommandDialogOpen(false)
                                router.push(`/client/${workspaceSlug}/channel/${message.channelId}`)
                            }}>
                                <MessageSquareIcon />
                                <span className="truncate">{message.preview || "Message"}</span>
                                <span className="ml-auto text-muted-foreground">#{message.channelName}</span>
                            </CommandItem>)}
                        </CommandGroup>}
                        {!!search.data?.channels.length && <CommandGroup heading="Channels">
                            {search.data.channels.map(channel => <CommandItem key={channel.id} value={`${searchValue} channel ${channel.name}`} onSelect={() => {
                                setCommandDialogOpen(false)
                                router.push(`/client/${workspaceSlug}/channel/${channel.id}`)
                            }}><Layers3Icon />#{channel.name}</CommandItem>)}
                        </CommandGroup>}
                        {!!search.data?.users.length && <CommandGroup heading="People">
                            {search.data.users.map(user => <CommandItem key={user.id} value={`${searchValue} person ${user.name}`} onSelect={() => {
                                setCommandDialogOpen(false)
                                router.push(`/client/${workspaceSlug}/directory`)
                            }}><UserIcon />{user.name}</CommandItem>)}
                        </CommandGroup>}
                    </> : <CommandGroup heading={workspaceSlug ? "Workspaces" : "Workspaces"}>
                        {workspaces.data?.map(item => <CommandItem key={item.id} onSelect={() => {
                            setCommandDialogOpen(false)
                            nav.toWorkspace(item.workspace.slug)
                        }}><Layers3Icon />{item.workspace.name}</CommandItem>)}
                    </CommandGroup>}
                </CommandList>
            </Command>
        </CommandDialog>
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
                {/* <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <UserIcon />
                    User Settings
                </DropdownMenuItem> */}
                <DropdownMenuItem variant="destructive" onClick={() => {
                    window.open(process.env.NEXT_PUBLIC_KEYSTONE_URL + "/auth/logout?redirectTo=" + encodeURIComponent(window.location.origin))
                }}>
                    <LogOutIcon />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </header>
}

function AboutClatterDialog({open, setOpen}: {open: boolean, setOpen: (data: boolean) => void}) {
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>About Clatter</DialogTitle>
                <DialogDescription>Clatter is an open source communications platform built by Quntem</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant={"outline"} onClick={() => window.open("https://github.com/Quntem/clatter-next/")}>
                    <CodeIcon />GitHub
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}