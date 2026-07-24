# Engineering Standards

## 1. Code Style & Conventions

### TypeScript
- **Strict mode enabled** in `tsconfig.json` — `strict: true` with no exceptions.
- **No `any` types** — use `unknown` and narrow with type guards. Prefer `never` for exhaustive checks.
- **Explicit return types** on all public function signatures.
- **`as const`** for literal arrays, enums, and config objects.
- **Barrel exports** via each module's `index.ts` — no deep imports across module boundaries.

### Naming Conventions
| Category | Convention | Example |
|---|---|---|
| Files/Dirs | `kebab-case` | `rate-limiter.ts`, `user-management/` |
| Client Components | `PascalCase.client.tsx` | `TaskBoard.client.tsx` |
| Server Components | `PascalCase.tsx` | `ProjectDashboard.tsx` |
| Server Actions | `camelCase.ts` | `createTask.ts` |
| Functions/Variables | `camelCase` | `formatDate`, `isOverdue` |
| Types/Interfaces | `PascalCase` | `SessionUser`, `ApiResponse` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_LIMIT`, `APP_NAME` |
| Enums | `PascalCase` | `TaskStatus`, `UserRole` |
| Private functions (module-only) | `_camelCase` | `_validateSchema` |
| Database models | `PascalCase` (Prisma-generated) | `User`, `Task`, `Project` |

### File Organization
```
src/
  app/          # Next.js App Router pages & API routes
  components/   # Shared UI components
  lib/          # Core libraries (auth, db, helpers, config, constants)
  hooks/        # Shared React hooks
  types/        # Shared TypeScript types
  services/     # Business logic services
  server/       # Server-only utilities
```

Each module in `lib/` exposes only what is needed via its `index.ts`. Internal implementation details are never imported from outside the module.

---

## 2. Component Architecture

### Server Components by Default
- All components are **Server Components** unless they require interactivity.
- Data fetching, authentication checks, and database queries happen in Server Components.

### Client Components (when needed)
- Use the `"use client"` directive **only** when the component needs:
  - React state / effects (`useState`, `useReducer`, `useEffect`)
  - Browser APIs (`localStorage`, `IntersectionObserver`, etc.)
  - Event handlers (`onClick`, `onSubmit`, `onChange`)
  - Custom hooks that use state or effects
- Name Client Components with the `.client.tsx` suffix for explicit identification.
- Minimize the Client Component boundary — push stateful logic as far down as possible.

### Composition Pattern
- Server Components pass data as props to Client Components.
- Client Components receive event callbacks as props rather than performing data mutations directly.
- Use React `Suspense` boundaries for streaming and fallback UIs.

---

## 3. State Management

### Server State (RSC / Server Actions)
- **Primary data source.** Fetch data directly in Server Components using Prisma.
- Mutations use **Server Actions** — no separate API routes for CRUD within the app.
- Server Actions validate input, perform the mutation, revalidate the cache, and return result.

### Client State
- Use React hooks (`useState`, `useReducer`) for ephemeral UI state.
- Use React Context for shared UI state (theme, sidebar, toast notifications) — keep context narrow.
- **No global state library** (no Redux, Zustand, Jotai) unless proven necessary.
- Caching of server data on the client is handled by Next.js router cache / fetch cache.

### URL State
- Search filters, pagination cursors, and active tabs live in URL search params.
- Use `useSearchParams` and `useRouter` for reading and updating URL state.

---

## 4. API Design Patterns

### RESTful Routes (Pages Router API)
- For external integrations or webhook endpoints only.
- Follow REST conventions: `GET /api/projects`, `POST /api/projects`, `GET /api/projects/[id]`, etc.
- All API routes use the `ApiResponse<T>` / `ApiError` response types.
- Include `traceId` in error responses for debugging.

### Server Actions (Internal Mutations)
- Preferred over API routes for all in-app mutations.
- Named by action: `createTask.ts`, `updateProject.ts`, `deleteComment.ts`.
- Return `{ success: true, data }` or `{ success: false, error }`.
- Use `"use server"` directive at the top.
- Validate input with Zod before processing.

### Response Convention
```typescript
// Success
{ success: true, data: T, meta?: PaginationMeta }

