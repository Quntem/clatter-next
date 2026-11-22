
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
                        name: opts.ctx.session.user.name,
                        role: "MEMBER",
                        workspaceId: invite.workspaceId
                    }
                })
            }
            return invite
        }),

    create: authProcedure
        .input(z.object({
            name: z.string(),
            slug: z.string(),
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
                            name: opts.ctx.session.user.name,
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
                    externalConnections: true,
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
                    }
                }
            });

            const availableChannels = await prisma.channel.findMany({
                where: {
                    visibility: ChannelVisibility.PUBLIC
                },
                include: {
                    members: {
                        include: {
                            membership: true
                        }
                    }
                }
            })

            return {
                ...workspace,
                channels,
                availableChannels
            };
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
            var userId = opts.input.userId
            if (!opts.input.userId) {
                userId = opts.ctx.user.id
            }

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