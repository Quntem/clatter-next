import z from "zod";
import { authProcedure, t } from "../trpc";
import { ChannelVisibility } from "../generated/prisma/enums";
import { prisma } from "../prisma";
import { TRPCError } from "@trpc/server";

export const channelsRouter = t.router({
    create: authProcedure
        .input(z.object({name: z.string().toLowerCase().regex(/^\S+$/, "Spaces are not allowed"), visibility: z.enum(ChannelVisibility), workspaceId: z.string()}))
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
                }
            })

            const membership = workspace?.memberships.find(
                member => member.userId === opts.ctx.user.id
            );

            if (!membership) {
                throw new TRPCError({
                    message: "unauthorized",
                    code: "UNAUTHORIZED"
                })
            }
            await prisma.channel.create({
                data: {
                    name: opts.input.name,
                    visibility: opts.input.visibility,
                    workspaceId: opts.input.workspaceId,
                    members: {
                        create: {
                            userId: membership.id
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
            })
        })
})