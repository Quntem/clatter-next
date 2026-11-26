"use client"

import { trpc } from "@/lib/trpc"
import { skipToken } from "@tanstack/react-query"
import { cn } from "@workspace/ui/lib/utils"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function SplashScreen({ visible }: { visible: boolean }) {
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      return
    }
    const timeout = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(timeout)
  }, [visible])

  if (!mounted) return null

  return <div className={cn(
    "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-300",
    visible ? "opacity-100" : "opacity-0 pointer-events-none"
  )}>
    <img src={"/home/icon/regular_64x64.png"} height={64} width={64} alt="Clatter" />
  </div>
}

export function ClientSplash() {
  const pathname = usePathname()
  const slug = pathname.split("/")[2]
  const [done, setDone] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)

  const workspaces = trpc.workspace.list.useQuery()
  const workspace = trpc.workspace.get.useQuery(slug && !done ? { slug } : skipToken, { staleTime: 30000 })

  useEffect(() => {
    const timeout = setTimeout(() => setMinElapsed(true), 600)
    return () => clearTimeout(timeout)
  }, [])

  const dataReady = !workspaces.isPending && (!slug || !workspace.isPending)
  useEffect(() => {
    if (minElapsed && dataReady) setDone(true)
  }, [minElapsed, dataReady])

  return <SplashScreen visible={!done} />
}