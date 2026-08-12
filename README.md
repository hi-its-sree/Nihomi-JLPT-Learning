# JLPT Learning Platform

A full-stack Japanese learning platform built with React, Hono, PostgreSQL, Prisma, and Tailwind CSS.

## Structure

- client: React + Vite frontend
- server: Hono backend API

## Start the frontend

```bash
cd client
npm run dev
```

Open http://localhost:5173

## Start the backend

```bash
cd server
npm run dev
```

The API will be available at http://localhost:4000

## API endpoints

- GET /health
- GET /api/v1/dashboard
- GET /api/v1/levels

## Run with Docker

From the repository root:

```bash
docker compose up --build
```

This starts:
- frontend at http://localhost:5173
- backend at http://localhost:4001
- PostgreSQL at localhost:5433 (mapped from container port 5432 to avoid conflicts with existing local PostgreSQL installs)

### Environment

Copy the server example environment if needed:

```bash
cp server/.env.example server/.env
```

For a dev tunnel, expose the frontend and backend ports with your tunnel tool after the containers are running.

## Next steps

- Add Prisma schema and database migrations
- Add authentication
- Add lesson, kanji, vocabulary, grammar, reading, listening, and mock-test modules
- Add responsive dashboards and study-plan views
