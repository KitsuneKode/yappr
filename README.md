# Yappr

A modern anonymous chat application.

## Overview

Yappr is a monorepo project using Turborepo for managing multiple packages and applications. It includes a HTTP server for backend services and a database layer using Prisma.

## Project Structure

The project is organized into the following packages:

- `apps/http-server`: A HTTP server for backend services.
- `apps/ws-server`: A WebSocket server for real-time communication.
- `apps/web`: A web application built with Next.js.
- `packages/db`: A database layer using Prisma.
- `packages/common`: A shared common package between web and backend.
- `packages/backend-common`: A shared backend common package.
- `packages/ui`: A shared UI package.


## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/kitsunekode/yappr.git
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```
