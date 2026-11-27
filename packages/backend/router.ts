import { channelsRouter } from './api/channels';
import { workspaceRouter } from './api/workspace';
import { router } from './trpc';
import type { inferRouterOutputs } from '@trpc/server';

export const appRouter = router({
  workspace: workspaceRouter,
  channel: channelsRouter
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
