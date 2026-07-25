# Re-Engineering Master Plan & Progress Tracker

## Project: Professional Task Manager — Dual-Mode Re-Engineering

**Version:** 3.0  
**Status:** In Planning — Awaiting Execution  
**Date:** 2026-07-25  

---

## 1. Executive Summary

The existing system is exclusively organization-centric: every user must belong to an organization, every task belongs to a project within an organization, and access is controlled by org-scoped roles (Administrator, Manager, Team Member).

This re-engineering extends the system to support **two distinct modes of operation**:

1. **Personal Mode** — Individual users manage their own tasks without any organization.
2. **Organization Mode** — Existing behavior preserved; users belong to organizations with teams, projects, and role-based access.

The goal is a single application that serves both a random individual who just wants to track personal tasks and a team leader who needs to assign work, monitor progress, and collaborate.

---

## 2. Architecture Decisions

The following decisions lock the architecture. Do not deviate without updating this document and re-validating dependent phases.

### Decision 1: Registration & Onboarding

**Choice: A — Choose mode at registration**

- The signup form presents two paths: **"Personal Workspace"** and **"Organization / Team"**.
- Personal registrations create a user with `organizationId = null` and immediately provision a personal workspace.
- Organization registrations enter the existing flow: create organization, assign initial role, invite members.

### Decision 2: Personal Tasks in the Data Model

**Choice: A — Reuse existing Task/Project models with nullable `organizationId` and nullable `projectId`**

- Personal users get an auto-created **Personal Workspace Project** (`name: "Personal Tasks"`, `isPersonal: true`, `visibility: PRIVATE`).
- Personal tasks belong to this auto-project. `organizationId` is `null`.
- All existing task features (comments, attachments, labels, workflows, time entries) continue to work without schema duplication.
- Existing org-scoped queries continue to filter `organizationId != null`.

### Decision 3: Collaboration Boundary for Personal Users

**Choice: A — Strictly solo**

- Personal users cannot invite collaborators, create teams, or share tasks.
- If a personal user later needs team features, they create an organization and optionally migrate tasks.
- This avoids permission complexity and keeps the personal architecture simple.

### Decision 4: Task Leader Mapping

**Choice: A — Task leader = contextual Manager role, with optional `leadId` field on Project**

- The existing Manager role already creates and assigns tasks.
- A new optional `Project.leadId` field designates the project lead.
- Within a project, the lead has UI prominence ("Task Leader" label) but permissions remain governed by the Manager role.
- No new global role is introduced.

### Decision 5: Portal / Dashboard Differences

**Choice: A — Navigation structure + available actions differ; shared components underneath**

- Personal portal sidebar: My Tasks, Personal Projects, Calendar, Settings.
- Organization portal sidebar: My Tasks, Projects, Teams, Reports, Admin (conditional), Settings.
- Task list, Kanban, task detail, comment, and attachment components are shared between both modes.
- Conditional rendering based on `user.organizationId` determines which sidebar items are visible.

### Decision 6: Existing Data Migration

**Choice: A — Preserve existing org-only behavior; personal mode is opt-in for new users**

- All existing seed data, organizations, and users remain unchanged.
- New registrations choose their mode.
- A future migration script can be written to allow existing users to opt into personal mode, but it is not part of this plan.

---

## 3. System Architecture (Post-Re-Engineering)

```
User
│
├──[Registration]──► Personal Mode ──► Personal Workspace Project (auto-created)
│                                         └── Tasks (organizationId = null)
│
└──[Registration]──► Organization Mode ─► Organization
                                                ├── Teams
                                                ├── Projects
                                                │     └── Tasks (organizationId != null)
                                                └── Roles (Administrator / Manager / Team Member)
```

### Data Model Changes

| Model | Change |
|-------|--------|
| `User` | `organizationId` becomes nullable. Add `isPersonalMode` boolean. |
| `Project` | `isPersonal` boolean added. `organizationId` becomes nullable. |
| `Task` | `organizationId` already exists; enforce nullable for personal tasks. |
| `ProjectMember` | Not used for personal projects. |
| All other models | Unchanged. |

