import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './router';
import { sessionIdContext } from './trpc';

const server = createHTTPServer({
  router: appRouter,
  basePath: "trpc",
  createContext: sessionIdContext,
});

const port = Number(process.env.BACKEND_PORT ?? 3001);

server.listen(port);
