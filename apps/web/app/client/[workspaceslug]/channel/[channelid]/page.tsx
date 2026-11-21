"use client"
import { trpc } from "@/lib/trpc";
import { Channel, Message } from "@workspace/backend/generated/prisma/client";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@workspace/ui/components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@workspace/ui/components/ui/emoji-picker";
import { CrownIcon, PlusIcon, SendIcon, SmileIcon } from "lucide-react";
import { Usable, use, useEffect, useState } from "react";

export default function({params}: {params: Usable<{workspaceslug: string, channelid: string}>}) {
    const { workspaceslug, channelid } = use(params)
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    const membership = trpc.workspace.getMembership.useQuery({workspaceId: workspace.data?.id})
    const channel = trpc.channel.get.useQuery({id: channelid})
    const [messages, setMessages] = useState<Message[]>([])
    const [inputContent, setInputContent] = useState("")
    useEffect(() => {
        if (!channel.data || !channel.data.messages) return
        if (messages?.length == 0) {
            setMessages(channel.data?.messages)
        }
    }, [channel, messages])
    const messagesListen = trpc.channel.listenMessages.useSubscription({channelId: channelid}, {
        onData: (data) => {
            console.log(data)
            setMessages([...messages, data])
        }
    })
    const sendMessageMutation = trpc.channel.sendMessage.useMutation()
    return <div className="flex h-full w-full flex-col">
        <div className="flex-1 flex flex-col py-4">
            <div className="flex-1 flex flex-col px-6 pb-4">
                <div className="flex-1" />
                <div className="text-xl mb-1">
                    {channel.data?.visibility !== "DIRECT" ? "#" + channel.data?.name : channel.data.members.filter(item => item.userId !== membership.data?.id)[0]?.membership.name}
                </div>
                <div className="mb-4">This is the start of this {channel.data?.visibility !== "DIRECT" ? "channel" : "conversation"}</div>
                <Separator />
            </div>
            {messages?.map((item, index) => {
                return <MessageItem key={item.id} message={item} compact={(index !== 0) && (messages[index - 1]?.sentById == item.sentById)} />
            })}
            {/* <MessageItem />
            <MessageItem compact /> */}
        </div>
        <div className={`w-full p-6 pt-0 ${workspace.data?.channels.find(item => item.id == channel.data?.id) ? "" : " border-t-1"}`}>
            {workspace.data?.channels.find(item => item.id == channel.data?.id) ? <InputGroup>
                <InputGroupTextarea value={inputContent} onChange={ev => setInputContent(ev.target.value)} onKeyDown={(ev) => {
                    if (!ev.shiftKey && ev.key == "Enter") {
                        ev.preventDefault()
                        sendMessageMutation.mutateAsync({workspaceId: workspace.data?.id, channelId: channelid, content: {
                            blocks: [
                                {
                                    type: "text",
                                    content: inputContent
                                }
                            ]
                        }}).then(() => {
                            setInputContent("")
                        })
                    }
                }} rows={1} placeholder={`Message ${channel.data?.visibility !== "DIRECT" ? "#" + channel.data?.name : channel.data.members.filter(item => item.userId !== membership.data?.id)[0]?.membership.name}`} />
                <InputGroupAddon className="flex flex-row" align={"block-end"}>
                    <Button size="icon-sm">
                        <PlusIcon />
                    </Button>
                    <Popover>
                        <PopoverTrigger render={<Button size="icon-sm" variant={"ghost"}>
                            <SmileIcon />
                        </Button>} />
                        <PopoverContent className={"p-0 w-fit"}>
                            <EmojiPicker
                                className="h-85.5"
                                onEmojiSelect={({ emoji }) => {
                                    setInputContent(inputContent + emoji)
                                }}
                            >
                                <EmojiPickerSearch />
                                <EmojiPickerContent />
                                <EmojiPickerFooter />
                            </EmojiPicker>
                        </PopoverContent>
                    </Popover>
                    <div className="flex-1" />
                    <Button size="icon-sm" onClick={() => {
                        sendMessageMutation.mutateAsync({workspaceId: workspace.data?.id, channelId: channelid, content: {
                            blocks: [
                                {
                                    type: "text",
                                    content: inputContent
                                }
                            ]
                        }}).then(() => {
                            setInputContent("")
                        })
                    }}>
                        <SendIcon />
                    </Button>
                </InputGroupAddon>
            </InputGroup> : <JoinChanelRow channel={channel} workspace={workspace} messagesListen={messagesListen} />}
        </div>
    </div>
}

function JoinChanelRow({channel, workspace, messagesListen}: {channel: ReturnType<typeof trpc.channel.get.useQuery>, workspace: ReturnType<typeof trpc.workspace.get.useQuery>, messagesListen: ReturnType<typeof trpc.channel.listenMessages.useSubscription>}) {
    const joinChannelMutation = trpc.channel.joinPublicChannel.useMutation({
        onSuccess: () => {
            channel.refetch()
            workspace.refetch()
            messagesListen.reset()
        }
    })
    return <div className="flex flex-row pt-6 w-full items-center">
        <div className="text-lg">#{channel?.data?.name}</div>
        <div className="flex-1" />
        <Button onClick={() => {
            joinChannelMutation.mutate({channelId: channel?.data?.id, workspaceId: channel?.data?.workspaceId })
        }}>
            <PlusIcon />Join
        </Button>
    </div>
}

function MessageItem({compact=false, message}: {compact?: boolean, message: Message}) {
    return <div className="w-full px-6 pb-1 pt-1 hover:bg-black/5 flex flex-row gap-3">
        {compact ? <div className="w-[40px] mt-0.5" /> : <div className="h-[40px] w-[40px] rounded-md border-1 bg-muted mt-0.5">
            
        </div>}
        <div className="flex flex-col">
            {!compact && <div className="flex flex-row items-center gap-2">
                <div className="font-semibold text-sm">{message.sentBy.name}</div>
                <div className="text-sm">{new Date(message.createdAt).toLocaleTimeString()}</div>
                {/* <CrownIcon size="12" /> */}
            </div>}
            <div>{message?.content?.blocks?.map((block, index) => {
                console.log(block)
                if (block.type == "text") {
                    return <div key={index}>{block.content}</div>
                }
            })}</div>
        </div>
    </div>
}