### Permission Matrix (Extended)

| Action | Personal User | Org: Team Member | Org: Manager | Org: Administrator |
|--------|--------------|------------------|--------------|-------------------|
| Create personal task | Yes | Yes (own tasks) | Yes | Yes |
| Create org task | No | No | Yes | Yes |
| Assign task | No (solo only) | No | Yes | Yes |
| Create personal project | Yes | Yes | Yes | Yes |
| Create org project | No | No | Yes | Yes |
| Manage teams | No | No | No | Yes |
| Manage users | No | No | No | Yes |
| Manage roles | No | No | No | Yes |

---

## 4. Personal User Flow (End-to-End)

```
1. Landing Page (/)
   └── CTA: "Get Started — Personal" or "Get Started — Organization"

2. Registration (/auth/register)
   └── Mode selection: Personal | Organization
       ├── Personal: name, email, password
       │   └── Creates User (organizationId = null, isPersonalMode = true)
       │   └── Auto-creates Personal Workspace Project
       │   └── Auto-logs in → redirect to /app/dashboard
       │
       └── Organization: name, email, password, org name
           └── Creates Organization
           └── Creates User (role = ADMINISTRATOR)
           └── Auto-logs in → redirect to /app/dashboard

3. Personal Portal (/app)
   ├── Sidebar: My Tasks | Personal Projects | Calendar | Settings
   ├── Dashboard (/app/dashboard)
   │   ├── My Tasks widget (personal tasks only)
   │   ├── Overdue tasks widget
   │   └── Completed this week widget
   │
   ├── My Tasks (/app/tasks)
   │   ├── Task list / Kanban (personal tasks only)
   │   ├── Create Task button
   │   └── Filters: status, priority, due date
   │
   ├── Personal Projects (/app/projects)
   │   ├── Personal Workspace Project (auto-created, cannot be deleted)
   │   └── Create personal project button
   │
   ├── Task Detail (/app/tasks/[id])
   │   ├── Title, description, status, priority, due date
   │   ├── Subtasks
   │   ├── Comments
   │   ├── Attachments
   │   ├── Time entries
   │   └── Activity timeline
   │
   ├── Calendar (/app/calendar)
   │   └── Personal task due dates
   │
   └── Settings (/app/settings)
       ├── Profile
       ├── Password
       ├── Notification preferences
       └── Create Organization (upgrade path)

4. Task Lifecycle (Personal)
   ├── Create → status: TODO
   ├── Start → status: IN_PROGRESS
   ├── Block → status: BLOCKED
   ├── Complete → status: COMPLETED
   └── Reopen → status: IN_PROGRESS (if needed)
```

---

## 5. Organization User Flow (End-to-End)

```
1. Landing Page (/)
   └── CTA: "Get Started — Organization"

2. Registration (/auth/register)
   └── Organization mode
       ├── Creates Organization
       ├── Creates Admin User
       └── Redirect to /app/dashboard

3. Organization Portal (/app)
   ├── Sidebar: My Tasks | Projects | Teams | Reports | Admin | Settings
   │
   ├── Admin (/app/admin)
   │   ├── Users (/app/admin/users)
   │   │   ├── Create user
   │   │   ├── Deactivate user
   │   │   └── Assign role
   │   │
   │   ├── Organization (/app/admin/organization)
   │   │   ├── Org settings
   │   │   ├── Roles & permissions
   │   │   └── Teams
   │   │
   │   └── Audit logs
   │
   ├── Projects (/app/projects)
   │   ├── Create project
   │   ├── Project detail (/app/projects/[id])
   │   │   ├── Tasks tab
   │   │   ├── Members tab
   │   │   ├── Settings tab
   │   │   └── Lead assignment
   │   └── Edit project
   │
   ├── Teams (/app/teams)
   │   ├── Create team
   │   ├── Add/remove members
   │   └── Team detail
   │
   ├── Reports (/app/reports)
   │   ├── Tasks by status
   │   ├── Tasks by assignee
   │   ├── Overdue tasks
   │   └── Export CSV
   │
   └── Settings (/app/settings)
       ├── Profile
       ├── Password
       ├── Notification preferences
       └── Slack integration

4. Task Lifecycle (Organization)
   ├── Manager creates task → assigns to Team Member(s)
   ├── Team Member updates status, adds comments
   ├── Manager monitors progress via dashboard/reports
   └── Notifications on assignment, completion, due date
```

