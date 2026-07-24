# Implementation Plan — Task Assignment File

## Project
Professional Task Manager

**Version:** 2.0  
**Date:** July 21, 2026  
**Status:** Ready for Execution

---

This file assigns specific implementation tasks to specialized agents. Each agent should execute their assigned tasks independently and report back.

---

## Agent 1: Frontend Engineer — Landing Page Redesign

**Assigned Tasks:** LP-1, LP-2, LP-3, LP-4

### Task LP-1: Redesign Landing Page
- **File to modify:** `apps/web/src/app/page.tsx`
- **Action:** Replace `redirect('/auth/login')` with full marketing landing page content
- **Requirements:**
  - Hero section with app name, tagline, and CTA buttons
  - Features section (6 cards): Task Management, Team Collaboration, Project Tracking, Time Tracking, Reports & Analytics, Role-Based Access
  - Use Cases section: Infrastructure Projects, Digital Transformation, Financial Services, Government Delivery
  - How It Works section: 3 steps (Create Account, Set Up Projects, Start Collaborating)
  - Pricing section: Free, Starter (KES 1,500/user/mo), Professional (KES 3,000/user/mo), Enterprise (Contact)
  - Footer with links
- **Design:** Use Tailwind CSS v4, keep existing brand colors, mobile-responsive
- **Dependencies:** None

### Task LP-2: Feature Showcase Components
- **Files to create:** `apps/web/src/components/landing/` directory with:
  - `Hero.tsx` — Hero section component
  - `FeaturesGrid.tsx` — Feature cards grid
  - `UseCases.tsx` — Use case cards
  - `HowItWorks.tsx` — Step-by-step guide
  - `PricingCards.tsx` — Pricing tier cards
  - `Footer.tsx` — Landing page footer
- **Design:** Server components where possible, Client Components only for interactive elements
- **Dependencies:** Task LP-1

### Task LP-3: SEO & Responsive Design
- **File to modify:** `apps/web/src/app/page.tsx`
- **Action:** Add `metadata` export with title, description, Open Graph tags
- **Verify:** Responsive on mobile (320px), tablet (768px), desktop (1024px+)
- **Dependencies:** Tasks LP-1, LP-2

### Task LP-4: Remove Root Redirect
- **File to modify:** `apps/web/src/app/page.tsx`
- **Action:** Ensure the landing page renders at `/` instead of redirecting
- **Verify:** `npx next build` passes, landing page loads at `/`
- **Dependencies:** None

---

## Agent 2: Backend/API Engineer — Authentication Overhaul

**Assigned Tasks:** AUTH-1, AUTH-2, AUTH-3, AUTH-4, AUTH-5, AUTH-6, AUTH-7, AUTH-8

### Task AUTH-1: Add Session Model to Prisma Schema
- **File to modify:** `apps/web/prisma/schema.prisma`
- **Action:** Add Session model after UserPreferences model:

```prisma
model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  token        String   @unique
  expiresAt    DateTime
  lastUsedAt   DateTime @default(now())
  createdAt    DateTime @default(now())
  ipAddress    String?
  userAgent    String?
}
```
- **Run:** `npx prisma migrate dev --name add_sessions`
- **Verify:** Migration applies successfully
- **Dependencies:** None

### Task AUTH-2: Create Server-Side Session Management
- **File to create:** `apps/web/src/lib/session/index.ts`
- **Actions:**
  - `createSession(userId, ipAddress?, userAgent?)` — Creates session token, stores in DB, returns token
  - `validateSession(token)` — Looks up session, checks expiry, updates lastUsedAt, returns user or null
  - `deleteSession(token)` — Deletes session (logout)
  - `deleteAllUserSessions(userId)` — Deletes all user sessions (password change, security)
- **Token generation:** `crypto.randomUUID()`
- **Expiry:** 7 days default, extendable with "remember me" (30 days)
- **Dependencies:** Task AUTH-1

### Task AUTH-3: httpOnly Cookie Setting in Login/Logout
- **File to modify:** `apps/web/src/actions/index.ts`
- **Actions:**
  - Modify `loginUser` action:
    - After password validation, call `createSession()`
    - Return session token (not stored in client)
  - Add `logoutUser` action:
    - Read session token from cookie
    - Call `deleteSession()`
    - Clear cookie via `cookies().delete()`
  - Modify `registerUser` action:
    - Optionally auto-login after registration (create session)
