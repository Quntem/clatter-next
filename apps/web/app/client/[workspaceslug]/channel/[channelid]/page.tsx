"use client"
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@workspace/ui/components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@workspace/ui/components/ui/emoji-picker";
import { PlusIcon, SendIcon, SmileIcon, User, UserIcon } from "lucide-react";
import React, { use, useEffect, useMemo, useState } from "react";
import { useChannel, useMembership, useWorkspace } from "@/lib/queries";
import { setLastChannel } from "@/lib/lastChannel";
import { formatClock, formatMessageTime, useNow } from "@/lib/time";
import { cn } from "@workspace/ui/lib/utils";

export default function({params}: {params: Promise<{workspaceslug: string, channelid: string}>}) {
    const { workspaceslug, channelid } = use(params)
    const workspace = useWorkspace(workspaceslug)
    const membership = useMembership(workspace.data?.id)
    const channel = useChannel(channelid)
    const ready = !!workspace.data && !!channel.data && !workspace.isPlaceholderData && !channel.isPlaceholderData
    const isMember = ready && !!workspace.data?.channels.some(item => item.id === channel.data?.id)
    const [liveMessages, setLiveMessages] = useState<MessageView[]>([])
    const [inputContent, setInputContent] = useState("")
    const channelMessages = channel.data?.messages
    const channelLoaded = !!channel.data
    useEffect(() => {
        if (channelLoaded) setLastChannel(workspaceslug, channelid)
    }, [channelLoaded, workspaceslug, channelid])
    const messages = useMemo(() => {
        const fetched = (channelMessages ?? []) as MessageView[]
        return channel.isPlaceholderData ? [] : sortMessages([...fetched, ...liveMessages])
    }, [channelMessages, channel.isPlaceholderData, liveMessages])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [anchorId, setAnchorId] = useState<string | null>(null)
    const selectedMessages = useMemo(() => messages.filter(item => selectedIds.has(item.id)), [messages, selectedIds])
    const clearSelection = () => {
        setSelectedIds(new Set())
        setAnchorId(null)
    }
    const selectMessage = (id: string, ev: React.MouseEvent) => {
        if (window.getSelection()?.toString()) return
        const multi = ev.ctrlKey || ev.metaKey
        if (ev.shiftKey && anchorId) {
            const from = messages.findIndex(item => item.id === anchorId)
            const to = messages.findIndex(item => item.id === id)
            if (from !== -1 && to !== -1) {
                const [start, end] = from < to ? [from, to] : [to, from]
                setSelectedIds(new Set(messages.slice(start, end + 1).map(item => item.id)))
                return
            }
        }
        setSelectedIds(current => {
            const next = new Set(multi ? current : [])
            if (current.has(id) && (multi || current.size === 1)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
        setAnchorId(id)
    }
    useEffect(() => {
        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === "Escape") {
                clearSelection()
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    })
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
                return <MessageItem key={item.id} message={item} compact={(index !== 0) && (messages[index - 1]?.sentById == item.sentById)} selected={selectedIds.has(item.id)} onSelect={ev => selectMessage(item.id, ev)} />
            })}
            {/* <MessageItem />
            <MessageItem compact /> */}
        </div>
        <div className={`w-full p-6 pt-0 ${!ready || isMember ? "" : " border-t"}`}>
            {selectedMessages.length > 0 && <div className="mb-3 flex flex-row items-center gap-2 rounded-md border bg-muted px-3 py-1.5 text-sm">
                <span>{selectedMessages.length} selected</span>
                <div className="flex-1" />
                <Button size={"sm"} variant={"ghost"} onClick={clearSelection}>Clear</Button>
            </div>}
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

function MessageItem({compact=false, message, selected=false, onSelect}: {compact?: boolean, message: MessageView, selected?: boolean, onSelect?: (ev: React.MouseEvent) => void}) {
    return <div
        data-selected={selected}
        onClick={onSelect}
        onMouseDown={ev => { if (ev.shiftKey) ev.preventDefault() }}
        className={cn(
            "group w-full px-6 pb-1 pt-1 flex flex-row gap-3 cursor-default",
            selected ? "bg-primary/10" : "hover:bg-black/5"
        )}
    >
        {compact
            ? <div className="w-10 shrink-0 mt-0.5 text-center text-[10px] leading-5 text-muted-foreground opacity-0 group-hover:opacity-100">
                <MessageTime date={message.createdAt} clock />
            </div>
            : <div className="h-10 w-10 rounded-md border bg-muted mt-0.5 flex flex-col items-center justify-center overflow-hidden">
                {message.sentBy?.profilePicture ? <img src={message.sentBy.profilePicture} /> : <User size={20} />}
            </div>}
        <div className="flex flex-col">
            {!compact && <div className="flex flex-row items-center gap-2">
                <div className="font-semibold text-sm">{message.sentBy?.name}</div>
                <MessageTime date={message.createdAt} className="text-xs text-muted-foreground" />
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

function MessageTime({ date, clock = false, className }: { date: Date | string, clock?: boolean, className?: string }) {
    const now = useNow()
    const value = new Date(date)
    return <time
        dateTime={value.toISOString()}
        title={value.toLocaleString([], { dateStyle: "full", timeStyle: "medium" })}
        className={className}
    >
        {clock ? formatClock(value) : formatMessageTime(value, now)}
    </time>
}