---

## 6. Phased Implementation Plan

### Phase 0: Foundation & Validation

**Objective:** Establish baseline and validate the existing system is functional.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 0.1 | Run existing test suite | `apps/web/` | `npm test` passes |
| 0.2 | Validate seed data | `prisma/seed.ts` | `npx prisma db seed` completes |
| 0.3 | Confirm build passes | Root | `npm run build` passes |
| 0.4 | Document current state | `docs/` | This file is complete |

**Status:** ☐ Pending

---

### Phase 1: Data Model & Schema

**Objective:** Make schema changes to support dual-mode without breaking existing org behavior.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 1.1 | Make `User.organizationId` nullable | `prisma/schema.prisma` | Migration applies; existing data intact |
| 1.2 | Add `User.isPersonalMode` boolean | `prisma/schema.prisma` | Migration applies |
| 1.3 | Make `Project.organizationId` nullable | `prisma/schema.prisma` | Migration applies |
| 1.4 | Add `Project.isPersonal` boolean | `prisma/schema.prisma` | Migration applies |
| 1.5 | Add `Project.leadId` optional FK | `prisma/schema.prisma` | Migration applies |
| 1.6 | Update seed script for nullable org | `prisma/seed.ts` | Seed runs successfully |
| 1.7 | Backfill existing data | Migration + script | No null violations in existing data |
| 1.8 | Update validation schemas | `src/lib/validation/` | Zod schemas accept nullable org fields |

**Done when:** `npx prisma migrate dev` applies cleanly, `npx prisma db seed` passes, and existing org users/tasks are unaffected.

**Status:** ☐ Pending

---

### Phase 2: Registration & Authentication

**Objective:** New users can register in either mode and are authenticated correctly.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 2.1 | Update registration form with mode selection | `src/app/(auth)/auth/register/page.tsx` | UI shows Personal / Organization toggle |
| 2.2 | Update `registerUser` server action | `src/actions/index.ts` | Creates personal user OR org user based on mode |
| 2.3 | Auto-create Personal Workspace Project | `src/actions/index.ts` | Personal user has 1 project named "Personal Tasks" after registration |
| 2.4 | Auto-login after registration | `src/actions/index.ts` | New user lands on dashboard, not login page |
| 2.5 | Update session/user retrieval for nullable org | `src/lib/auth/index.ts` | `getCurrentUser` works for `organizationId = null` |
| 2.6 | Update proxy auth for dual mode | `src/proxy.ts` | Personal users access app; org users access app; unauthenticated redirect to login |
| 2.7 | Update RBAC permission checks | `src/lib/auth/index.ts`, `src/services/roles/` | Personal users bypass org permission checks where appropriate |
| 2.8 | Add `isPersonalMode` to session payload | `src/lib/session/index.ts` | Session includes mode flag |

**Done when:** A new user can register as Personal, land on dashboard, and see personal sidebar. A new user can register as Organization, create org, and see org sidebar.

**Status:** ☐ Pending

---

### Phase 3: Personal Workspace — Core Navigation & Layout

**Objective:** Personal users see a simplified portal with correct navigation.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 3.1 | Update app shell sidebar (conditional) | `src/app/(app)/layout.tsx`, `src/components/layout/Sidebar.tsx` | Personal users see 4 items; org users see 6+ items |
| 3.2 | Create personal dashboard page | `src/app/(app)/dashboard/page.tsx` | Shows personal tasks only |
| 3.3 | Create personal tasks list page | `src/app/(app)/tasks/page.tsx` | Lists tasks where `project.isPersonal = true` |
| 3.4 | Create personal projects page | `src/app/(app)/projects/page.tsx` | Lists personal projects only |
| 3.5 | Create personal settings page | `src/app/(app)/settings/page.tsx` | Profile, password, notifications, "Create Organization" CTA |
| 3.6 | Add "Create Organization" flow trigger | Settings page | CTA navigates to org creation wizard |
| 3.7 | Ensure all existing task components work with `organizationId = null` | Various | Kanban, task detail, comments, attachments render correctly |

