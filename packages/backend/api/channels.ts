import z from "zod";
import { authProcedure, t } from "../trpc";
import { ChannelRole, ChannelVisibility } from "../generated/prisma/enums";
import { prisma } from "../prisma";
import { TRPCError } from "@trpc/server";
import {EventEmitter, on} from "events"
import type { Message } from "../generated/prisma/client";

const ee = new EventEmitter()

type ChannelEvent = | {type: "message", channelId: string, message: Message } | { type: "delete", channelId: string, messageIds: string[] }

export const channelsRouter = t.router({
    create: authProcedure
        .input(z.object({
            name: z.string().toLowerCase().regex(/^\S+$/, "Spaces are not allowed"),
            visibility: z.enum(ChannelVisibility),
            workspaceId: z.string()
        }))
        .mutation(async (opts) => {
            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: opts.input.workspaceId
                },
                include: {
                    memberships: true
                }
            });

            if (!workspace) {
                throw new TRPCError({
                    message: "Workspace not found",
                    code: "NOT_FOUND"
                });
            }

            const membership = workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            return await prisma.channel.create({
                data: {
                    name: opts.input.name,
                    visibility: opts.input.visibility,
                    workspaceId: opts.input.workspaceId,
                    members: {
                        create: {
                            userId: membership.id,
                            role: "ADMIN"
                        }
                    }
                },
                include: {
                    subChannels: true,
                    parentChannel: true,
                    members: {
                        include: {
                            membership: true
                        }
                    }
                }
            });
        }),

    get: authProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async (opts) => {
            const channel = await prisma.channel.findUnique({
                where: {
                    id: opts.input.id
                },
                include: {
                    subChannels: true,
                    parentChannel: true,
                    members: {
                        include: {
                            membership: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    messages: {
                        orderBy: [
                            { createdAt: "asc" },
                            { id: "asc" }
                        ],
                        include: {
                            sentBy: true,
                            _count: {
                                select: {
                                    replies: true
                                }
                            }
                        }
                    },
                    externalConnections: {
                        include: {
                            workspace: true
                        }
                    }
                }
            });

            if (!channel) {
                throw new TRPCError({
                    message: "Channel not found",
                    code: "NOT_FOUND"
                });
            }

            const membership = await prisma.workspaceMembership.findFirst({
                where: {
                    workspaceId: channel.workspaceId,
                    userId: opts.ctx.user.id,
                    deactivated: false
                }
            });

            const connectedWorkspaceAccess = channel.visibility === ChannelVisibility.PUBLIC
                ? await prisma.externalChannelConnection.findFirst({
                    where: {
                        channelId: channel.id,
                        accepted: true,
                        workspace: { memberships: { some: { userId: opts.ctx.user.id, deactivated: false } } }
                    }
                })
                : null;

            if (!membership && !connectedWorkspaceAccess) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            if (channel.visibility !== ChannelVisibility.PUBLIC && membership) {
                const isChannelMember = channel.members.some(
                    member => member.userId === membership.id
                );

                if (!isChannelMember) {
                    throw new TRPCError({
                        message: "You are not a member of this private channel",
                        code: "FORBIDDEN"
                    });
                }
            }

            return channel;
        }),

    listenMessages: authProcedure
        .input(z.object({
            channelId: z.string()
        }))
        .subscription(async function* (opts) {
            const channelId = opts.input.channelId;

            for await (const [data] of on(ee, "channel.event", {
                signal: opts.signal
            })) {
                const event = data as ChannelEvent

                if (event.channelId === channelId) {
                    yield event
                }
            }
        }),

    sendMessage: authProcedure
        .input(z.object({workspaceId: z.string(), channelId: z.string(), content: z.any()}))
        .mutation(async (opts) => {
            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: opts.input.workspaceId
                },
                include: {
                    memberships: true
                }
            });

            if (!workspace) {
                throw new TRPCError({
                    message: "Workspace not found",
                    code: "NOT_FOUND"
                });
            }

            const workspaceMembership = workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!workspaceMembership || workspaceMembership.deactivated) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const channel = await prisma.channel.findUnique({
                where: {
                    id: opts.input.channelId
                },
                include: {
                    members: true
                }
            })

            if (!channel) {
                throw new TRPCError({
                    message: "Channel not found",
                    code: "NOT_FOUND"
                });
            }

            if (workspace.id !== channel.workspaceId) {
                const connected = channel.visibility === ChannelVisibility.PUBLIC
                    ? await prisma.externalChannelConnection.findFirst({
                        where: {
                            channelId: channel.id,
                            workspaceId: workspace.id,
                            accepted: true
                        }
                    })
                    : null;
                if (!connected) {
                    throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
                }
            }

            let channelMembership = channel.members.find(
                member => member.userId === workspaceMembership.id
            );

            // Older connections may still have a host-workspace membership recorded.
            // Keep those existing joins usable while new joins use the connected workspace identity.
            if (!channelMembership && workspace.id !== channel.workspaceId) {
                const legacyMembership = await prisma.workspaceMembership.findUnique({
                    where: { userId_workspaceId: { userId: opts.ctx.user.id, workspaceId: channel.workspaceId } }
                });
                if (legacyMembership) {
                    channelMembership = channel.members.find(member => member.userId === legacyMembership.id);
                }
            }

            if (!channelMembership) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const message = await prisma.message.create({
                data: {
                    channelId: opts.input.channelId,
                    content: opts.input.content,
                    sentById: workspaceMembership.id
                },
                include: {
                    sentBy: true
                }
            })

            ee.emit("channel.event", { type: "message", channelId: message.channelId, message } satisfies ChannelEvent)

            return message
        }),

    delete: authProcedure
        .input(z.object({channelId: z.string()}))
        .mutation(async (opts) => {
            const channel = await prisma.channel.findUnique({
                where: {
                    id: opts.input.channelId
                },
                include: {
                    members: true,
                    workspace: {
                        include: {
                            memberships: true
                        }
                    }
                }
            })

            if (!channel) {
                throw new TRPCError({
                    message: "Channel not found",
                    code: "NOT_FOUND"
                });
            }

            const membership = channel.workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const channelMembership = channel.members.find(
                member => member.userId === membership.id
            );

            if (!channelMembership || (channelMembership.role == "MEMBER" && membership.role == "MEMBER") || membership.role == "MEMBER") {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const deleted = await prisma.channel.delete({
                where: {
                    id: channel.id
                }
            })

            return deleted
        }),

    deleteMessage: authProcedure
        .input(z.object({
            channelId: z.string(),
            messageIds: z.array(z.string()).min(1).max(100)
        }))
        .mutation(async (opts) => {
            const messageIds = [...new Set(opts.input.messageIds)]

            const channel = await prisma.channel.findUnique({
                where: { id: opts.input.channelId },
                include: {
                    members: true,
                    workspace: { include: { memberships: true } }
                }
            })

            if (!channel) {
                throw new TRPCError({ message: "Channel not found", code: "NOT_FOUND" });
            }

            const membership = channel.workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership) {
                throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
            }

            const channelMembership = channel.members.find(
                member => member.userId === membership.id
            );

            if (!channelMembership) {
                throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
            }

            const messages = await prisma.message.findMany({
                where: { id: { in: messageIds }, channelId: channel.id },
                select: { id: true, sentById: true }
            })

            if (messages.length !== messageIds.length) {
                throw new TRPCError({ message: "Message not found", code: "NOT_FOUND" });
            }

            const ownsAll = messages.every(message => message.sentById === membership.id)
            const isModerator = membership.role !== "MEMBER"

            if (!ownsAll && !isModerator) {
                throw new TRPCError({ message: "Unauthorized", code: "FORBIDDEN" });
            }

            await prisma.message.deleteMany({
                where: { id: { in: messageIds }, channelId: channel.id }
            })

            ee.emit("channel.event", { type: "delete", channelId: channel.id, messageIds } satisfies ChannelEvent)

            return { deletedIds: messageIds }
        }),

    removeUser: authProcedure
        .input(z.object({membershipId: z.string()}))
        .mutation(async (opts) => {
            const targetChannelMembership = await prisma.channelMembership.findUnique({
                where: {
                    id: opts.input.membershipId
                },
                include: {
                    channel: {
                        include: {
                            members: true,
                            workspace: {
                                include: {
                                    memberships: true
                                }
                            }
                        }
                    }
                }

            })

            if (!targetChannelMembership) {
                throw new TRPCError({
                    message: "Membership not found",
                    code: "NOT_FOUND"
                });
            }

            const actorMemberships = await prisma.workspaceMembership.findMany({
                where: {
                    userId: opts.ctx.user.id,
                    deactivated: false,
                    OR: [
                        { workspaceId: targetChannelMembership.channel.workspaceId },
                        {
                            workspace: {
                                externalConnections: {
                                    some: {
                                        channelId: targetChannelMembership.channel.id,
                                        accepted: true
                                    }
                                }
                            }
                        }
                    ]
                }
            });
            const actorChannelMembership = actorMemberships.find(membership =>
                targetChannelMembership.channel.members.some(member => member.userId === membership.id)
            );

            if (!actorChannelMembership) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const channelMembership = targetChannelMembership.channel.members.find(member =>
                member.userId === actorChannelMembership.id
            );

            if (!channelMembership || (channelMembership.role === "MEMBER" && actorChannelMembership.role === "MEMBER" && targetChannelMembership.id !== channelMembership.id) || (actorChannelMembership.role === "MEMBER" && targetChannelMembership.id !== channelMembership.id)) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            return await prisma.channelMembership.delete({
                where: {
                    id: targetChannelMembership.id
                }
            })
        }),

    addUser: authProcedure
        .input(z.object({userId: z.string(), channelId: z.string(), role: z.enum(ChannelRole)}))
        .mutation(async (opts) => {
            const channel = await prisma.channel.findUnique({
                where: {
                    id: opts.input.channelId
                },
                include: {
                    members: true,
                    workspace: {
                        include: {
                            memberships: true
                        }
                    }
                }
            })

            if (!channel) {
                throw new TRPCError({
                    message: "Channel not found",
                    code: "NOT_FOUND"
                });
            }

            const membership = channel.workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership || membership.deactivated) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const channelMembership = channel.members.find(
                member => member.userId === membership.id
            );

            if (!channelMembership || (channelMembership.role == "MEMBER" && membership.role == "MEMBER") || membership.role == "MEMBER") {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const newMembership = await prisma.channelMembership.create({
                data: {
                    userId: opts.input.userId,
                    channelId: opts.input.channelId,
                    role: opts.input.role
                }
            })

            return newMembership
        }),

    joinPublicChannel: authProcedure
        .input(z.object({channelId: z.string(), workspaceId: z.string()}))
        .mutation(async (opts) => {
            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: opts.input.workspaceId
                },
                include: {
                    memberships: true
                }
            });

            if (!workspace) {
                throw new TRPCError({
                    message: "Workspace not found",
                    code: "NOT_FOUND"
                });
            }

            const membership = workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership || membership.deactivated) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const channel = await prisma.channel.findUnique({
                where: {
                    id: opts.input.channelId
                },

                include: {
                    members: {
                        include: {
                            membership: true
                        }
                    }
                }
            })

            if (!channel) {
                throw new TRPCError({
                    message: "Channel not found",
                    code: "NOT_FOUND"
                });
            }

            const isOwnWorkspace = channel.workspaceId === membership.workspaceId;
            const externalConnection = !isOwnWorkspace && channel.visibility === "PUBLIC"
                ? await prisma.externalChannelConnection.findFirst({
                    where: {
                        channelId: channel.id,
                        workspaceId: workspace.id,
                        accepted: true
                    }
                })
                : null;

            if ((!isOwnWorkspace && !externalConnection) || channel.visibility !== "PUBLIC") {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const existingChannelMembership = channel.members.find(item => item.userId === membership.id);
            if (existingChannelMembership) return existingChannelMembership;

            const newMembership = await prisma.channelMembership.create({
                data: {
                    userId: membership.id,
                    channelId: opts.input.channelId,
                    role: "MEMBER"
                }
            })

            return newMembership
        }),

    createOrGetDirectMessage: authProcedure
        .input(z.object({
            userId: z.string(),
            workspaceId: z.string()
        }))
        .mutation(async (opts) => {
            const currentUserId = opts.ctx.user.id;
            const targetUserId = opts.input.userId;
            const workspaceId = opts.input.workspaceId;

            if (currentUserId === targetUserId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot create a DM with yourself"
                });
            }

            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: workspaceId
                },
                include: {
                    memberships: true
                }
            });

            if (!workspace) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Workspace not found"
                });
            }

            const currentMembership = workspace.memberships.find(
                member => member.userId === currentUserId
            );

            if (!currentMembership) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You are not a member of this workspace"
                });
            }

            const targetMembership = workspace.memberships.find(
                member => member.userId === targetUserId
            );

            if (!targetMembership) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Target user is not a member of this workspace"
                });
            }

            const channel = await prisma.channel.findFirst({
                where: {
                    workspaceId,
                    visibility: "DIRECT",
                    members: {
                        every: {
                            userId: {
                                in: [
                                    currentMembership.id,
                                    targetMembership.id
                                ]
                            }
                        }
                    },
                    AND: [
                        {
                            members: {
                                some: {
                                    userId: currentMembership.id
                                }
                            }
                        },
                        {
                            members: {
                                some: {
                                    userId: targetMembership.id
                                }
                            }
                        }
                    ]
                }
            });

            if (channel) {
                return channel;
            }

            return await prisma.channel.create({
                data: {
                    name: "direct_message_" + currentMembership.id + "_" + targetMembership.id,
                    visibility: "DIRECT",
                    workspaceId,
                    members: {
                        createMany: {
                            data: [
                                {
                                    userId: currentMembership.id,
                                    role: "ADMIN"
                                },
                                {
                                    userId: targetMembership.id,
                                    role: "ADMIN"
                                }
                            ]
                        }
                    }
                }
            });
        }),

    addExternalConnection: authProcedure
        .input(z.object({channelId: z.string(), workspaceSlug: z.string().trim().min(1)}))
        .mutation(async (opts) => {
            const channel = await prisma.channel.findUnique({
                where: {
                    id: opts.input.channelId
                },
                include: {
                    members: true,
                    workspace: {
                        include: {
                            memberships: true
                        }
                    }
                }
            })

            if (!channel) {
                throw new TRPCError({
                    message: "Channel not found",
                    code: "NOT_FOUND"
                });
            }

            const targetWorkspace = await prisma.workspace.findUnique({
                where: { slug: opts.input.workspaceSlug }
            });

            if (!targetWorkspace) {
                throw new TRPCError({ message: "Workspace not found", code: "NOT_FOUND" });
            }
            if (targetWorkspace.id === channel.workspaceId) {
                throw new TRPCError({ message: "This is already the channel's workspace", code: "BAD_REQUEST" });
            }

            const membership = channel.workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const channelMembership = channel.members.find(
                member => member.userId === membership.id
            );

            if (!channelMembership || membership.role == "MEMBER") {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const existingConnection = await prisma.externalChannelConnection.findFirst({
                where: { channelId: channel.id, workspaceId: targetWorkspace.id }
            });
            if (existingConnection) {
                throw new TRPCError({ message: "An invite for this workspace already exists", code: "CONFLICT" });
            }

            const connection = await prisma.externalChannelConnection.create({
                data: {
                    channelId: channel.id,
                    workspaceId: targetWorkspace.id
                }
            })

            return connection
        })
});
