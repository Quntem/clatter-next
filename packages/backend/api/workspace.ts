
import { authProcedure, t } from "../trpc";
import { prisma } from "../prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ChannelVisibility } from "../generated/prisma/enums";

export const workspaceRouter = t.router({
    list: authProcedure
        .query(async (opts) => {
            return await prisma.workspaceMembership.findMany({
                where: {
                    userId: opts.ctx.user.id
                },
                include: {
                    workspace: true
                }
            });
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
                            name: opts.ctx.session.user.name
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

            if (!membership) {
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
                        {
                            visibility: ChannelVisibility.PUBLIC
                        },
                        {
                            members: {
                                some: {
                                    userId: membership.id
                                }
                            }
                        }
                    ]
                }
            });

            return {
                ...workspace,
                channels
            };
        })
});