**Done when:** A personal user can navigate all personal pages and see only their own data.

**Status:** ☐ Pending

---

### Phase 4: Personal Workspace — Task CRUD

**Objective:** Personal users can create, view, edit, and complete tasks.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 4.1 | Create personal task form | `src/app/(app)/tasks/new/page.tsx` | Form submits; task created in personal workspace |
| 4.2 | Update `createTask` server action | `src/actions/index.ts` | Assigns task to personal project when `organizationId = null` |
| 4.3 | Update `updateTask` server action | `src/actions/index.ts` | Personal users can edit their own tasks |
| 4.4 | Update `updateTaskStatus` server action | `src/actions/index.ts` | Status transitions work for personal tasks |
| 4.5 | Update `deleteTask` server action | `src/actions/index.ts` | Personal users can delete their own tasks |
| 4.6 | Task detail page (shared) | `src/app/(app)/tasks/[id]/page.tsx` | Loads personal task correctly |
| 4.7 | Task edit page (shared) | `src/app/(app)/tasks/[id]/edit/page.tsx` | Edits personal task correctly |
| 4.8 | Subtask support for personal tasks | Server actions + UI | Personal users can create subtasks |

**Done when:** A personal user can create a task, edit it, change status, add subtasks, and delete it.

**Status:** ☐ Pending

---

### Phase 5: Personal Workspace — Comments, Attachments & Activity

**Objective:** All existing task collaboration features work in personal mode.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 5.1 | Comments on personal tasks | Server actions + UI | Add, edit, delete comments |
| 5.2 | Attachments on personal tasks | Server actions + UI | Upload, download, delete attachments |
| 5.3 | Activity timeline on personal tasks | Server actions + UI | Shows status changes, comments, assignments |
| 5.4 | Time entries on personal tasks | Server actions + UI | Start/stop timer, log time |
| 5.5 | Labels on personal tasks | Server actions + UI | Create labels, apply to tasks |
| 5.6 | Notifications for personal tasks | Server actions + email | None expected (solo), but no errors thrown |

**Done when:** All collaboration features function identically for personal and org tasks.

**Status:** ☐ Pending

---

### Phase 6: Personal Workspace — Search, Filter & Calendar

**Objective:** Personal users can find and schedule their tasks.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 6.1 | Search personal tasks | API route / server action | Search by title/description |
| 6.2 | Filter personal tasks | UI components | Filter by status, priority, due date |
| 6.3 | Calendar page | `src/app/(app)/calendar/page.tsx` | Shows personal task due dates |
| 6.4 | iCal feed for personal tasks | API route | Generates valid ICS with personal tasks |

**Done when:** Personal user can search, filter, and view tasks on a calendar.

**Status:** ☐ Pending

---

### Phase 7: Organization Workspace — Role-Aware Navigation & RBAC

**Objective:** Organization users see the full portal with correct permissions.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 7.1 | Conditional sidebar rendering | Layout components | Shows Teams, Reports, Admin based on role |
| 7.2 | Role-based route protection | `src/lib/auth/index.ts` | Team Member cannot access /admin |
| 7.3 | Admin users page | `src/app/(app)/admin/users/page.tsx` | CRUD users, assign roles |
| 7.4 | Organization settings page | `src/app/(app)/admin/organization/page.tsx` | Update org name, settings |
| 7.5 | Roles & permissions management | UI + server actions | View/edit role permissions (admin only) |
| 7.6 | Teams page | `src/app/(app)/teams/page.tsx` | Create, edit, delete teams; add/remove members |
| 7.7 | Reports page | `src/app/(app)/reports/page.tsx` | Tasks by status, assignee, overdue; CSV export |

**Done when:** An Admin can manage users, roles, teams, and view reports. A Manager can create projects and tasks. A Team Member sees only their assigned tasks.

