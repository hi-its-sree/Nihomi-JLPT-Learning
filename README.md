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

## Next steps

- Add Prisma schema and database migrations
- Add authentication
- Add lesson, kanji, vocabulary, grammar, reading, listening, and mock-test modules
- Add responsive dashboards and study-plan views
