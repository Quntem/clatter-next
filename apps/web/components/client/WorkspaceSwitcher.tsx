"use client"
import { useState } from "react"

export function WorkspaceSwitcherSidebar() {
    const [workspaceId, setWorkspaceId] = useState(0)

    return <div className="bg-muted w-[70px] border-r-1 h-full flex flex-col items-center gap-4 pt-4">
        <WorkspaceSwitcherSidebarItem active={workspaceId == 0} onClick={() => setWorkspaceId(0)} />
        <WorkspaceSwitcherSidebarItem active={workspaceId == 1} onClick={() => setWorkspaceId(1)} />
        <WorkspaceSwitcherSidebarItem active={workspaceId == 2} onClick={() => setWorkspaceId(2)} />
    </div>
}

export function WorkspaceSwitcherSidebarItem({active, onClick}: {active?: boolean, onClick?: () => void}) {
    return <div className={`w-[40px] h-[40px] rounded-lg border-foreground transition-all ${active ? "border-2 p-0.5" : "border-0"}`} onClick={onClick}>
        <div className={`bg-black w-full h-full transition-all ${active ? "rounded-sm" : "rounded-lg"}`}></div>
    </div>
}