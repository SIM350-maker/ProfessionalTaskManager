# System Architecture

## Project

Professional Task Manager

Version: 2.0

---

# 1. Architecture Style

The application follows a Modular Monolith architecture.

Each business capability is implemented as an independent module while sharing a single deployment unit and database.

Modules communicate through well-defined interfaces rather than direct coupling.

---

# 2. Module Boundaries and Dependency Rules

Module boundaries are defined by business capability. No module may import the internal types, repositories, or services of another module. All cross-module communication flows through explicit interface contracts defined in each module's public `index.ts`.

Allowed dependency direction:

- Presentation Layer may depend on Application Layer interfaces.
- Application Layer may depend on Domain and Repository interfaces.
- Domain Layer must not depend on any other module.
- Infrastructure Layer must not depend on Application or Domain layers.

## 2.1 Major Modules

### Authentication Module

Responsibilities

- Registration
- Login
- Logout
- Password Reset
- Session Management

### User Management Module

Responsibilities

- User Profiles
- Roles
- Permissions
- Team Membership
- User Administration

### Project Management Module

Responsibilities

- Create Projects
- Update Projects
- Archive Projects
- Delete Projects

### Task Management Module

Responsibilities

- Create Tasks
- Assign Tasks
- Update Status
- Priorities
- Due Dates
- Task Reassignment

### Notification Module

Responsibilities

- Email Notifications
- In-App Notifications
- Reminder Scheduling

The Notification module is event-driven. It subscribes to domain events emitted by other modules and does not import their internal types.

### Reporting Module

Responsibilities

- Productivity Reports
- Dashboard Statistics
- Export Reports

The Reporting module is a read-model bounded context. It consumes domain events or dedicated read models and does not query other modules' write tables directly.

### Audit Module

Responsibilities

- Immutable audit trail for all create, update, and delete operations

The Audit module is a cross-cutting concern with no dependencies on other modules' internals. All modules emit audit events; the Audit module persists them.

---

# 3. Multi-Tenancy and Data Isolation

The application is multi-tenant. Every table that carries tenant data includes an `organizationId` column.

Row-level security (RLS) is enabled in PostgreSQL as a safety net. All queries must filter by `organizationId`. A query builder or repository base class enforces this at the data access layer to prevent accidental omission.

---

# 4. High-Level Architecture

Browser

↓

Next.js Frontend

↓

API Layer (Route Handlers / Server Actions)

↓

Application Layer (Use Case Orchestrators)

↓

Domain Layer (Business Rules)

↓

Data Access Layer (Prisma Repositories)

↓

PostgreSQL Database

↓

Supporting Services

- Authentication (Custom Session-Based Auth)
- Authorization (Policy Engine)
- Logging (Structured)
- Notifications (Background Jobs)
- File Storage (Object Storage)
- Search (Full-Text Search)
- Audit (Append-Only Event Store)

---

# 5. Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Next.js Route Handlers
- Server Actions

Database

- PostgreSQL

ORM

- Prisma

Authentication

- Custom Session-Based Authentication
  - Server-side session tokens stored in database (Session model)
  - httpOnly, Secure, SameSite cookies
  - Session rotation on login/logout
  - Email verification flow
  - Password reset flow with token-based validation
  - bcryptjs for password hashing (12 rounds)

Authorization

- Custom permission matrix enforced at service layer
- 3 roles: ADMINISTRATOR, MANAGER, TEAM_MEMBER
- Granular permissions: task:create, project:update, user:read, etc.

Validation

- Zod

State Management

- React Query (TanStack Query)

Background Jobs

- Inngest, BullMQ, or Vercel Cron with a queue

File Storage

- S3-compatible object storage with signed URLs

Search

- PostgreSQL full-text search (initial)
- Dedicated search engine planned for future scaling

Testing

- Vitest
- Playwright

Deployment

- Vercel

Version Control

- Git & GitHub

---

# 6. Layered Architecture

Presentation Layer

Responsible for user interaction. Includes the public landing page (`/`), authentication pages (`/auth/*`), and the main application dashboard (`/dashboard`, `/projects/*`, `/tasks/*`, etc.). Route Handlers and Server Actions are thin controllers that delegate to Application Layer use cases.

Application Layer

Coordinates use cases and orchestrates services. Contains no business rules.

Domain Layer

Implements business rules and workflows. Contains entities, value objects, and domain services. No dependencies on frameworks or infrastructure.

Data Access Layer

