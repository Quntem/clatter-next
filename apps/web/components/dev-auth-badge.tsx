"use client"

import { useDevSession } from "@/lib/devAuth"

export function DevAuthBadge() {
  const session = useDevSession()
  if (!session) return null
  return <div className="fixed bottom-2 right-2 z-50 rounded-md bg-foreground px-2 py-1 font-mono text-xs text-background opacity-80 select-all">
    {session.user.email}
  </div>
}