
import z from "zod";
import { authProcedure, t } from "../trpc";
import { ChannelRole, ChannelVisibility } from "../generated/prisma/enums";
import { prisma } from "../prisma";
import { TRPCError } from "@trpc/server";
import {EventEmitter, on} from "events"
import type { Message } from "../generated/prisma/client";

const ee = new EventEmitter()

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
                        include: {
                            sentBy: true,
                            _count: {
                                select: {
                                    replies: true
                                }
                            }
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

            // Find the current user's workspace membership
            const membership = await prisma.workspaceMembership.findFirst({
                where: {
                    workspaceId: channel.workspaceId,
                    userId: opts.ctx.user.id
                }
            });

            if (!membership) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            // Private channels require channel membership.
            // Public channels are accessible to workspace members.
            if (channel.visibility !== ChannelVisibility.PUBLIC) {
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

            for await (const [data] of on(ee, "channel.message", {
                signal: opts.signal
            })) {
                const message = data as Message;

                if (message.channelId === channelId) {
                    yield message;
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

            const membership = workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership) {
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

            const channelMembership = channel.members.find(
                member => member.userId === membership.id
            );

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
                    sentById: membership.id
                },
                include: {
                    sentBy: true
                }
            })

            ee.emit("channel.message", message)

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

            const OwnMembership = targetChannelMembership.channel.workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!OwnMembership) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }    

            const channelMembership = targetChannelMembership.channel.members.find(
                member => member.userId === OwnMembership.id
            );

            if (!channelMembership || (channelMembership.role == "MEMBER" && OwnMembership.role == "MEMBER") || OwnMembership.role == "MEMBER") {
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

            const newMembership = await prisma.channelMembership.create({
                data: {
                    userId: opts.input.userId,
                    channelId: opts.input.channelId,
                    role: opts.input.role
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
                name: "Direct Message",
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

});