**Status:** ☐ Pending

---

### Phase 8: Task Leader & Project Lead

**Objective:** Organizations can designate a project lead who acts as the "task leader."

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 8.1 | Add `Project.leadId` field | `prisma/schema.prisma` | Migration applies |
| 8.2 | Lead assignment in project creation/edit | Server actions + UI | Manager can set lead |
| 8.3 | Lead display in project header | UI components | Shows "Task Leader: [Name]" |
| 8.4 | Lead-specific notifications | Server actions | Lead notified on task completion, overdue |
| 8.5 | Lead authority checks | `src/lib/auth/index.ts` | Lead can manage tasks within project |

**Done when:** A project lead can be designated and receives appropriate visibility and notifications.

**Status:** ☐ Pending

---

### Phase 9: Shared Task Management — Subtasks & Dependencies

**Objective:** Both personal and org tasks support subtasks and dependencies.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 9.1 | Subtask creation UI | Task detail page | Personal and org users can create subtasks |
| 9.2 | Subtask list rendering | Task detail page | Shows nested tasks with progress |
| 9.3 | Task dependency creation | Task detail / edit page | Set predecessor/successor |
| 9.4 | Dependency validation | Server actions | Prevent circular dependencies |
| 9.5 | Dependency visualization | UI (optional) | Gantt-style or list view |

**Done when:** Subtasks and dependencies work for both personal and organization tasks.

**Status:** ☐ Pending

---

### Phase 10: Notifications & Real-Time Updates

**Objective:** Users receive timely notifications for task events.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 10.1 | Notification preferences (shared) | Settings page | Users configure email/in-app preferences |
| 10.2 | Task assignment notification | Server actions + email | Assigned user notified within 60s |
| 10.3 | Due date reminder | Background job / cron | Reminder sent 24h before due |
| 10.4 | Task completion notification | Server actions + email | Creator and lead notified |
| 10.5 | In-app notification center | `src/app/(app)/notifications/page.tsx` | List, mark read, batch read |
| 10.6 | SSE notification stream | API route | Real-time updates in UI (optional for V1) |

**Done when:** Notifications are delivered for all task events in both personal and org modes.

**Status:** ☐ Pending

---

### Phase 11: Testing & Hardening

**Objective:** Ensure quality, security, and performance before launch.

| # | Deliverable | File(s) | Verification |
|---|-------------|---------|--------------|
| 11.1 | Unit tests for new server actions | `src/actions/__tests__/` | Coverage ≥ 70% for new code |
| 11.2 | Integration tests for dual-mode flows | Test suite | Personal and org registration flows pass |
| 11.3 | E2E tests (Playwright) | `e2e/` | Critical paths: register personal, create task, complete task |
| 11.4 | Security review | Codebase | No auth bypass for personal/org boundary |
| 11.5 | Performance audit | Build output | Page load ≤ 2s p95 |
| 11.6 | Lint + typecheck | Root | `npm run lint`, `npm run typecheck` pass |
| 11.7 | Manual QA checklist | Spreadsheet / file | All flows verified manually |

**Done when:** All automated tests pass, manual QA is signed off, and no critical defects remain.

**Status:** ☐ Pending

---

## 7. Progress Tracker

Instructions: Mark each item as ☐ Pending, 🔄 In Progress, or ✅ Done. Do not mark Done until the verification criterion is met.

### Phase 0: Foundation & Validation
- [ ] 0.1 Run existing test suite
- [ ] 0.2 Validate seed data
- [ ] 0.3 Confirm build passes
- [ ] 0.4 Document current state

### Phase 1: Data Model & Schema
- [ ] 1.1 Make `User.organizationId` nullable
- [ ] 1.2 Add `User.isPersonalMode`
- [ ] 1.3 Make `Project.organizationId` nullable
- [ ] 1.4 Add `Project.isPersonal`
- [ ] 1.5 Add `Project.leadId`
- [ ] 1.6 Update seed script
- [ ] 1.7 Backfill existing data
- [ ] 1.8 Update validation schemas

