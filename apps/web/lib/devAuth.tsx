"use client";

import { useMemo, useSyncExternalStore } from "react";

export const DEV_AUTH_ENABLED = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEV_AUTH === "true"

export type DevSession = {
  sessionId: string,
  user: {
    id: string,
    name: string,
    email: string
  }
}

type DevStore = {
  active: string | null,
  accounts: DevSession[]
}

const listeners = new Set<() => void>()

function readRaw() {
  try {
    return localStorage.getItem("clatter-dev-auth")
  } catch {
    return null
  }
}

function parse(raw: string | null): DevStore {
  try {
    return raw ? JSON.parse(raw) : {active: null, accounts: []}
  } catch {
    return { active: null, accounts: [] }
  }
}

function write(store: DevStore) {
  try {
    localStorage.setItem("clatter-dev-auth", JSON.stringify(store))
  } catch {

  }
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function useDevStore(): DevStore {
  const raw = useSyncExternalStore(subscribe, DEV_AUTH_ENABLED ? readRaw : () => null, () => null)
  return useMemo(() => parse(raw), [raw])
}

export function useDevSession(): DevSession | null {
  const store = useDevStore()
  return useMemo(() => store.accounts.find(account => account.user.id === store.active) ?? null, [store])
}

export function useDevAccounts(): DevSession[] {
  return useDevStore().accounts
}

export function createDevAccount(name: string): DevSession {
  const id = "dev_" + crypto.randomUUID().replaceAll("-", "").slice(0, 12)
  const session: DevSession = {
    sessionId: `dev:${id}:${encodeURIComponent(name)}`,
    user: { id, name, email: `${id}@dev.local` },
  }
  const store = parse(readRaw())
  write({ active: id, accounts: [...store.accounts, session] })
  return session
}

export function signInDevAccount(id: string) {
  write({ ...parse(readRaw()), active: id })
}

export function signOutDevAccount() {
  write({ ...parse(readRaw()), active: null })
}