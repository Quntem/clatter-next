"use client"
import { AuthProvider } from "@/lib/auth";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import React from "react";

export default function AdminLayout({children}: {children: React.JSX.Element}) {
    return <AuthProvider><SidebarProvider>{children}</SidebarProvider></AuthProvider>
}