### Phase 2: Registration & Authentication
- [ ] 2.1 Update registration form
- [ ] 2.2 Update `registerUser` action
- [ ] 2.3 Auto-create Personal Workspace Project
- [ ] 2.4 Auto-login after registration
- [ ] 2.5 Update session/user retrieval
- [ ] 2.6 Update proxy auth
- [ ] 2.7 Update RBAC permission checks
- [ ] 2.8 Add `isPersonalMode` to session payload

### Phase 3: Personal Workspace — Core Navigation & Layout
- [ ] 3.1 Update sidebar (conditional)
- [ ] 3.2 Personal dashboard page
- [ ] 3.3 Personal tasks list page
- [ ] 3.4 Personal projects page
- [ ] 3.5 Personal settings page
- [ ] 3.6 "Create Organization" CTA
- [ ] 3.7 Shared components work with null org

### Phase 4: Personal Workspace — Task CRUD
- [ ] 4.1 Personal task form
- [ ] 4.2 Update `createTask` action
- [ ] 4.3 Update `updateTask` action
- [ ] 4.4 Update `updateTaskStatus` action
- [ ] 4.5 Update `deleteTask` action
- [ ] 4.6 Task detail page (shared)
- [ ] 4.7 Task edit page (shared)
- [ ] 4.8 Subtask support for personal tasks

### Phase 5: Personal Workspace — Comments, Attachments & Activity
- [ ] 5.1 Comments on personal tasks
- [ ] 5.2 Attachments on personal tasks
- [ ] 5.3 Activity timeline on personal tasks
- [ ] 5.4 Time entries on personal tasks
- [ ] 5.5 Labels on personal tasks
- [ ] 5.6 Notifications for personal tasks (no-op validation)

### Phase 6: Personal Workspace — Search, Filter & Calendar
- [ ] 6.1 Search personal tasks
- [ ] 6.2 Filter personal tasks
- [ ] 6.3 Calendar page
- [ ] 6.4 iCal feed for personal tasks

### Phase 7: Organization Workspace — Role-Aware Navigation & RBAC
- [ ] 7.1 Conditional sidebar rendering
- [ ] 7.2 Role-based route protection
- [ ] 7.3 Admin users page
- [ ] 7.4 Organization settings page
- [ ] 7.5 Roles & permissions management
- [ ] 7.6 Teams page
- [ ] 7.7 Reports page

### Phase 8: Task Leader & Project Lead
- [ ] 8.1 Add `Project.leadId`
- [ ] 8.2 Lead assignment UI
- [ ] 8.3 Lead display in project header
- [ ] 8.4 Lead-specific notifications
- [ ] 8.5 Lead authority checks

### Phase 9: Shared Task Management — Subtasks & Dependencies
- [ ] 9.1 Subtask creation UI
- [ ] 9.2 Subtask list rendering
- [ ] 9.3 Task dependency creation
- [ ] 9.4 Dependency validation
- [ ] 9.5 Dependency visualization

### Phase 10: Notifications & Real-Time Updates
- [ ] 10.1 Notification preferences
- [ ] 10.2 Task assignment notification
- [ ] 10.3 Due date reminder
- [ ] 10.4 Task completion notification
- [ ] 10.5 In-app notification center
- [ ] 10.6 SSE notification stream

### Phase 11: Testing & Hardening
- [ ] 11.1 Unit tests
- [ ] 11.2 Integration tests
- [ ] 11.3 E2E tests
- [ ] 11.4 Security review
- [ ] 11.5 Performance audit
- [ ] 11.6 Lint + typecheck
- [ ] 11.7 Manual QA checklist

---

## 8. File Manifest

All files to be created or modified during this re-engineering effort.

### Files to Create

```
docs/20_ReEngineering_Master_Plan.md          (this file)
docs/21_Dual_Mode_Architecture.md             (detailed architecture spec)
docs/22_Personal_User_Guide.md                (user-facing documentation)
docs/23_Organization_User_Guide.md            (user-facing documentation)
docs/24_API_Changes.md                        (API changelog)

src/lib/dual-mode/
  index.ts                                     (mode detection utilities)
  auth-gate.ts                                 (personal vs org auth checks)

src/app/(app)/calendar/
  page.tsx                                     (personal + org calendar)

src/app/(app)/settings/
  page.tsx                                     (shared, conditional sections)

e2e/
  personal-registration.spec.ts
  personal-task-lifecycle.spec.ts
  organization-registration.spec.ts
  organization-task-assignment.spec.ts
```

