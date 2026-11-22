"use client"
import { ClientHeader } from "@/components/client/header";
import { AuthProvider } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenuButton, SidebarProvider } from "@workspace/ui/components/sidebar";
import { ArrowLeftIcon, HandshakeIcon, HashIcon, IdCardLanyardIcon, InfoIcon, UsersIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";

export default function adminLayout({children, params}: {children: React.ReactNode, params: Promise<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const router = useRouter()
    const path = usePathname()
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    return <div className="flex flex-row fixed top-0 left-0 w-[100dvw] h-[100dvh] bg-background">
        <Sidebar>
            <SidebarHeader>
                <Item className="p-2 pb-1">
                    <ItemMedia className="bg-black" variant={"image"}>
                        <img src={workspace?.data?.image || "/client/assets/wsicon.png"} />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>{workspace.data?.name}</ItemTitle>
                        <ItemDescription>{workspace.data?.slug}</ItemDescription>
                    </ItemContent>
                </Item>
                <SidebarMenuButton onClick={() => router.push("/client/" + workspaceslug)}>
                    <ArrowLeftIcon /> Return to Client
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Resources</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuButton onClick={() => router.push("/admin/" + workspaceslug + "/members")} isActive={path == "/admin/" + workspaceslug + "/members"}>
                            <IdCardLanyardIcon />Members
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <UsersIcon />Groups
                        </SidebarMenuButton>
                        <SidebarMenuButton onClick={() => router.push("/admin/" + workspaceslug + "/channels")} isActive={path == "/admin/" + workspaceslug + "/channels"}>
                            <HashIcon />Channels
                        </SidebarMenuButton>
                        <SidebarMenuButton onClick={() => router.push("/admin/" + workspaceslug + "/external-connections")} isActive={path == "/admin/" + workspaceslug + "/external-connections"}>
                            <HandshakeIcon />External Connections
                        </SidebarMenuButton>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuButton onClick={() => router.push("/admin/" + workspaceslug + "/workspace-info")} isActive={path == "/admin/" + workspaceslug + "/workspace-info"}>
                            <InfoIcon />Workspace Info
                        </SidebarMenuButton>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            {children}
        </SidebarInset>
    </div>
}
