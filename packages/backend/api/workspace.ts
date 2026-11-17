import { authProcedure, publicProcedure, t } from "../trpc";
import { prisma } from "../prisma";
import {z} from "zod"

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
        .input(z.object({name: z.string(), slug: z.string(), image: z.string().optional()}))
        .mutation(async (opts) => {
            const workspace = await prisma.workspace.create({
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
            })
        })
})
