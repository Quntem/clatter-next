import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@workspace/backend/router';

export const trpc = createTRPCReact<AppRouter>();