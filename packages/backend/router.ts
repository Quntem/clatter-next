import { workspaceRouter } from './api/workspace';
import { router } from './trpc';

export const appRouter = router({
  workspace: workspaceRouter
});

export type AppRouter = typeof appRouter;