# Clatter
Clatter is an open source communication platform, like Slack. Built initially for the High Seas YSWS program by Hack Club, we present the brand new system: Clatter *(but better)*!

## Getting Started
The easiest way to get started with Clatter is https://clatter.work/, our hosted service. All you need is a Quntem Account, which can be created easily. You can sign up for a Quntem Account [here](https://keystone.qplus.cloud/get-started/personal).

## Self Hosting (Advanced)
You can also self host clatter. Just `bun install`, configure the env variables in the .env file in the backend (`packages/backend`):

```
DATABASE_URL=
KEYSTONE_URL=
APP_ID=
APP_SECRET=
```

and in the frontend (`apps/web`):

```
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_KEYSTONE_URL=
NEXT_PUBLIC_KEYSTONE_FRONTEND_URL=
```

then run `bun run dev` to start.

> Note: You need to serve the frontend through https, using something like Cloudflare Tunnels.