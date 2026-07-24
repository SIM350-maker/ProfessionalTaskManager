# Forensic Audit Report: Professional Task Manager

**Date:** 2026-07-21
**Scope:** Full user journey audit — Landing Page → Authentication → Dashboard → Task CRUD → Project CRUD → Teams → Notifications → Reports → Admin → Profile/Settings
**Method:** Manual code review of every page, component, route handler, server action, service, and utility

---

## Table of Contents

1. [Landing Page](#1-landing-page)
2. [Authentication](#2-authentication)
3. [Dashboard](#3-dashboard)
4. [Tasks](#4-tasks)
5. [Projects](#5-projects)
6. [Teams](#6-teams)
7. [Notifications](#7-notifications)
8. [Reports](#8-reports)
9. [Admin](#9-admin)
10. [Profile](#10-profile)
11. [Settings](#11-settings)
12. [Cross-Cutting Concerns](#12-cross-cutting-concerns)
13. [Summary of Findings](#13-summary-of-findings)

---

## 1. Landing Page

### Files
- `apps/web/src/app/page.tsx` — Primary landing page
- `apps/web/src/app/(marketing)/page.tsx` — Duplicate landing page (dead code)

### 1.1 Duplicate Landing Page

| Aspect | Detail |
|--------|--------|
| **Observed** | `(marketing)/page.tsx` exists as a second landing page accessible at `/marketing`. It has a simpler design (no Kenyan context, no features grid, no pricing) and no navigation link or sitemap entry points to it. |
| **Expected** | Only one landing page should exist. |
| **Gap** | Dead code — unused route group adds maintenance burden and potential confusion. |
| **Recommendation** | Delete `apps/web/src/app/(marketing)/` entirely, or repurpose it if a marketing sub-page is planned. |

---

## 2. Authentication

### Files
- `apps/web/src/app/(auth)/auth/login/page.tsx`
- `apps/web/src/app/(auth)/auth/register/page.tsx`
- `apps/web/src/app/(auth)/auth/reset-password/page.tsx`
- `apps/web/src/app/(auth)/auth/reset-password/[token]/page.tsx`
- `apps/web/src/app/(auth)/auth/verify-email/[token]/page.tsx`
- `apps/web/src/app/api/v1/auth/route.ts`
- `apps/web/src/app/api/v1/auth/me/route.ts`
- `apps/web/src/providers/index.tsx`
- `apps/web/src/proxy.ts`
- `apps/web/src/lib/auth/index.ts`
- `apps/web/src/lib/session/index.ts`
- `apps/web/src/lib/security/rate-limiter.ts`

### 2.1 Test Credentials UI

| Aspect | Detail |
|--------|--------|
| **Observed** | Login page displays "Test Credentials" section with demo account buttons (Admin/Manager/Member) that auto-fill the login form. |
| **Expected** | Production apps should not expose test credentials. |
| **Gap** | Security concern — test credentials are hardcoded in the UI. |
| **Recommendation** | Remove test credentials in production builds, or gate behind an environment variable (`NEXT_PUBLIC_SHOW_TEST_CREDENTIALS`). |

### 2.2 Rate Limiter Initialization

| Aspect | Detail |
|--------|--------|
| **Observed** | `rate-limiter.ts` uses a module-level `RateLimiterMemory` instance. In serverless environments (Vercel deployments), memory is ephemeral — each cold start creates a new instance, defeating rate limiting. |
| **Expected** | Rate limiting should persist across requests using Redis or a database-backed store. |
| **Gap** | Memory-based rate limiting is invalid in serverless deployments. |
| **Recommendation** | Replace `RateLimiterMemory` with `RateLimiterRedis` or `RateLimiterPrisma`. |

---

## 3. Dashboard

### File: `apps/web/src/app/(app)/dashboard/page.tsx`

### 3.1 Misleading "Total Tasks" Metric

| Aspect | Detail |
|--------|--------|
| **Observed** | Dashboard "Total Tasks" counts only tasks assigned to the current user via `assignees: { some: { userId } }`. |
| **Expected** | "Total Tasks" should represent either all tasks in the organization (for Admin/Manager) or be labeled "My Tasks" to avoid confusion. |
| **Gap** | Misleading metric name — `totalTasks` implies organization-wide count but is user-scoped. |
| **Recommendation** | Rename to "My Tasks" and add a separate "All Tasks" metric visible to Admin/Manager roles, or adjust the query to be role-aware. |

### 3.2 No Permission-Based Metric Filtering

| Aspect | Detail |
|--------|--------|
| **Observed** | All metrics (total tasks, pending, in progress, completed, overdue) use the same `assignees: { some: { userId } }` filter regardless of role. |
| **Expected** | Admin/Manager should see broader scope metrics. |
| **Gap** | Dashboard treats all roles identically — no privileged view for Admin/Manager. |
| **Recommendation** | Implement role-aware queries: Admin sees org-wide, Manager sees team-wide, Member sees personal. |

---

## 4. Tasks

### Files
- `apps/web/src/app/(app)/tasks/page.tsx`
- `apps/web/src/app/(app)/tasks/new/page.tsx`
- `apps/web/src/app/(app)/tasks/[id]/page.tsx`
- `apps/web/src/app/(app)/tasks/[id]/edit/page.tsx`
- `apps/web/src/app/api/v1/tasks/route.ts`
- `apps/web/src/app/api/v1/tasks/[id]/route.ts`
- `apps/web/src/actions/index.ts` (createTask, updateTask)

### 4.1 Permission Inconsistency: API Route vs Server Action

| Aspect | Detail |
|--------|--------|
| **Observed** | `POST /api/v1/tasks` returns 403 for TEAM_MEMBER (checks `ADMINISTRATOR | MANAGER`). However, the `createTask` server action has NO role check — any authenticated user including TEAM_MEMBER can create tasks via the server action. |
| **Expected** | Both entry points should enforce the same permission policy. |
| **Gap** | Inconsistent enforcement — TEAM_MEMBER blocked via API but allowed via server action. |
| **Recommendation** | Add `hasPermission(user, "create", "Task")` check in `createTask` server action, or align both paths to allow TEAM_MEMBER to create tasks if that is the intended design. |

### 4.2 Poor UX: Task Creation Form

| Aspect | Detail |
|--------|--------|
| **Observed** | `tasks/new/page.tsx` renders raw text inputs for "Project ID" and "Assignee IDs (comma separated)". Users must manually enter UUID strings. |
| **Expected** | Project selector dropdown and multi-select user picker. |
| **Gap** | Extremely poor user experience — raw UUID entry is error-prone and unacceptable for production. |
| **Recommendation** | Replace with `<ProjectSelect>` dropdown (fetching projects via `getProjects()`) and `<UserSelect>` multi-select (fetching users via `getUsers()`). |

### 4.3 Unused Icons Import

| Aspect | Detail |
|--------|--------|
| **Observed** | `tasks/new/page.tsx` imports `@heroicons/react/24/outline` but never uses any icon. |
| **Expected** | Remove unused imports. |
| **Gap** | Dead import clutters bundle. |
| **Recommendation** | Remove the import, or use icons in the form for visual enhancement. |

### 4.4 "New Task" Button Accessible But API Blocks

| Aspect | Detail |
|--------|--------|
| **Observed** | Sidebar "New Task" button and task list page show "Create Task" button for all roles including TEAM_MEMBER. However, creating via the API returns 403 for TEAM_MEMBER. |
| **Expected** | If TEAM_MEMBER cannot create tasks, the button should be hidden. |
| **Gap** | UI shows functionality that will fail at submission. |
| **Recommendation** | Hide "New Task" / "Create Task" buttons for TEAM_MEMBER, or adjust permission policy to allow task creation by all roles. |

### 4.5 Edit Task Authorization Weakness

| Aspect | Detail |
|--------|--------|
| **Observed** | Task detail edit page calls `updateTask` server action which checks `requireAuth()` but does NOT check whether the user has permission to edit the specific task (e.g., is assignee, is project manager, is admin). |
| **Expected** | Task editing should verify the user is the task creator, an assignee, the project manager, or has ADMINISTRATOR role. |
| **Gap** | Weak authorization — any authenticated user could potentially edit any task if they know the ID. |
| **Recommendation** | Add task-level authorization in `updateTask`: check `user.id === task.createdById || assignees.some(a => a.id === user.id) || hasPermission(user, "update", "Task")`. |

### 4.6 Cursor Pagination Has No Default Sort

| Aspect | Detail |
|--------|--------|
| **Observed** | `GET /api/v1/tasks` uses cursor-based pagination but has no explicit `orderBy` — Prisma defaults to ordering by primary key (`id`), not by creation date. |
| **Expected** | Tasks should be ordered by `createdAt` descending by default. |
| **Gap** | Task list may appear in arbitrary order. |
| **Recommendation** | Add `orderBy: { createdAt: 'desc' }` to the tasks API query. |

---

## 5. Projects

### Files
- `apps/web/src/app/(app)/projects/page.tsx`
- `apps/web/src/app/(app)/projects/new/page.tsx`
- `apps/web/src/app/(app)/projects/[id]/page.tsx`
- `apps/web/src/app/(app)/projects/[id]/edit/page.tsx`
- `apps/web/src/app/api/v1/projects/route.ts`

### 5.1 Sidebar Hides Projects from TEAM_MEMBER

| Aspect | Detail |
|--------|--------|
| **Observed** | Sidebar renders `Projects` link only for `ADMINISTRATOR | MANAGER`. TEAM_MEMBER cannot navigate to `/projects` from the sidebar. |
| **Expected** | If the pages exist and could render, either allow access or consider whether TEAM_MEMBER should view projects. |
| **Gap** | Content exists but entry point is blocked — confusing for TEAM_MEMBER users. |
| **Recommendation** | Either allow TEAM_MEMBER to view projects (with read-only access) or keep blocked consistently (hide page routes too). |

### 5.2 No Permission Checks on Project Pages

| Aspect | Detail |
|--------|--------|
| **Observed** | Project pages (`new`, `edit`, `detail`) do not call `hasPermission()` — they only call `requireAuth()` and use `getSessionUser()`. |
| **Expected** | Create/Edit project should require `MANAGER | ADMINISTRATOR` permission. |
| **Gap** | A TEAM_MEMBER who navigates directly to `/projects/new` could access the create form and potentially call the server action. |
| **Recommendation** | Add permission checks at the top of project page components for edit/create. |

### 5.3 Create Project Server Action Missing Permission Check

| Aspect | Detail |
|--------|--------|
| **Observed** | `createProject` server action in `actions/index.ts` only calls `requireAuth()` — no role or permission check. |
| **Expected** | Only MANAGER and ADMINISTRATOR should create projects. |
| **Gap** | TEAM_MEMBER could create projects via direct server action call. |
| **Recommendation** | Add `hasPermission(user, "create", "Project")` check. |

---

## 6. Teams

### Files
- `apps/web/src/app/(app)/teams/page.tsx`
- `apps/web/src/app/(app)/teams/new/page.tsx`
- `apps/web/src/app/(app)/teams/[id]/page.tsx`

### 6.1 Same Sidebar/Permission Issues as Projects

| Aspect | Detail |
|--------|--------|
| **Observed** | Sidebar hides Teams from TEAM_MEMBER (same pattern as Projects). No permission checks on team pages or server actions. |
| **Expected** | Same as Projects — consistent policy needed. |
| **Gap** | Same as Projects. |
| **Recommendation** | Apply the same resolution as Projects — either allow read-only access or block consistently. |

### 6.2 Team Detail Page Missing Member Display

| Aspect | Detail |
|--------|--------|
| **Observed** | `teams/[id]/page.tsx` fetches team and members but only renders member count — does not list member names, avatars, or roles within the team. |
| **Expected** | Team detail should show all members with their names, emails, and roles. |
| **Gap** | Limited team detail — users cannot see who is in the team. |
| **Recommendation** | Render a member list/table on the team detail page. |

---

## 7. Notifications

### Files
- `apps/web/src/app/(app)/notifications/page.tsx`
- `apps/web/src/app/api/v1/notifications/route.ts`

### 7.1 No Real-Time Notifications

| Aspect | Detail |
|--------|--------|
| **Observed** | Notification page fetches from `GET /api/v1/notifications` on page load only. No WebSocket, SSE, or polling mechanism for real-time delivery. |
| **Expected** | Notifications should arrive in real-time (WebSocket) or via periodic polling. |
| **Gap** | Users must manually refresh to see new notifications. |
| **Recommendation** | Implement a WebSocket connection (Socket.IO or native WebSocket) or add periodic polling (`setInterval` refetch every 30s). |

### 7.2 No "Mark All Read" or Batch Actions

| Aspect | Detail |
|--------|--------|
| **Observed** | Notification page lists notifications individually with no ability to mark all as read or batch-delete. |
| **Expected** | Common notification UX patterns include "Mark All Read", "Delete All", and bulk select. |
| **Gap** | Missing batch operations for notification management. |
| **Recommendation** | Add "Mark All Read" button with server action, and per-item mark-read/delete. |

---

## 8. Reports

### File: `apps/web/src/app/(app)/reports/page.tsx`

### 8.1 Missing Permission Guard

| Aspect | Detail |
|--------|--------|
| **Observed** | Reports page imports `hasPermission` but never calls it. Only `requireAuth()` is called. A TEAM_MEMBER can access `/reports` directly by URL. |
| **Expected** | Reports should require MANAGER or ADMINISTRATOR permission. |
| **Gap** | No authorization — unauthorized role access to reports. |
| **Recommendation** | Add `if (!hasPermission(user, "view", "Report")) redirect("/dashboard")` or equivalent check. |

### 8.2 No Sidebar Link for Reports (Hidden)

| Aspect | Detail |  
|--------|--------|
| **Observed** | Sidebar does NOT render a Reports link. The only way to reach it is by typing `/reports` in the URL bar. |
| **Expected** | If a page exists and is accessible, it should have a navigation entry. |
| **Gap** | Orphan page — no UI navigation path. |
| **Recommendation** | Either add Reports to the sidebar (with permission guard) or remove the page if not ready for release. |

---

## 9. Admin

### Files
- `apps/web/src/app/(app)/admin/users/page.tsx`
- `apps/web/src/app/(app)/admin/organization/page.tsx`

### 9.1 No Permission Guard on Admin Pages

| Aspect | Detail |
|--------|--------|
| **Observed** | Admin pages call `requireAuth()` but do not call `hasPermission()` or check for ADMINISTRATOR role. |
| **Expected** | Admin pages must be restricted to ADMINISTRATOR role. |
| **Gap** | A MANAGER or TEAM_MEMBER navigating to `/admin/users` could access the page. |
| **Recommendation** | Add `if (user.role !== "ADMINISTRATOR") redirect("/dashboard")` at the top of admin pages. |

### 9.2 Organization Page: `createdAt` Field

| Aspect | Detail |
|--------|--------|
| **Observed** | `admin/organization/page.tsx` uses `formatDateTime(org.createdAt)` — this field has `@default(now())` in Prisma which is database-level, not application-level. |
| **Expected** | `createdAt` should be populated automatically by Prisma on insert. This should work correctly. |
| **Gap** | No bug here — note confirmed working. |
| **Recommendation** | None. |

### 9.3 User List Page Has No Edit/Deactivate Actions

| Aspect | Detail |
|--------|--------|
| **Observed** | `admin/users/page.tsx` fetches and displays users but provides no actions — no edit role, no deactivate, no delete. |
| **Expected** | Admin user management should support at minimum: change role, deactivate/activate, delete user. |
| **Gap** | Read-only user list — no management capability. |
| **Recommendation** | Add inline or modal-based actions: role dropdown, activate/deactivate toggle, delete with confirmation. |

---

## 10. Profile

### File: `apps/web/src/app/(app)/profile/page.tsx`

### 10.1 Read-Only Profile Page

| Aspect | Detail |
|--------|--------|
| **Observed** | Profile page is a Server Component that renders user data (name, email, role) but has NO edit form or action. |
| **Expected** | Users should be able to update their name/email/password. |
| **Gap** | No self-service profile editing capability. |
| **Recommendation** | Add an edit form with server action for updating name/email, and a separate password change section. |

### 10.2 No Avatar Upload

| Aspect | Detail |
|--------|--------|
| **Observed** | Profile displays `avatarUrl` if present but offers no upload mechanism. |
| **Expected** | Users should be able to upload/profile picture. |
| **Gap** | Missing avatar upload functionality. |
| **Recommendation** | Add file upload (using `uploadthing`, `cloudinary`, or direct S3 upload) for profile pictures. |

---

## 11. Settings

### File: `apps/web/src/app/(app)/settings/page.tsx`

### 11.1 Stale `defaultChecked` for Notification Preferences

| Aspect | Detail |
|--------|--------|
| **Observed** | Settings page is fully client-side. Notification preference checkboxes use `defaultChecked` with hardcoded `true` — they are not populated from the server. |
| **Expected** | Checkboxes should reflect the user's actual saved preferences fetched from the server. |
| **Gap** | Stale defaults — toggling a checkbox then reloading reverts to the hardcoded default. |
| **Recommendation** | Fetch notification preferences from the server on mount, store in state, and use `checked` (not `defaultChecked`) bound to state. Wire toggles to a server action for persistence. |

### 11.2 No Server-Side Data Fetching

| Aspect | Detail |
|--------|--------|
| **Observed** | Settings page is `"use client"` with no initial server data fetch. The page does not call `getSessionUser()` or any API to load preferences. |
| **Expected** | Settings should preload current user preferences. |
| **Gap** | Empty/incorrect initial state. |
| **Recommendation** | Use a mix of server component for initial render + client component for interactivity, or fetch preferences via API on mount. |

### 11.3 Hardcoded Theme Toggle

| Aspect | Detail |
|--------|--------|
| **Observed** | Theme toggle (dark/light) is defined in the settings UI but `globals.css` has a hardcoded dark theme with no toggle logic implemented. |
| **Expected** | Theme toggle should persist preference (localStorage/cookie) and apply CSS class to `<html>` element. |
| **Gap** | Theme toggle is non-functional — clicking it has no effect. |
| **Recommendation** | Implement theme switching: toggle sets `data-theme` attribute on `<html>`, persist to localStorage, apply on initial load. |

---

## 12. Cross-Cutting Concerns

### 12.1 Sidebar

**File:** `src/components/layouts/sidebar.tsx`

| # | Finding | Severity |
|---|---------|----------|
| 12.1.1 | **No navigation icons** — sidebar items are plain text with no icons, no visual hierarchy. | Medium |
| 12.1.2 | **No collapse/expand** — sidebar is always full-width, no minimize option. | Low |
| 12.1.3 | **No mobile responsiveness** — sidebar does not hide or become a hamburger menu on small screens. | High |
| 12.1.4 | **Sidebar items are hardcoded strings** — not keys, cannot be internationalized. | Low |
| 12.1.5 | **"New Task" and "Tasks" displayed to TEAM_MEMBER but creation is blocked by API** (see 4.4). | High |

### 12.2 Header

**File:** `src/components/layouts/header.tsx`

| # | Finding | Severity |
|---|---------|----------|
| 12.2.1 | **No breadcrumbs** — no navigation context for deep pages (e.g., Task detail -> Edit). | Medium |
| 12.2.2 | **No search** — no global search bar for finding tasks/projects. | Low |

### 12.3 Server Actions

**File:** `apps/web/src/actions/index.ts`

| # | Finding | Severity |
|---|---------|----------|
| 12.3.1 | `createTask` allows TEAM_MEMBER (no permission check) — inconsistent with API route. | Critical |
| 12.3.2 | `updateTask` lacks task-level authorization — any authenticated user can edit any task. | Critical |
| 12.3.3 | `createProject` allows TEAM_MEMBER (no permission check). | High |
| 12.3.4 | `deleteTask`, `deleteProject` — no existence or authorization checks. | High |

### 12.4 API Routes

**File:** `apps/web/src/app/api/v1/tasks/route.ts`

| # | Finding | Severity |
|---|---------|----------|
| 12.4.1 | `GET /api/v1/tasks` has no default `orderBy` — tasks appear in arbitrary order. | Medium |
| 12.4.2 | `GET /api/v1/tasks` uses cursor pagination but no validation on cursor parameter. | Low |

### 12.5 UI Components

**File:** `src/components/ui/input.tsx`

| # | Finding | Severity |
|---|---------|----------|
| 12.5.1 | Input has `text-gray-900` hardcoded (override). May conflict with dark mode styling. | Low |

### 12.6 Routing

| # | Finding | Severity |
|---|---------|----------|
| 12.6.1 | **No 404 page** within `(app)` route group — navigating to `/nonexistent` shows blank main area. | Medium |
| 12.6.2 | **Duplicate landing page** at `(marketing)/page.tsx` — dead code. | Low |

---

## 13. Summary of Findings

### Critical
| ID | Finding | File |
|----|---------|------|
| 4.1 | API route blocks TEAM_MEMBER task creation but server action allows it | `tasks/route.ts` vs `actions/index.ts` |
| 4.5 | No task-level authorization on task update | `actions/index.ts` |
| 8.1 | Reports page has no permission guard | `reports/page.tsx` |
| 9.1 | Admin pages have no permission guard | `admin/users/page.tsx`, `admin/organization/page.tsx` |
| 11.1 | Settings notification preferences use stale `defaultChecked` | `settings/page.tsx` |

### High
| ID | Finding | File |
|----|---------|------|
| 3.1 | Dashboard "Total Tasks" is user-scoped, misleading | `dashboard/page.tsx` |
| 4.2 | Task creation form uses raw UUID inputs | `tasks/new/page.tsx` |
| 5.2 | Project pages have no permission checks | `projects/*/page.tsx` |
| 6.2 | Team detail page does not list members | `teams/[id]/page.tsx` |
| 10.1 | Profile page is read-only with no edit form | `profile/page.tsx` |
| 12.1.3 | Sidebar has no mobile responsiveness | `sidebar.tsx` |

### Medium
| ID | Finding | File |
|----|---------|------|
| 1.1 | Duplicate landing page (dead code) | `(marketing)/page.tsx` |
| 4.6 | Tasks API has no default sort order | `api/v1/tasks/route.ts` |
| 7.1 | No real-time notifications | `notifications/page.tsx` |
| 7.2 | No batch notification actions | `notifications/page.tsx` |
| 9.3 | Admin user list has no management actions | `admin/users/page.tsx` |
| 12.6.1 | No 404 page within app route group | routing |

### Low
| ID | Finding | File |
|----|---------|------|
| 2.1 | Test credentials exposed in UI | `auth/login/page.tsx` |
| 2.2 | Memory-based rate limiter (invalid in serverless) | `rate-limiter.ts` |
| 4.3 | Unused icons import | `tasks/new/page.tsx` |
| 11.3 | Theme toggle is non-functional | `settings/page.tsx` |
| 12.5.1 | Hardcoded text color in Input component | `input.tsx` |

---

## Appendix: Fix Priority Order

1. **Permission mismatches** (4.1, 4.5, 8.1, 9.1) — security issues, users can access unauthorized functionality
2. **Server action authorization** (12.3.1, 12.3.2, 12.3.3, 12.3.4) — missing permission checks in actions
3. **Settings defaults** (11.1) — user preferences not persisted
4. **Profile read-only** (10.1) — core user self-service missing
5. **Task creation UX** (4.2) — raw UUID inputs unacceptable
6. **Dashboard metrics** (3.1) — misleading data display
7. **Team detail** (6.2) — missing member list
8. **Mobile sidebar** (12.1.3) — responsive design gap
9. **Dead code** (1.1) — remove duplicate landing page
10. **Polish** (all Low severity items)
