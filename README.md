# Clatter
Clatter is an open source communication platform, like Slack

## Getting Started
The easiest way to get started with Clatter is Clatter.work, our hosted service. All you need is a Quntem Account. You can sign up for a Quntem Account [here](https://keystone.qplus.cloud/get-started/personal)

## Self Hosting (advanced)
You can also self host clatter. Just `bun install`, configure the env variables in the .env file in the backend
```
DATABASE_URL=
KEYSTONE_URL=
APP_ID=
APP_SECRET=
```
and in the frontend
```
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_KEYSTONE_URL=
NEXT_PUBLIC_KEYSTONE_FRONTEND_URL=
```
then run `npx next build` and `npx next start`

>note: you need to serve the frontend through https, using something like CloudFlare Tunnels