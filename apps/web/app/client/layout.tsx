"use client"
import { ClientHeader } from "@/components/client/header";
import { WorkspaceSwitcherSidebar } from "@/components/client/WorkspaceSwitcher";
import React from "react";
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { AuthProvider } from "@/lib/auth";

export default function ClientLayout({children}: {children: React.ReactNode}) {
    return (
        <AuthProvider>
            <SidebarProvider>
                <div className="flex flex-col fixed top-0 left-0 w-dvw h-dvh bg-background">
                    <title>Client - Clatter</title>
                    <ClientHeader />
                    <div className="flex-1 flex flex-row">
                        <WorkspaceSwitcherSidebar />
                        {children}
                    </div>
                </div>
            </SidebarProvider>
        </AuthProvider>
    )
}