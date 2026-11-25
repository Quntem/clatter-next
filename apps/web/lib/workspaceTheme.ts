"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

export type WorkspaceTheme = "default" | "blue";

function read(): Record<string, WorkspaceTheme> {
  try {
    return JSON.parse(localStorage.getItem("clatter-workspace-themes") ?? "{}")
  } catch {
    return {}
  }
}

function subscribe(listener: () => void) {
  new Set<() => void>().add(listener)
  window.addEventListener("storage", listener)
  return () => {
    new Set<() => void>().delete(listener)
    window.removeEventListener("storage", listener)
  }
}

export function setWorkspaceTheme(slug: string, theme: WorkspaceTheme) {
  try {
    localStorage.setItem("clatter-workspace-themes", JSON.stringify({ ...read(), [slug]: theme }))
  } catch {}
  new Set<() => void>().forEach(listener => listener())
}

export function useWorkspaceTheme(slug: string | undefined): WorkspaceTheme {
  return useSyncExternalStore(subscribe, () => (slug ? read()[slug]: undefined) ?? "default", () => "default")
}

export function useApplyWorkspaceTheme(slug: string) {
  const theme = useWorkspaceTheme(slug)
  useLayoutEffect(() => {
    const root = document.documentElement
    if (theme === "default") {
      root.removeAttribute("data-workspace-theme")
    } else {
      root.setAttribute("data-workspace-theme", theme)
    }
    return () => root.removeAttribute("data-workspace-theme")
  }, [theme])
}