"use client";

import { QueryClient, QueryKey, skipToken, useQueryClient } from "@tanstack/react-query";
import { trpc } from "./trpc";
import { getQueryKey } from "@trpc/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useWorkspace(slug: string): ReturnType<typeof trpc.workspace.get.useQuery> {
  return trpc.workspace.get.useQuery({slug}, { staleTime: 30000 })
}

export function useMembership(workspaceId: string | undefined): ReturnType<typeof trpc.workspace.getMembership.useQuery> {
  return trpc.workspace.getMembership.useQuery(workspaceId ? {workspaceId} : skipToken, { staleTime: 30000 })
}

export function useChannel(channelId: string): ReturnType<typeof trpc.channel.get.useQuery> {
  return trpc.workspace.get.useQuery({id: channelId}, { staleTime: 5000 })
}

let navToken = 0

export function useReadyNavigation() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const go = useCallback(async (href: string, load: () => Promise<unknown>) => {
    const token = ++navToken
    try { await load() } catch {}
    if (token === navToken) router.push(href)
  }, [router])

  return {
    toWorkspace: (slug: string) => go(`/client/${slug}/directory`, async () => {
      const ws = await utils.workspace.get.fetch({slug}, { staleTime: 30000 })
      await utils.workspace.getMembership.fetch({workspaceId: ws.id}, { staleTime: 30000 })
    }),
    toChannel: (slug: string, channelId: string) => go(`/client/${slug}/channel/${channelId}`, () => utils.channel.get.fetch({id: channelId}, { staleTime: 5000 })),
  }
}