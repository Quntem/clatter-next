"use client";

import { skipToken } from "@tanstack/react-query";
import { trpc } from "./trpc";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getLastChannel } from "./lastChannel";

export function useWorkspace(slug: string): ReturnType<typeof trpc.workspace.get.useQuery> {
  return trpc.workspace.get.useQuery({slug}, { staleTime: 30000 })
}

export function useMembership(workspaceId: string | undefined): ReturnType<typeof trpc.workspace.getMembership.useQuery> {
  return trpc.workspace.getMembership.useQuery(workspaceId ? {workspaceId} : skipToken, { staleTime: 30000 })
}

export function useChannel(channelId: string): ReturnType<typeof trpc.channel.get.useQuery> {
  return trpc.channel.get.useQuery({id: channelId}, { staleTime: 5000 })
}

let navToken = 0

export function useReadyNavigation() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const go = useCallback(async (href: string | (() => string), load: () => Promise<unknown>) => {
    const token = ++navToken
    try { await load() } catch {}
    if (token === navToken) router.push(typeof href === "function" ? href() : href)
  }, [router])

  return {
    toWorkspace: (slug: string) => {
      let channelId: string | undefined
      return go(
        () => channelId ? `/client/${slug}/channel/${channelId}` : `/client/${slug}/directory`,
        async () => {
          const ws = await utils.workspace.get.fetch({slug}, { staleTime: 30000 })
          await utils.workspace.getMembership.fetch({workspaceId: ws.id}, { staleTime: 30000 })
          const last = getLastChannel(slug)
          if (last && ws.channels.some(item => item.id === last)) {
            await utils.channel.get.fetch({id: last}, { staleTime: 5000 })
            channelId = last
          }
        }
      )
    },
    toChannel: (slug: string, channelId: string) => go(`/client/${slug}/channel/${channelId}`, () => utils.channel.get.fetch({id: channelId}, { staleTime: 5000 })),
  }
}