Handles database communication through Prisma repositories. Enforces `organizationId` filtering and optimistic locking.

Database Layer

Stores persistent application data.

Infrastructure Layer

External integrations: object storage, email provider, job queue, search engine.

---

# 7. Module Internal Structure

Each module follows this internal structure:

```
src/modules/{module-name}/
  controllers/
  services/
  repositories/
  types/
  index.ts
```

`index.ts` exports only the module's public interface. No internal file is imported directly by another module.

Route Handlers reside in the Presentation Layer and delegate to Application Layer orchestrators, which in turn call module services.

---

# 8. Authorization

Authentication is handled by a custom session-based system. Server-side sessions are stored in the database with httpOnly cookies. Authorization is handled by a centralized permission matrix (see `src/lib/auth/index.ts`) enforced at the service layer.

The permission matrix defined in the SRS is implemented as authorization policies. Every service method that performs a sensitive operation checks the current user's role and permissions before proceeding.

Authorization is not enforced only at the route level. Defense in depth requires enforcement at the service and repository layers.

---

# 9. Audit Logging

All create, update, and delete operations emit audit events. The Audit module persists these events in an append-only store.

Audit logs are immutable. There is no update or delete path. Logs are retained for a minimum of 90 days.

---

# 10. File Storage

User-uploaded attachments are stored in S3-compatible object storage, not in the database.

Downloads use signed URLs with expiration. Uploads are validated for size and content type. Server-side virus scanning is performed on all uploaded files.

Allowed file types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, GIF, TXT.

Maximum file size: 10 MB per file, 50 MB per task.

---

# 11. Background Processing

Email notifications, reminder scheduling, and report exports are processed asynchronously by a background job processor.

The job processor implements retry with exponential backoff (1s, 2s, 4s) up to 3 attempts. After 3 failures, the system surfaces an error to the user and logs the failure.

Notification latency requirement: within 60 seconds of the triggering event.

---

# 12. Search and Filtering

Task search uses PostgreSQL full-text search on title, description, assignee name, and status.

Filters for status, priority, assignee, due date range, and project are combinable. The system displays the count of matching results.

Search results must return within 2 seconds. A dedicated search engine is planned for future scaling if full-text search performance degrades.

---

# 13. Caching

Dashboard statistics and permission-heavy endpoints are cached to reduce database load.

Cache invalidation follows write-through or event-driven invalidation patterns appropriate to the data freshness requirements.

---

# 14. Error Handling and Observability

Errors are handled centrally. All errors are logged with structured context including user ID, organization ID, request ID, and timestamp.

Structured logging is used across all layers. Metrics and distributed tracing are collected for monitoring and incident response.

---

# 15. Rate Limiting

Rate limiting is applied at the API layer to protect against abuse and ensure fair resource allocation.

---

# 16. Security Controls

- HTTPS is enforced for all communication.
- CSRF protection is enabled for Server Actions.
- Content Security Policy (CSP) headers are configured.
- Secrets are managed through environment variables with strict access control and rotation policies.
- Field-level encryption is planned for sensitive PII such as email addresses.

---

# 17. Request Lifecycle

1. User performs an action.
2. Frontend validates basic input.
3. Request is sent to the server.
4. Authentication is verified by session token validation (middleware reads `session_token` cookie, validates against Session table).
5. Authorization is checked by the policy engine at the service layer.
6. Business rules execute in the Domain Layer.
7. Database is updated through repositories with `organizationId` enforcement.
8. Domain events are emitted.
9. Audit events are persisted.
10. Background jobs are enqueued for notifications, reminders, or exports.
11. Response is returned.
12. UI refreshes.

---

# 18. Scalability Considerations

- Read replicas are planned for the primary PostgreSQL instance to separate OLTP reads from reporting workloads.
- Database connection pooling (e.g., PgBouncer) is configured for horizontal scaling.
- The Reporting module uses dedicated read models to avoid competing with OLTP writes.
- File storage is externalized to support growth without database expansion.
- A dedicated search engine is planned for future scaling beyond PostgreSQL full-text search capabilities.

---

# 19. Future-Proofing

- Custom authentication is implemented with a clean abstraction layer (`src/lib/session/`, `src/lib/auth/`) allowing future migration to SSO or OAuth providers.
- Feature flags are planned to decouple deployment from feature release.
- OpenAPI documentation is generated from Route Handlers.
- Disaster recovery and automated backup documentation is planned.