### Files to Modify

```
prisma/schema.prisma                          (nullable org fields, isPersonal, leadId)
prisma/seed.ts                                (handle nullable org in seed data)
prisma/migrations/                            (new migrations)

src/actions/index.ts                          (registration, task CRUD for dual mode)
src/lib/auth/index.ts                         (permission matrix, mode-aware checks)
src/lib/session/index.ts                      (session payload includes mode)
src/proxy.ts                                  (dual-mode auth routing)

src/app/(auth)/auth/register/page.tsx         (mode selection UI)
src/app/(app)/layout.tsx                      (conditional sidebar)
src/app/(app)/dashboard/page.tsx              (personal vs org widgets)
src/app/(app)/tasks/page.tsx                  (personal vs org task list)
src/app/(app)/projects/page.tsx               (personal vs org project list)
src/app/(app)/tasks/new/page.tsx              (personal vs org task form)
src/app/(app)/tasks/[id]/page.tsx             (shared, mode-aware)
src/app/(app)/tasks/[id]/edit/page.tsx        (shared, mode-aware)

src/components/layout/Sidebar.tsx             (conditional nav items)
src/components/layout/Header.tsx              (mode-aware user menu)

src/lib/validation/                           (nullable org fields in schemas)
src/services/roles/index.ts                   (mode-aware permission enforcement)
src/services/notifications/index.ts           (skip notifications for personal solo tasks)
```

---

## 9. Verification Checklist (Per Phase)

Each phase must pass its verification criterion before the next phase begins.

| Phase | Verification Command / Check | Pass Criteria |
|-------|------------------------------|---------------|
| 0 | `npm run build` | Build succeeds with zero errors |
| 1 | `npx prisma migrate dev && npx prisma db seed` | Migration applies; seed completes; org data intact |
| 2 | Manual registration (Personal + Org) | Both modes create correct user types; redirect to dashboard |
| 3 | Navigate personal portal | All 4 sidebar items work; no org-only pages accessible |
| 4 | Create/edit/complete personal task | Task appears in list; status changes persist |
| 5 | Add comment + attachment to personal task | Both appear in task detail |
| 6 | Search + filter + calendar | Results match personal tasks only |
| 7 | Login as Admin/Manager/Member | Correct sidebar items and permissions per role |
| 8 | Set project lead | Lead sees "Task Leader" label; receives notifications |
| 9 | Create subtask + dependency | Nested task renders; dependency enforced |
| 10 | Trigger task assignment | Notification delivered within 60s |
| 11 | `npm test && npm run lint && npm run typecheck` | All pass; manual QA checklist 100% |

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Nullable `organizationId` breaks existing queries | Medium | High | Review all Prisma queries; add `organizationId != null` where required |
| Personal mode permission bypass | Medium | High | Explicit personal-mode guards in every sensitive server action |
| Seed data fails after schema change | Medium | Medium | Update seed script before running migration |
| Frontend conditional rendering misses edge case | Medium | Medium | Unit tests for sidebar/navigation components |
| Users confuse personal vs org mode | Low | Medium | Clear onboarding labels and help text |

---

## 11. Glossary

| Term | Definition |
|------|------------|
| Personal Mode | A user operating without an organization; tasks are strictly solo |
| Organization Mode | A user operating within an organization with teams, projects, and roles |
| Personal Workspace Project | An auto-created project (`isPersonal: true`) that contains all personal tasks |
| Task Leader | The user designated as `Project.leadId`; has managerial authority within that project |
| Dual-Mode | The system's ability to serve both personal and organization users simultaneously |

---

*End of Master Plan. Update this document as each phase is completed. Do not mark a deliverable as Done until its verification criterion is met.*
