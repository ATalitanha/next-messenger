# Simple Secure Messenger

This is a simple secure messenger application built with Next.js, Prisma, Server-Sent Events (SSE), PostgreSQL, and Redis.

## Features

-   Next.js (app router) + TypeScript frontend using TailwindCSS and shadcn/ui
-   Backend inside Next.js app (API routes/app routes) + SSE server for realtime
-   Persistence: Prisma ORM + PostgreSQL
-   Auth: Clerk for authentication
-   Validation: Zod for request validation
-   Offline Resilience: Client-side caching and message queueing
-   Advanced Messaging: Reactions, replies, and context menus
-   Docker-compose for dev: app, postgres, redis
-   Tests: Vitest for unit, Playwright for e2e
-   CI: GitHub Actions to run lint, tests, build

## Getting Started

### Prerequisites

-   [pnpm](https://pnpm.io/)
-   [Docker](https://www.docker.com/)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/your_project_name.git
    ```
2.  Install NPM packages
    ```sh
    pnpm install
    ```
3.  Create a `.env` file from the `.env.example` file and add your Clerk credentials.
4.  Start the database and redis containers
    ```sh
    sudo docker compose up -d
    ```
5.  Run the database migrations
    ```sh
    pnpm migrate
    ```

### Running the application

```sh
pnpm dev
```

### Running the tests

```sh
pnpm test
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL="postgresql://user:password@localhost:5432/secure-messenger"`

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
`CLERK_SECRET_KEY`

`NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
`NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
`NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/`
`NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/`

## Deployment

This application is designed to be deployed to Vercel's free tier. The real-time communication is handled by Server-Sent Events (SSE), which are compatible with Vercel's serverless functions. The database and Redis instances should be deployed to a managed service.

### Vercel Deployment Settings

-   **Framework Preset:** Next.js
-   **Build Command:** `pnpm build`
-   **Output Directory:** `.next`
-   **Environment Variables:** Add the same environment variables as in the `.env` file.

### SSE Reconnect Strategy

The client will automatically reconnect to the SSE endpoint if the connection is lost. The client will attempt to reconnect immediately, and then with an exponential backoff strategy if the connection continues to fail.

### Offline Queue Logic

When the client is offline, outgoing messages are queued in IndexedDB. When the connection is restored, the queued messages are sent to the server in the order they were sent.
