"use client";

import { AuthState, useAuth } from "keystone-lib";
import { useDevSession } from "./devAuth";
import { useMemo } from "react";

export function useAppAuth(): AuthState {
  const keystone = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APP_ID! })
  const dev = useDevSession()
  return useMemo(() => dev
    ? ({ loaded: true, data: { sessionId: dev.sessionId, user: dev.user } } as unknown as AuthState)
    : keystone,
  [dev, keystone])
}