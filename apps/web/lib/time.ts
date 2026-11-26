"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) timer = setInterval(() => listeners.forEach(l => l()), 15000)
  return () => {
    listeners.delete(listener)
    if (!listeners.size && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

const currentMinute = () => Math.floor(Date.now() / 60000) * 60000

export function useNow() {
  return useSyncExternalStore(subscribe, currentMinute, currentMinute);
}

export function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function formatMessageTime(date: Date, now: number) {
  const minutes = Math.floor((now - date.getTime()) / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`

  const time = formatClock(date)
  const midnight = new Date(date).setHours(0, 0, 0, 0)
  const today = new Date(now).setHours(0, 0, 0, 0)
  const days = Math.round((today - midnight) / 86400000)

  if (days <= 0) return `Today at ${time}`
  if (days === 1) return `Yesterday at ${time}`
  if (days < 7) return `${date.toLocaleDateString([], { weekday: "short" })} ${time}`
  const sameYear = new Date(now).getFullYear() === date.getFullYear()
  return `${date.toLocaleDateString([], { month: "short", day: "numeric", year: sameYear ? undefined : "numeric" })} ${time}`
}