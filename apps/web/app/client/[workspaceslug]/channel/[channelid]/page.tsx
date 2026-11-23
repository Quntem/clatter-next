"use client"
import { keepPreviousData, skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@workspace/ui/components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@workspace/ui/components/ui/emoji-picker";
import { CrownIcon, PlusIcon, SendIcon, SmileIcon, UserIcon } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { useChannel, useMembership, useWorkspace } from "@/lib/queries";

export default function({params}: {params: Promise<{workspaceslug: string, channelid: string}>}) {
    const { workspaceslug, channelid } = use(params)
    const workspace = useWorkspace(workspaceslug)
    const membership = useMembership(workspace.data?.id)
    const channel = useChannel(channelid)
    const ready = !!workspace.data && !channel.data && !workspace.isPlaceholderData && !channel.isPlaceholderData
    const isMember = ready && !!workspace.data?.channels.some(item => item.id === channel.data?.id)
    const [liveMessages, setLiveMessages] = useState<MessageView[]>([])
    const [inputContent, setInputContent] = useState("")
    const channelMessages = channel.data?.messages
    const messages = useMemo(() => {
        const fetched = (channelMessages ?? []) as MessageView[]
        return channel.isPlaceholderData ? [] : sortMessages([...fetched, ...liveMessages])
    }, [channelMessages, channel.isPlaceholderData, liveMessages])
    const channelTitle = !channel.data || channel.isPlaceholderData ? "" : channel.data.visibility !== "DIRECT" ? "#" + channel.data.name : (channel.data.members.filter(item => item.userId !== membership.data?.id)[0]?.membership.name ?? "")
    const messagesListen = trpc.channel.listenMessages.useSubscription({channelId: channelid}, {
        onData: (data) => {
            setLiveMessages(current => [...current, data as MessageView])
        }
    })
    const sendMessageMutation = trpc.channel.sendMessage.useMutation()
    return <div className="flex h-full w-full flex-col">
        <div className="flex-1 flex flex-col py-4">
            <div className="flex-1 flex flex-col px-6 pb-4">
                <div className="flex-1" />
                <div className="text-xl mb-1">
                    {channelTitle}
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
        <div className={`w-full p-6 pt-0 ${!ready || isMember ? "" : " border-t"}`}>
            {!ready ? null : isMember ? <InputGroup>
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
                }} rows={1} placeholder={`Message ${channelTitle}`} />
                <InputGroupAddon className="flex flex-row" align={"block-end"}>
                    {/* <Button size="icon-sm">
                        <PlusIcon />
                    </Button> */}
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

type MessageView = {
    id: string
    createdAt: Date | string
    sentById: string
    sentBy?: { name?: string | null; profilePicture?: string | null }
    content: { blocks?: { type: string; content?: string }[] } | null
}

function sortMessages(messages: MessageView[]) {
    return [...new Map(messages.map(message => [message.id, message])).values()].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id.localeCompare(b.id)
    )
}

function JoinChanelRow({channel, workspace, messagesListen}: {channel: {data: any; refetch: () => Promise<unknown>}, workspace: {data: any; refetch: () => Promise<unknown>}, messagesListen: {reset: () => void}}) {
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
            joinChannelMutation.mutate({channelId: channel?.data?.id, workspaceId: workspace.data?.id })
        }}>
            <PlusIcon />Join
        </Button>
    </div>
}

function MessageItem({compact=false, message}: {compact?: boolean, message: MessageView}) {
    return <div className="w-full px-6 pb-1 pt-1 hover:bg-black/5 flex flex-row gap-3">
        {compact ? <div className="w-[40px] mt-0.5" /> : <div className="h-[40px] w-[40px] rounded-md border-1 bg-muted mt-0.5 flex flex-col items-center justify-center overflow-hidden">
            {message.sentBy?.profilePicture ? <img src={message.sentBy.profilePicture} /> : <UserIcon size={20} />}
        </div>}
        <div className="flex flex-col">
            {!compact && <div className="flex flex-row items-center gap-2">
                <div className="font-semibold text-sm">{message.sentBy?.name}</div>
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