// Error
{ success: false, error: { code: string; message: string; errors?: FieldError[] }, traceId: string }
```

---

## 5. Database Patterns

### Prisma ORM
- Prisma is the sole database access layer.
- All migrations managed via `prisma migrate`.
- Schema file: `prisma/schema.prisma`.

### Soft Deletes
- All user-deletable entities have `deletedAt: DateTime?`.
- Queries must filter `WHERE deletedAt IS NULL` by default.
- Prisma middleware or a reusable query wrapper enforces this automatically.

### Audit Fields
Every table MUST include:
```
createdAt  DateTime  @default(now())
updatedAt  DateTime  @updatedAt
createdBy  String?   // User ID
updatedBy  String?   // User ID
```

### Migrations
- One migration per logical change.
- Migration names are descriptive: `add_task_due_date_index`, `create_notifications_table`.
- Rollbacks must be tested before deployment.

### Indexing
- Index all foreign keys and frequently queried columns (`status`, `priority`, `dueDate`).
- Use composite indexes for common query patterns.
- Avoid over-indexing — measure query performance with `EXPLAIN ANALYZE`.

### Concurrency
- Use `@updatedAt` and optimistic concurrency checks for hot entities.
- Wrap multi-step mutations in Prisma interactive transactions.

---

## 6. Testing Standards

### Framework
- **Vitest** as the test runner.
- **React Testing Library** for component tests.
- **Playwright** for end-to-end tests (in `tests/` directory).

### What to Test
| Layer | What | Tools |
|---|---|---|
| Utilities & helpers | Pure logic, edge cases | Vitest unit tests |
| Server Actions | Input validation, DB writes, auth guards | Vitest + mocked DB |
| Components | Rendering, user interactions, accessibility | Vitest + RTL |
| API Routes | Status codes, response shapes, auth | Vitest + supertest |
| E2E | Critical user journeys, auth flows | Playwright |

### Coverage Targets
- **Unit / Integration**: 80%+ line coverage.
- **E2E**: All critical paths (login, create task, assign, comment).
- No coverage targets on types, constants, or configuration files.

### Conventions
- Test files co-located with source: `component.tsx` → `component.test.tsx`.
- Use `describe` / `it` blocks with descriptive names.
- Mock external services at the boundary (network, filesystem).
- Never mock Prisma directly — use an in-memory SQLite or a test container.
- Prefer `userEvent` over `fireEvent` in RTL tests.

---

## 7. Security Standards

### Content Security Policy (CSP)
- Strict CSP via Next.js middleware or response headers.
- Allow only same-origin scripts, styles, and fonts.
- Report violations to a logging endpoint.

### Authentication & Authorization
- Session tokens via `httpOnly`, `secure`, `sameSite: "lax"` cookies.
- CSRF protection via `sameSite: "strict"` on mutating endpoints and CSRF tokens.
- Server Actions verify authentication via `requireAuth()` before any mutation.
- Authorization checked at the function level via `requireRole()` / `requirePermission()`.
- Permission matrix is centralized in `lib/auth/index.ts` — no ad-hoc role checks.

### Input Validation
- **Zod** for all user input (forms, API bodies, search params).
- Validate on both client (form) and server (action / API).
- Sanitize free-text fields to prevent XSS (strip HTML tags).
- File uploads: validate MIME type and size on the server.

### Rate Limiting
- In-memory rate limiter for auth endpoints (5 requests / 15 min per IP-action pair).
- API route rate limits defined in `RATE_LIMIT` constants.
- Burst limits for authenticated users, strict limits for anonymous.

### Secrets & Environment
- All secrets in `.env.local` / environment variables — never in code.
- Use Zod-enforced `env` schema at build time to validate required variables.
- No secrets in logs, error messages, or client bundles.

---

## 8. Performance Standards

### Caching
- **Next.js Data Cache** for Prisma queries on read-heavy pages.
- **React Cache** (`unstable_cache`) for expensive computed values.
- Stale-while-revalidate pattern for dashboard and project listings.
- Cache TTLs defined in `CACHE` constants (`PROJECT_TTL_SECONDS`, `TASK_TTL_SECONDS`).

### Bundle Optimization
- Dynamic imports for heavy libraries (charts, markdown renderers, CSV export).
- Use `next/dynamic` with `ssr: false` for client-only libraries.
- Tree-shakeable imports — never `import *` from utility libraries.
- Monitor bundle size with `@next/bundle-analyzer`.

### Image Optimization
- Use `next/image` for all user-uploaded and static images.
- Configure remote image patterns in `next.config.ts`.
- Lazy load below-the-fold images.

### Database Performance
- Use Prisma `select` to fetch only required fields — never `include` everything.
- Paginate all list queries with cursor-based pagination.
- Batch notifications and audit log inserts with `createMany`.

---

## 9. Git Workflow

### Conventional Commits
```
type(scope): description

