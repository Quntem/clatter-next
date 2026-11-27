"use client";

import { skipToken } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { AppRouter, RouterOutputs } from "@workspace/backend/router";
import { trpc } from "./trpc";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getLastChannel } from "./lastChannel";

type QueryResult<TData> = UseTRPCQueryResult<TData, TRPCClientErrorLike<AppRouter>>;

export function useWorkspace(slug: string): QueryResult<RouterOutputs["workspace"]["get"]> {
  return trpc.workspace.get.useQuery({slug}, { staleTime: 30000 })
}

export function useMembership(workspaceId: string | undefined): QueryResult<RouterOutputs["workspace"]["getMembership"]> {
  return trpc.workspace.getMembership.useQuery(workspaceId ? {workspaceId} : skipToken, { staleTime: 30000 })
}

export function useChannel(channelId: string): QueryResult<RouterOutputs["channel"]["get"]> {
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
