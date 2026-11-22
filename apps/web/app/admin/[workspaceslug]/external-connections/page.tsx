"use client"
import { skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@workspace/ui/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { TrashIcon } from "lucide-react";
import { use } from "react";

export default function ExternalConnectionsPage({params}: {params: Promise<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    const workspace = trpc.workspace.get.useQuery({slug: workspaceslug})
    const membership = trpc.workspace.getMembership.useQuery(workspace.data ? {workspaceId: workspace.data.id} : skipToken)
    const acceptExternalConnection = trpc.workspace.acceptExternalConnection.useMutation({
        onSuccess: () => workspace.refetch()
    })
    const removeExternalConnection = trpc.workspace.removeExternalConnection.useMutation({
        onSuccess: () => workspace.refetch()
    })
    const connections = workspace.data?.externalConnections ?? []

    return <div className="p-8">
        <div className="flex w-full items-center">
            <h1 className="text-2xl font-medium">External Connections</h1>
            <div className="flex-1" />
        </div>
        <div className="mt-6 w-full overflow-hidden rounded-lg border-1">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Workspace</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[160px]" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {connections.map(connection => <TableRow key={connection.id}>
                        <TableCell>{connection.channel.workspace.name}</TableCell>
                        <TableCell>#{connection.channel.name}</TableCell>
                        <TableCell>{connection.accepted ? "Connected" : "Invite pending"}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end gap-2">
                                {!connection.accepted && <Button
                                    disabled={membership.data?.role === "MEMBER" || acceptExternalConnection.isPending}
                                    onClick={() => acceptExternalConnection.mutate({connectionId: connection.id})}
                                >Accept</Button>}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    aria-label="Remove external connection"
                                    disabled={membership.data?.role === "MEMBER" || removeExternalConnection.isPending}
                                    onClick={() => removeExternalConnection.mutate({connectionId: connection.id})}
                                ><TrashIcon /></Button>
                            </div>
                        </TableCell>
                    </TableRow>)}
                    {connections.length === 0 && <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No external connections yet.</TableCell>
                    </TableRow>}
                </TableBody>
            </Table>
        </div>
        {(acceptExternalConnection.error || removeExternalConnection.error) && <p className="mt-3 text-sm text-destructive">{acceptExternalConnection.error?.message || removeExternalConnection.error?.message}</p>}
    </div>
}
