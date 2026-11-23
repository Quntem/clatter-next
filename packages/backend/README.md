# backend

Set `BACKEND_PORT` in `packages/backend/.env` to choose the backend port. It defaults to `3001`.
Set the same variable in `apps/web/.env` so the web app's `/trpc` rewrite points to that port.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
