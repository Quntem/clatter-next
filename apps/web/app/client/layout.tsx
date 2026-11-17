"use client"
import { ClientHeader } from "@/components/client/header";
import { WorkspaceSwitcherSidebar } from "@/components/client/WorkspaceSwitcher";
import React from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenuButton, SidebarProvider } from "@workspace/ui/components/sidebar"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button";
import { BookUserIcon, ChevronDownIcon, CrownIcon, ExternalLinkIcon, GridIcon, HandshakeIcon, HashIcon, IdCardIcon, LayoutGridIcon, LockIcon, LogOutIcon, PaintbrushIcon, SettingsIcon, SparklesIcon, SquarePenIcon, UserIcon, UserPlusIcon, UserShield, UsersIcon, WrenchIcon } from "lucide-react";
import { AuthProvider } from "@/lib/auth";

export default function ClientLayout({children}: {children: React.JSX.Element}) {
    return <AuthProvider><SidebarProvider><div className="flex flex-col fixed top-0 left-0 w-[100dvw] h-[100dvh] bg-background">
        <ClientHeader />
        <div className="flex-1 flex flex-row">
            <WorkspaceSwitcherSidebar />
            {children}
        </div>
    </div></SidebarProvider></AuthProvider>
}