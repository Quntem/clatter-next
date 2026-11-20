"use client"
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Separator } from "@workspace/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { ClockIcon, EyeIcon, FingerprintIcon, HashIcon, InfoIcon, LockIcon, MessageSquareIcon, MoreHorizontalIcon, MoreVerticalIcon, SearchIcon, UserIcon, UsersIcon } from "lucide-react";
import { Usable, use } from "react";

export default function({children, params}: {children: React.JSX.Element, params: Usable<{workspaceslug: string, channelid: string}>}) {
    const { workspaceslug, channelid } = use(params)
    const channel = trpc.channel.get.useQuery({id: channelid})
    return <div className="flex flex-col w-full h-full">
        <div className="h-[50px] w-full border-b-1 px-2 flex flex-row items-center">
            <Dialog>
                <DialogTrigger render={<Button variant={"ghost"}>
                    {channel.data?.visibility == "PRIVATE" ? <LockIcon /> : <HashIcon />}
                    {channel.data?.name}
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
                        <TabsContent value={"members"} className="p-4 flex flex flex-col gap-2">
                            <div className="flex flex-row items-center">
                                <div className="text-lg font-medium">
                                    Members ({channel.data?.members.length})
                                </div>
                            </div>
                            <ItemGroup className="rounded-lg border-1 overflow-hidden gap-0">
                                {channel.data?.members.map((item, index) => {
                                    return <div key={item.id}>
                                        {index !== 0 && <Separator />}
                                        <Item>
                                            <ItemMedia variant={"icon"}>
                                                <UserIcon />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle>{item.membership.name}: {item.role}</ItemTitle>
                                            </ItemContent>
                                        </Item>
                                    </div>
                                })}
                            </ItemGroup>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
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