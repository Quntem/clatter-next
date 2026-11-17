import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './router';
import { sessionIdContext } from './trpc';

const server = createHTTPServer({
  router: appRouter,
  basePath: "trpc",
  createContext: sessionIdContext,
});

server.listen(3001);