"use client";

import { QueryClient, QueryKey, skipToken, useQueryClient } from "@tanstack/react-query";
import { trpc } from "./trpc";
import { getQueryKey } from "@trpc/react-query";

function latestCached<T>(queryClient: QueryClient, key: QueryKey, previous: T | undefined): T | undefined {
  if (previous !== undefined) return previous
  let latest: { at: number; data: unknown } | undefined
  for (const query of queryClient.getQueryCache().findAll({ queryKey: key })) {
    if (query.state.data === undefined) continue
    if (!latest || query.state.dataUpdatedAt > latest.at) {
      latest = { at: query.state.dataUpdatedAt, data: query.state.data }
    }
  }
  return latest?.data as T | undefined
}

export function useWorkspace(slug: string): ReturnType<typeof trpc.workspace.get.useQuery> {
  const queryClient = useQueryClient()
  return trpc.workspace.get.useQuery({slug}, {
    placeholderData: previous => latestCached(queryClient, getQueryKey(trpc.workspace.get), previous)
  })
}

export function useMembership(workspaceId: string | undefined): ReturnType<typeof trpc.workspace.getMembership.useQuery> {
  const queryClient = useQueryClient()
  return trpc.workspace.getMembership.useQuery(workspaceId ? {workspaceId} : skipToken, {
    placeholderData: previous => latestCached(queryClient, getQueryKey(trpc.workspace.getMembership), previous)
  })
}

export function useChannel(channelId: string): ReturnType<typeof trpc.channel.get.useQuery> {
  const queryClient = useQueryClient()
  return trpc.channel.get.useQuery({id: channelId}, {
    placeholderData: previous => latestCached(queryClient, getQueryKey(trpc.channel.get), previous)
  })
}