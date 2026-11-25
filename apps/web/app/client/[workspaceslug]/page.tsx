"use client"
import { getLastChannel } from "@/lib/lastChannel";
import { useWorkspace } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function Page({params}: {params: Promise<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const router = useRouter()
    const workspace = useWorkspace(workspaceslug)

    useEffect(() => {
        if (!workspace.data) return
        const last = getLastChannel(workspaceslug)
        const valid = !!last && workspace.data.channels.some(item => item.id === last)
        router.replace(valid ? `/client/${workspaceslug}/channel/${last}` : `/client/${workspaceslug}/directory`)
    }, [workspace.data, workspaceslug, router]);

    return null
}