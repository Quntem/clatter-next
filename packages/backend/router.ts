import { channelsRouter } from './api/channels';
import { workspaceRouter } from './api/workspace';
import { router } from './trpc';

export const appRouter = router({
  workspace: workspaceRouter,
  channel: channelsRouter
});

export type AppRouter = typeof appRouter;