- **Note:** Use Next.js `cookies()` API from `next/headers` (server-side)
- **File to modify:** `apps/web/src/app/(auth)/auth/login/page.tsx`
  - Remove `document.cookie` lines
  - Login action should now return success (session managed server-side)
  - On success, just `router.push('/dashboard')`
- **Dependencies:** Task AUTH-2

### Task AUTH-4: Update proxy.ts for Session Validation
- **File to modify:** `apps/web/src/proxy.ts`
- **Action:** Replace cookie-based auth with session-based:
  1. Read `session_token` cookie
  2. Call `validateSession(token)` 
  3. If valid: set `x-user-id`, `x-user-role`, `x-organization-id` headers
  4. If invalid/expired: clear cookie, redirect to login
  5. Set `x-session-token` header for server actions to access
- **Dependencies:** Task AUTH-2

### Task AUTH-5: Complete Password Reset Flow
- **File to modify:** `apps/web/src/actions/index.ts`
  - Add `requestPasswordReset(formData)` action
    - Validate email exists (don't reveal if not found)
    - Generate `crypto.randomUUID()` reset token
    - Store in User model (`passwordResetToken`, `passwordResetExpires`)
    - Call `services/email/sendEmail()` with reset link
  - Add `resetPassword(formData)` action
    - Validate token and expiry
    - Hash new password with bcryptjs
    - Update user password
    - Clear token and expiry
    - Delete all user sessions
- **File to modify:** `apps/web/src/app/(auth)/auth/reset-password/page.tsx`
  - Add form handling for email submission step
  - Add success state ("Check your email")
- **File to create:** `apps/web/src/app/(auth)/auth/reset-password/[token]/page.tsx`
  - Form for new password
  - Calls `resetPassword` action
- **File to modify:** `apps/web/src/app/api/v1/auth/route.ts`
  - Handle `action=reset-password` with token validation
- **Dependencies:** Task AUTH-3 (session management)

### Task AUTH-6: Implement Email Verification
- **File to modify:** `apps/web/src/actions/index.ts`
  - Modify `registerUser` action:
    - Generate `emailVerificationToken` (crypto.randomUUID())
    - Store in User model
    - Send verification email
- **File to create:** `apps/web/src/app/(auth)/auth/verify-email/[token]/page.tsx`
  - Validates token
  - Sets `emailVerifiedAt` on User
  - Redirects to login with success message
- **File to modify:** `apps/web/src/app/api/v1/auth/route.ts`
  - Handle `action=verify-email`
- **Dependencies:** Task AUTH-3

### Task AUTH-7: Add Rate Limiting
- **File to create:** `apps/web/src/lib/security/rate-limiter.ts`
- **Action:**
  - In-memory `Map<string, { count: number; resetAt: number }>` implementation
  - `checkRateLimit(key, maxAttempts, windowMs)` function
  - Export for use in auth actions
  - Apply to: login (5 attempts / 15 min per email), register (3 attempts / hour per IP), password reset (3 attempts / hour per email)
- **Dependencies:** None

### Task AUTH-8: Fix AuthContext Hydration
- **File to modify:** `apps/web/src/providers/index.tsx`
- **Action:**
  - Add loading state
  - On mount, fetch `/api/v1/auth/me`
  - Set user from response
  - Show loading spinner while checking
- **File to create:** `apps/web/src/app/api/v1/auth/me/route.ts`
  - GET handler
  - Reads `session_token` cookie
  - Calls `validateSession()`
  - Returns user data or 401
- **Dependencies:** Tasks AUTH-2, AUTH-3, AUTH-4

---

## Agent 3: Database Specialist — Kenyan Context Seeding

**Assigned Tasks:** SEED-1, SEED-2, SEED-3, SEED-4, SEED-5

### Task SEED-1: Create Seed Data Modules
- **Directory to create:** `apps/web/prisma/seed-data/`
- **Files to create:**
  - `organizations.ts` → export const organizations = [...]
  - `users.ts` → export const users = [...]
  - `projects.ts` → export const projects = [...]
  - `tasks.ts` → export const tasks = [...]
  - `comments.ts` → export const comments = [...]
  - `helpers.ts` → randomDate, randomElement, generateSlug utilities
- **All data must be Kenyan context data** (names, companies, projects, locations)

### Task SEED-2: Organization & User Data

**Organizations:**
```ts
export const organizations = [
  { name: 'Safaricom PLC', slug: 'safaricom-plc', subscriptionTier: 'ENTERPRISE' },
  { name: 'Equity Bank Kenya', slug: 'equity-bank-kenya', subscriptionTier: 'PROFESSIONAL' },
  { name: 'KCB Group', slug: 'kcb-group', subscriptionTier: 'PROFESSIONAL' },
  { name: 'KenGen', slug: 'kengen', subscriptionTier: 'PROFESSIONAL' },
  { name: 'Ministry of ICT', slug: 'ministry-of-ict', subscriptionTier: 'ENTERPRISE' },
];
```

**Users per organization (5 each = 25 total):**
- Each org: 1 Admin, 1 Manager, 3 Team Members
- Use Kenyan names: e.g., James Kariuki, Mary Wanjiku, Peter Ochieng, Grace Akinyi, David Kamau, Sarah Chebet, Michael Mwangi, Faith Nyambura, Kevin Otieno, Esther Njoki
- Email format: `firstname.lastname@orgslug.com`
- Password: All set to `Password123` (for testing)

### Task SEED-3: Project & Task Data

**15 Kenyan-context projects** (see full list in `docs/15_Architecture_Improvement_Report.md` §3.2)

**50+ tasks** distributed across projects with:
- Realistic titles: "Deploy M-Pesa API v3 to production", "Train agents on Equitel onboarding", "Conduct stakeholder workshop for geothermal project"
- Assignees from the same organization
- Status distribution: ~30% TODO, 30% IN_PROGRESS, 20% IN_REVIEW, 20% DONE
- Priority mix: 20% URGENT, 30% HIGH, 35% MEDIUM, 15% LOW
- Due dates within 2026

### Task SEED-4: Comments & Activity Data
- 20+ comments on tasks using Kenyan English
- Activity log entries for task creation, status changes
- Time entries for IN_PROGRESS tasks
- User preferences for all users

### Task SEED-5: Execute Seeding
- **File to create/modify:** `apps/web/prisma/seed.ts`
- **Action:** Main seed script that:
  1. Clears all data in dependency order (TaskLabel → TaskAssignee → ... → Organization)
  2. Seeds organizations
  3. Creates users with `bcryptjs.hashSync('Password123', 12)`
  4. Seeds roles and permissions
  5. Seeds teams and user-team assignments
  6. Seeds projects and project members
  7. Seeds tasks with assignees and labels
  8. Seeds comments
  9. Seeds activity logs
  10. Seeds user preferences
- **Run:** `npx prisma db seed`
- **Note:** Update `package.json` to add `"prisma": { "seed": "tsx prisma/seed.ts" }`
- **Dependencies:** Tasks SEED-1, SEED-2, SEED-3, SEED-4

---

## Agent 4: Documentation Specialist — Documentation Update

**Assigned Tasks:** DOC-1, DOC-2, DOC-3

### Task DOC-1: Update System Architecture (09_System_Architecture.md)
- **File to modify:** `docs/09_System_Architecture.md`
- **Updates:**
  - Version bump: 1.1 → 2.0
  - Authentication Module section: Update to reflect new Session-based auth
  - Add landing page architecture to Presentation section
  - Add Session model to data flow diagrams
  - Update deployment considerations with new auth flow

### Task DOC-2: Update SRS (03_Software_Requirements_Specification.md)
- **File to modify:** `docs/03_Software_Requirements_Specification.md`
- **Updates:**
  - Add landing page requirements
  - Update authentication requirements (session-based, email verification, password reset)
  - Add rate limiting requirements
  - Version bump: 1.0 → 2.0

### Task DOC-3: Update Database Design (10_Database_Design.md)
- **File to modify:** `docs/10_Database_Design.md`
- **Updates:**
  - Add Session table documentation
  - Update ER diagrams if present
  - Add seed data documentation reference

---

## Execution Order

```
Phase 1: Landing Page
  LP-4 ─┐
  LP-1 ─┤
  LP-2 ─┤  (can run in parallel)
  LP-3 ─┘
  Verify: npx next build

Phase 2: Auth System
  AUTH-1 → AUTH-2 → AUTH-4 → AUTH-3 → AUTH-5 → AUTH-6 → AUTH-7 → AUTH-8
  Verify: npx next build, manual login flow test

Phase 3: Seeding
  SEED-1 → SEED-2 → SEED-3 → SEED-4 → SEED-5
  Verify: npx prisma db seed, query database

Phase 4: Documentation
  DOC-1, DOC-2, DOC-3 (can run in parallel)
```

---

*End of Implementation Plan*
