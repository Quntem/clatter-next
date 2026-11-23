
import { authProcedure, t } from "../trpc";
import { prisma } from "../prisma";
import { email, z } from "zod";
import { TRPCError } from "@trpc/server";
import { ChannelVisibility } from "../generated/prisma/enums";

export const workspaceRouter = t.router({
    list: authProcedure
        .query(async (opts) => {
            return await prisma.workspaceMembership.findMany({
                where: {
                    userId: opts.ctx.user.id,
                    deactivated: false
                },
                include: {
                    workspace: true
                }
            });
        }),
    
    getInvites: authProcedure 
        .query(async (opts) => {
            return await prisma.workspaceInvite.findMany({
                where: {
                    userId: opts.ctx.user.id
                },
                include: {
                    workspace: true
                }
            });
        }),
    
    actionInvite: authProcedure
        .input(z.object({action: z.enum(["ACCEPT", "REJECT"]), inviteId: z.string()}))
        .mutation(async (opts) => {
            let invite
            if (opts.input.action == "REJECT") {
                invite = await prisma.workspaceInvite.update({
                    where: {
                        id: opts.input.inviteId
                    },
                    data: {
                        status: "REJECTED"
                    },
                    include: {
                        user: true
                    }
                })
            } else if (opts.input.action == "ACCEPT") {
                invite = await prisma.workspaceInvite.update({
                    where: {
                        id: opts.input.inviteId
                    },
                    data: {
                        status: "ACCEPTED"
                    },
                    include: {
                        user: true
                    }
                })
                const membership = await prisma.workspaceMembership.create({
                    data: {
                        userId: invite.userId,
                        name: opts.ctx.session.user.name ?? opts.ctx.session.user.username ?? "",
                        role: "MEMBER",
                        workspaceId: invite.workspaceId
                    }
                })
            }
            return invite
        }),

    create: authProcedure
        .input(z.object({
            name: z.string().trim().min(1),
            slug: z.string().trim().min(1),
            image: z.string().optional()
        }))
        .mutation(async (opts) => {
            return await prisma.workspace.create({
                data: {
                    name: opts.input.name,
                    slug: opts.input.slug,
                    memberships: {
                        create: {
                            userId: opts.ctx.user.id,
                            name: opts.ctx.session.user.name ?? opts.ctx.session.user.username ?? "",
                            role: "OWNER"
                        }
                    }
                }
            });
        }),

    get: authProcedure
        .input(z.object({
            slug: z.string()
        }))
        .query(async (opts) => {
            const workspace = await prisma.workspace.findUnique({
                where: {
                    slug: opts.input.slug
                },
                include: {
                    memberships: {
                        include: {
                            user: true
                        }
                    },
                    externalConnections: {
                        include: {
                            channel: {
                                include: {
                                    workspace: true,
                                    members: { include: { membership: true } },
                                    externalConnections: true
                                }
                            }
                        }
                    },
                    invites: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if (!workspace) {
                throw new TRPCError({
                    message: "Workspace not found",
                    code: "NOT_FOUND"
                });
            }

            // Find the current user's workspace membership
            const membership = workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership || membership.deactivated) {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            // Get public channels and private channels
            // that the current user is a member of
            const channels = await prisma.channel.findMany({
                where: {
                    workspaceId: workspace.id,
                    OR: [
                        // {
                        //     visibility: ChannelVisibility.PUBLIC
                        // },
                        {
                            members: {
                                some: {
                                    userId: membership.id
                                }
                            }
                        }
                    ]
                },
                include: {
                    members: {
                        include: {
                            membership: true
                        }
                    },
                    externalConnections: true
                }
            });

            const availableChannels = await prisma.channel.findMany({
                where: {
                    visibility: ChannelVisibility.PUBLIC,
                    workspaceId: workspace.id
                },
                include: {
                    members: {
                        include: {
                            membership: true
                        }
                    },
                    externalConnections: true
                }
            })

            const connectedChannels = workspace.externalConnections
                .filter(connection => connection.accepted)
                .map(connection => connection.channel)
                .filter(channel => channel.visibility === ChannelVisibility.PUBLIC);
            const joinedConnectedChannels = connectedChannels.filter(channel =>
                channel.members.some(member => member.membership.userId === opts.ctx.user.id)
            );
            const availableConnectedChannels = connectedChannels.filter(channel =>
                !channel.members.some(member => member.membership.userId === opts.ctx.user.id)
            );

            return {
                ...workspace,
                channels: [...channels, ...joinedConnectedChannels],
                availableChannels: [...availableChannels, ...availableConnectedChannels]
            };
        }),

    search: authProcedure
        .input(z.object({ slug: z.string(), query: z.string().trim().min(1).max(100) }))
        .query(async (opts) => {
            const workspace = await prisma.workspace.findUnique({
                where: { slug: opts.input.slug },
                include: { memberships: true, externalConnections: { where: { accepted: true }, include: { channel: { include: { members: true } } } } }
            });

            if (!workspace) {
                throw new TRPCError({ message: "Workspace not found", code: "NOT_FOUND" });
            }

            const membership = workspace.memberships.find(member => member.userId === opts.ctx.user.id && !member.deactivated);
            if (!membership) {
                throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
            }

            const channels = await prisma.channel.findMany({
                where: {
                    workspaceId: workspace.id,
                    OR: [
                        { visibility: ChannelVisibility.PUBLIC },
                        { members: { some: { userId: membership.id } } }
                    ]
                },
                select: { id: true, name: true, visibility: true }
            });
            const connectedChannels = workspace.externalConnections
                .map(connection => connection.channel)
                .filter(channel => channel.visibility === ChannelVisibility.PUBLIC)
                .map(channel => ({ id: channel.id, name: channel.name, visibility: channel.visibility }));
            const accessibleChannels = [...new Map([...channels, ...connectedChannels].map(channel => [channel.id, channel])).values()];
            const rawQuery = opts.input.query.trim();
            const channelFilterMatch = rawQuery.match(/^channel:([^\s]+)\s*(.*)$/i);
            const channelFilter = channelFilterMatch
                ? accessibleChannels.find(channel => channel.name.toLocaleLowerCase() === channelFilterMatch[1]?.toLocaleLowerCase())
                : undefined;
            const query = (channelFilterMatch?.[2] ?? rawQuery).toLocaleLowerCase();
            const searchedChannels = channelFilterMatch
                ? (channelFilter ? [channelFilter] : [])
                : accessibleChannels;
            const channelMatches = channelFilterMatch
                ? (channelFilter ? [channelFilter] : [])
                : query ? accessibleChannels.filter(channel => channel.name.toLocaleLowerCase().includes(query)).slice(0, 10) : [];
            const userMatches = query ? workspace.memberships
                .filter(member => !member.deactivated && member.name.toLocaleLowerCase().includes(query))
                .slice(0, 10)
                .map(({ id, name, profilePicture }) => ({ id, name, profilePicture })) : [];

            if (searchedChannels.length === 0 || !query) {
                return { channels: channelMatches, users: userMatches, messages: [] };
            }

            const recentMessages = await prisma.message.findMany({
                where: { channelId: { in: searchedChannels.map(channel => channel.id) } },
                orderBy: { createdAt: "desc" },
                take: 1000,
                include: { sentBy: { select: { name: true } }, channel: { select: { name: true } } }
            });
            const messages = recentMessages.filter(message => {
                const content = message.content as { blocks?: Array<{ content?: unknown }> };
                const text = content.blocks?.map(block => typeof block.content === "string" ? block.content : "").join(" ") ?? "";
                return text.toLocaleLowerCase().includes(query);
            }).slice(0, 10).map(message => ({
                id: message.id,
                channelId: message.channelId,
                channelName: message.channel.name,
                senderName: message.sentBy.name,
                createdAt: message.createdAt,
                preview: (message.content as { blocks?: Array<{ content?: unknown }> }).blocks?.map(block => typeof block.content === "string" ? block.content : "").join(" ") ?? ""
            }));

            return { channels: channelMatches, users: userMatches, messages };
        }),

    acceptExternalConnection: authProcedure
        .input(z.object({connectionId: z.string()}))
        .mutation(async (opts) => {
            const connection = await prisma.externalChannelConnection.findUnique({
                where: { id: opts.input.connectionId },
                include: { workspace: { include: { memberships: true } } }
            });
            if (!connection) {
                throw new TRPCError({ message: "Invite not found", code: "NOT_FOUND" });
            }
            const membership = connection.workspace.memberships.find(member =>
                member.userId === opts.ctx.user.id && !member.deactivated
            );
            if (!membership || membership.role === "MEMBER") {
                throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
            }
            return prisma.externalChannelConnection.update({
                where: { id: connection.id },
                data: { accepted: true }
            });
        }),

    removeExternalConnection: authProcedure
        .input(z.object({connectionId: z.string()}))
        .mutation(async (opts) => {
            const connection = await prisma.externalChannelConnection.findUnique({
                where: { id: opts.input.connectionId },
                include: {
                    workspace: { include: { memberships: true } },
                    channel: {
                        include: {
                            members: true,
                            workspace: { include: { memberships: true } }
                        }
                    }
                }
            });
            if (!connection) {
                throw new TRPCError({ message: "Connection not found", code: "NOT_FOUND" });
            }
            const targetWorkspaceMembership = connection.workspace.memberships.find(member =>
                member.userId === opts.ctx.user.id && !member.deactivated
            );
            const sourceWorkspaceMembership = connection.channel.workspace.memberships.find(member =>
                member.userId === opts.ctx.user.id && !member.deactivated
            );
            const canRemoveFromTarget = targetWorkspaceMembership && targetWorkspaceMembership.role !== "MEMBER";
            const canRemoveFromSource = sourceWorkspaceMembership
                && sourceWorkspaceMembership.role !== "MEMBER"
                && connection.channel.members.some(member => member.userId === sourceWorkspaceMembership.id);
            if (!canRemoveFromTarget && !canRemoveFromSource) {
                throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
            }
            return prisma.externalChannelConnection.delete({
                where: { id: connection.id }
            });
        }),
    
    invite: authProcedure
        .input(z.object({email: z.string(), workspaceId: z.string()}))
        .mutation(async (opts) => {
            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: opts.input.workspaceId
                },
                include: {
                    memberships: {
                        include: {
                            user: true
                        }
                    },
                    externalConnections: true
                }
            });

            if (!workspace) {
                throw new TRPCError({
                    message: "Workspace not found",
                    code: "NOT_FOUND"
                });
            }

            // Find the current user's workspace membership
            const membership = workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership || membership.role == "MEMBER") {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    email: opts.input.email
                }
            })

            if (!user) {
               throw new TRPCError({
                    message: "User not found",
                    code: "NOT_FOUND"
                }); 
            }

            const invite = await prisma.workspaceInvite.create({
                data: {
                    workspaceId: workspace.id,
                    userId: user.id,
                    invitedById: membership.id
                }
            })

            return invite
        }),

    update: authProcedure
        .input(z.object({workspaceId: z.string(), image: z.string().optional(), name: z.string().optional()}))
        .mutation(async (opts) => {
            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: opts.input.workspaceId
                },
                include: {
                    memberships: {
                        include: {
                            user: true
                        }
                    },
                    externalConnections: true
                }
            });

            if (!workspace) {
                throw new TRPCError({
                    message: "Workspace not found",
                    code: "NOT_FOUND"
                });
            }

            // Find the current user's workspace membership
            const membership = workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership || membership.role == "MEMBER") {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const update = prisma.workspace.update({
                where: {
                    id: opts.input.workspaceId
                },
                data: {
                    image: opts.input.image,
                    name: opts.input.name
                }
            })

            return update
        }),

    getMembership: authProcedure
        .input(z.object({workspaceId: z.string(), userId: z.string().optional()}))
        .query(async (opts) => {
            const userId = opts.input.userId ?? opts.ctx.user.id

            const membership = await prisma.workspaceMembership.findUnique({
                where: {
                    userId_workspaceId: {
                        userId,
                        workspaceId: opts.input.workspaceId
                    }
                },
                include: {
                    user: true
                }
            })
            
            return membership
        }),

    modifyUserActivation: authProcedure
        .input(z.object({membershipId: z.string(), action: z.enum(["ACTIVATE", "DEACTIVATE"])}))
        .mutation(async (opts) => {
            const membership = await prisma.workspaceMembership.findUnique({
                where: {
                    id: opts.input.membershipId
                },
                include: {
                    workspace: {
                        include: {
                            memberships: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            })

            if (!membership) {
                throw new TRPCError({
                    message: "Membership not found",
                    code: "NOT_FOUND"
                });
            }

            const ownMembership = membership.workspace.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!ownMembership || ownMembership.role == "MEMBER") {
                throw new TRPCError({
                    message: "Unauthorized",
                    code: "UNAUTHORIZED"
                });
            }

            const modified = await prisma.workspaceMembership.update({
                where: {
                    id: opts.input.membershipId
                },
                data: {
                    deactivated: opts.input.action == "DEACTIVATE"
                }
            })

            return modified
        }),
    
    updateMembership: authProcedure
        .input(z.object({name: z.string().optional(), profilePicture: z.string().optional(), workspaceId: z.string()}))
        .mutation(async (opts) => {
            const membership = await prisma.workspaceMembership.update({
                where: {
                    userId_workspaceId: {
                        userId: opts.ctx.user.id,
                        workspaceId: opts.input.workspaceId
                    }
                },
                data: {
                    name: opts.input.name,
                    profilePicture: opts.input.profilePicture
                }
            })
        })
});
