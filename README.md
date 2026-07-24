# Professional Task Manager

## Overview

Professional Task Manager is a SaaS application that helps organizations plan, assign, monitor, and complete work efficiently. Built for Kenyan teams managing infrastructure, digital transformation, financial services, and government projects.

## Objectives

- Improve productivity
- Track projects and tasks
- Manage teams effectively
- Reduce missed deadlines
- Provide actionable analytics

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Recharts
- **Backend:** Next.js Route Handlers, Server Actions, Prisma ORM, Zod validation
- **Database:** PostgreSQL 16 (via Prisma Migrate)
- **Auth:** Custom session-based (bcryptjs + crypto tokens + HTTP-only cookies)
- **Caching:** Redis (Upstash) with in-memory fallback
- **Testing:** Vitest 3, Testing Library, Playwright (planned)
- **Infrastructure:** Docker, Docker Compose, GitHub Actions CI/CD
- **File Storage:** S3-compatible (MinIO for dev, AWS S3 for prod)

## Documentation

See the `docs/` directory for:
- Business Requirements & SRS
- System Architecture & Database Design
- API Specification (OpenAPI 3.0)
- UI/UX Design & Engineering Standards
- Implementation Plan & Audit Reports

## Quick Start

```bash
# Install dependencies
cd apps/web
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Run database migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run tests (Vitest) |
| `npm run format` | Format with Prettier |

## Status

**Implementation Phase** — Active development. Full CI/CD pipeline configured. See `docs/` for detailed plans.
# ProfessionalTaskManager
