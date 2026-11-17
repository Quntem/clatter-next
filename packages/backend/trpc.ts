
import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { VerifySession } from 'keystone-lib';
import { prisma } from './prisma';

type AuthMeta = {
    requiresAuth: boolean;
};

// Initial HTTP context
export const sessionIdContext = (opts: CreateHTTPContextOptions) => {
    const authorization = opts.req.headers.authorization;

    const sessionId =
        authorization?.replace(/^Bearer\s+/i, '').trim() || null;

    return {
        req: opts.req,
        res: opts.res,
        sessionId,
    };
};

export type SessionIdContext = ReturnType<typeof sessionIdContext>;

// Initialize tRPC
export const t = initTRPC
    .context<SessionIdContext>()
    .meta<AuthMeta>()
    .create();

export const router = t.router;

// Public procedures don't require authentication
export const publicProcedure = t.procedure;

// Authenticated procedures require a valid Keystone session
export const authProcedure = t.procedure.use(async (opts) => {
    const sessionId = opts.ctx.sessionId;

    if (!sessionId) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'No session ID provided',
        });
    }

    let session;
    let user

    try {
        session = await VerifySession({
            sessionId,
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            appSecret: process.env.APP_SECRET!,
        });
        user = await prisma.user.upsert({
            update: {
                keystoneId: session.user.id,
                username: session.user.username + (session.tenant.name ? `_${session.tenant.name}` : ""),
                keystoneObject: session.user,
                email: session.user.email,
            },
            create: {
                keystoneId: session.user.id,
                username: session.user.username + (session.tenant.name ? `_${session.tenant.name}` : ""),
                keystoneObject: session.user,
                email: session.user.email,
            },
            where: {
                keystoneId: session.user.id,
            },
        })
    } catch(error) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Failed to verify session',
        });
    }

    if (!session) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired session',
        });
    }

    return opts.next({
        ctx: {
            ...opts.ctx,
            session,
            user
        },
    });
});
