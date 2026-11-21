"use client"
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Label } from "@workspace/ui/components/label";
import { Autocomplete, AutocompleteContent, AutocompleteEmpty, AutocompleteInput, AutocompleteItem, AutocompleteList } from "@workspace/ui/components/reui/autocomplete";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { ClockIcon, CrownIcon, EyeIcon, FingerprintIcon, HashIcon, InfoIcon, LockIcon, LogOutIcon, MessageSquareIcon, MoreHorizontalIcon, MoreVerticalIcon, PlusIcon, SearchIcon, TrashIcon, UserIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Usable, use, useState } from "react";

export default function({children, params}: {children: React.JSX.Element, params: Usable<{workspaceslug: string, channelid: string}>}) {
    const { workspaceslug, channelid } = use(params)
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    const membership = trpc.workspace.getMembership.useQuery({workspaceId: workspace.data?.id})
    const channel = trpc.channel.get.useQuery({id: channelid})
    
    const removeMemberMutaion = trpc.channel.removeUser.useMutation({
        onSuccess: () => {
            channel.refetch()
            workspace.refetch()
        }
    })
    return <div className="flex flex-col w-full h-full">
        <div className="h-[50px] w-full border-b-1 px-2 flex flex-row items-center">
            <Dialog>
                <DialogTrigger render={<Button variant={"ghost"}>
                    {channel.data?.visibility == "PRIVATE" ? <LockIcon /> : channel.data?.visibility == "DIRECT" ? <UserIcon /> : <HashIcon />}
                    {channel.data?.visibility !== "DIRECT" ? channel.data?.name : channel.data.members.filter(item => item.userId !== membership.data?.id)[0]?.membership.name}
                </Button>} />
                <DialogContent className="p-0 gap-0">
                    <DialogHeader className="p-4 pb-2">
                        <DialogTitle>#{channel?.data?.name || ""}</DialogTitle>
                    </DialogHeader>
                    <Tabs className="gap-0">
                        <div className="flex fles-row w-full h-auto border-b-1 px-2">
                            <TabsList variant={"line"}>
                                <TabsTrigger value={"about"}>
                                    <InfoIcon />
                                    About
                                </TabsTrigger>
                                <TabsTrigger value={"members"}>
                                    <UsersIcon />
                                    Members
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value={"about"} className="p-4 flex flex flex-col gap-2">
                            {/* <div className="flex flex-row items-center">
                                <div className="text-lg font-medium">
                                    Channel Info
                                </div>
                            </div> */}
                            <Item className="p-0">
                                <ItemMedia variant={"icon"}><FingerprintIcon /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Channel ID</ItemTitle>
                                    <ItemDescription>{channel.data?.id}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item className="p-0">
                                <ItemMedia variant={"icon"}><HashIcon /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Channel Name</ItemTitle>
                                    <ItemDescription>{channel.data?.name}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item className="p-0">
                                <ItemMedia variant={"icon"}><EyeIcon /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Channel Visibility</ItemTitle>
                                    <ItemDescription>{channel.data?.visibility}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item className="p-0">
                                <ItemMedia variant={"icon"}><MessageSquareIcon /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Message Count</ItemTitle>
                                    <ItemDescription>{channel.data?.messages.length}</ItemDescription>
                                </ItemContent>
                            </Item>
                        </TabsContent>
                        <TabsContent value={"members"} className="p-4 flex flex flex-col gap-4">
                            {/* <div className="flex flex-row items-center">
                                <div className="text-lg font-medium">
                                    Members ({channel.data?.members.length})
                                </div>
                            </div> */}
                            <ItemGroup className="rounded-lg border-1 overflow-hidden gap-0">
                                {channel.data?.members.map((item, index) => {
                                    return <div key={item.id}>
                                        {index !== 0 && <Separator />}
                                        <Item className="hover:bg-foreground/5 rounded-none py-1 flex">
                                            <ItemMedia variant={"icon"}>
                                                <UserIcon />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle>{item.membership.name}: {item.role}</ItemTitle>
                                            </ItemContent>
                                            <ItemActions>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger render={<Button size="icon" variant={"ghost"}>
                                                        <MoreVerticalIcon />
                                                    </Button>} />
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem variant="destructive" onClick={() => {
                                                            removeMemberMutaion.mutate({membershipId: item.id})
                                                        }}>
                                                            <TrashIcon /> Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </ItemActions>
                                        </Item>
                                    </div>
                                })}
                            </ItemGroup>
                            <AddUserToChannel channel={channel} workspaceslug={workspaceslug} />
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
            {/* <p className="text-sm text-muted-foreground ml-2">Channel Description</p> */}
            <div className="flex-1" />
            <Button variant={"ghost"} size="icon">
                <SearchIcon />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="icon" variant={"ghost"}>
                    <MoreVerticalIcon />
                </Button>} />
                <DropdownMenuContent className="w-auto">
                    <DropdownMenuItem variant="destructive" onClick={() => {
                        removeMemberMutaion.mutate({membershipId: channel.data?.members.find(member => member.userId == membership.data?.id)?.id})
                    }}>
                        <LogOutIcon /> Leave Channel
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="flex-1">
            {children}
        </div>
    </div>
}

function AddUserToChannel({channel, workspaceslug}: {channel: ReturnType<typeof trpc.channel.get.useQuery>, workspaceslug: string}) {
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    const [user, setUser] = useState("")
    const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER")
    const [dialogOpen, setDialogOpen] = useState(false)
    const addUserMigration = trpc.channel.addUser.useMutation({
        onSuccess: () => {
            channel.refetch()
            setDialogOpen(false)
        }
    })
    return <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={<Button><UserPlusIcon />Add User</Button>} />
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Invite User to #{channel.data?.name}</DialogTitle>
            </DialogHeader>
            <Autocomplete value={user} onValueChange={setUser} items={workspace.data?.memberships.map(item => {return {label: item.name, value: item.id}})} filter={(item, query) => {return item.label.toLowerCase().includes(query.toLowerCase())}}>
                <AutocompleteInput placeholder="Search..." />
                <AutocompleteContent>
                    <AutocompleteEmpty>No users found.</AutocompleteEmpty>
                    <AutocompleteList>
                    {(item) => <AutocompleteItem key={item.value} value={item.value}><UserIcon />{item.label}</AutocompleteItem>}
                    </AutocompleteList>
                </AutocompleteContent>
            </Autocomplete>
            <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="MEMBER"><UserIcon />Member</SelectItem>
                        <SelectItem value="ADMIN"><CrownIcon />Admin</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <DialogFooter>
                <Button onClick={() => {
                    console.log(user)
                    addUserMigration.mutate({userId: user, channelId: channel.data.id, role: role})
                }}><PlusIcon />Add User</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}