Types: feat, fix, refactor, test, docs, chore, security, perf
Scope: auth, tasks, projects, ui, api, db, deps
```

Examples:
- `feat(tasks): add drag-and-drop reordering`
- `fix(auth): handle expired session token gracefully`
- `refactor(api): extract pagination middleware`

### Branch Naming
```
<type>/<short-description>
Examples: feat/drag-drop-tasks, fix/session-expiry, refactor/pagination-middleware
```

### Pull Request Process
1. Branch from `main`.
2. Open PR with a descriptive title matching conventional commit format.
3. PR body summarizes changes, links related issues, and notes any migrations.
4. At least one approval required before merge.
5. Squash-merge into `main` with a cleaned-up commit message.
6. Delete branch after merge.

### Commit Hygiene
- One logical change per commit.
- No debugging artifacts (`console.log`, commented code, TODO without an issue).
- No direct pushes to `main`.

---

## 10. Accessibility Standards

### Target
- **WCAG 2.1 Level AA** compliance.

### Requirements
- All interactive elements must be keyboard accessible.
- Custom form controls must have proper `aria-*` attributes and `role` mappings.
- Color is never the sole indicator of state — use icons, text, or patterns alongside.
- Focus indicators must be visible (minimum 2:1 contrast ratio with adjacent colors).
- Heading hierarchy must be logical and not skip levels.
- All images must have meaningful `alt` text (or `alt=""` for decorative).

### Testing
- Run `@axe-core/playwright` in E2E tests for automated audit.
- Test keyboard navigation flows manually before release.
- Use `prefers-reduced-motion` to respect user motion preferences.

### Implementation
- Use semantic HTML elements (`<nav>`, `<main>`, `<button>`, `<input type="date">`).
- Use Radix UI or Reach UI primitives for complex components (dialogs, menus, comboboxes).
- Server Components render accessible HTML by default — avoid unnecessary client-side DOM manipulation.

---

## 11. Error Handling Patterns

### Server Actions & API Routes
- All mutations wrapped in try/catch returning the `ApiError` shape.
- Expected errors (validation, not found, conflict) return structured errors with appropriate HTTP codes.
- Unexpected errors (DB connection failure, unhandled exception) log the error and return a generic 500.
- Include `traceId` in every error response for correlation.

### Components
- Error boundaries at the route segment level (`error.tsx`).
- Use `Suspense` with fallbacks for data-loading states.
- Form errors displayed inline beneath the relevant field.
- Toast notifications for transient errors (network failure, save conflict).

### Logging
- Structured JSON logging to stdout.
- Include: `timestamp`, `level`, `message`, `traceId`, `userId`, `action`, `duration`.
- Never log secrets, tokens, or PII.
- Error level: unexpected failures that need investigation.
- Warn level: expected failures (validation, rate limit, not found).
- Info level: significant state changes (user registered, task created, project deleted).

---

## 12. Logging & Monitoring Standards

### Log Format
```json
{ "timestamp": "2026-07-21T10:00:00Z", "level": "info", "message": "Task created", "traceId": "abc-123", "userId": "usr_1", "action": "task:create", "duration": 45 }
```

### What to Log
| Event | Level | Fields |
|---|---|---|
| User registration | info | userId, email, organizationId |
| Login success/failure | info/warn | userId (if exists), ip, reason |
| Task CRUD | info | userId, taskId, action |
| Permission denied | warn | userId, permission requested |
| Rate limit hit | warn | ip, action, ttl |
| DB query failure | error | traceId, query, error message |
| Unhandled exception | error | traceId, stack trace, route |

### Monitoring
- Health check endpoint at `/api/health` returning DB connectivity and version.
- Track: P99 response time, error rate by endpoint, auth failure rate, rate limit hits.
- Alert on: error rate > 1%, P99 > 5s, auth failure spike > 10/min.
