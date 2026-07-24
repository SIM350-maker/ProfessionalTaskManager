# Architecture Improvement Report

## Project
Professional Task Manager

**Version:** 2.0  
**Date:** July 21, 2026  
**Author:** Software Architecture Team  
**Status:** Approved for Implementation

---

## Executive Summary

This report outlines three major architectural improvements for the Professional Task Manager application based on a comprehensive analysis of the current codebase, Kenyan market context research, and software engineering best practices. The improvements address the landing page strategy, authentication system, and database seeding with Kenyan context data.

---

# 1. Landing Page Enhancement

## 1.1 Current State Analysis

| Aspect | Current State | Issue |
|---|---|---|
| Root route `/` | `redirect('/auth/login')` | No marketing presence |
| Marketing page | Exists at `(marketing)/page.tsx` but never served | Dead code |
| First impression | Login form | No value proposition shown |
| SEO | No discoverable landing content | Missed organic traffic |
| User journey | No onboarding flow | High friction for new users |

## 1.2 Research Findings

The Kenyan project management software market is experiencing rapid growth driven by:
- Digital transformation across industries (finance, telecom, energy, government)
- Rise of remote work and need for collaboration tools
- Government initiatives promoting digitalization (Vision 2030)
- Infrastructure development projects requiring structured project management
- Startup ecosystem expansion needing affordable PM solutions

A landing page must communicate these value propositions clearly to the Kenyan market.

## 1.3 Recommended Architecture

### Route Structure

```
/                        → Landing page (public)
/auth/login              → Login (public)
/auth/register           → Registration (public)
/dashboard               → App home (protected)
```

### Landing Page Sections

1. **Hero** — Value proposition with CTA
2. **Features** — Key capabilities showcase (Task Management, Team Collaboration, Reports, Time Tracking)
3. **Use Cases** — Kenyan market scenarios (Infrastructure Projects, Digital Transformation, Financial Services, Government Delivery)
4. **How It Works** — 3-step onboarding flow
5. **Pricing** — Tiered pricing (Free, Starter, Professional, Enterprise)
6. **Testimonials** — Kenyan organizations
7. **Footer** — Links, contact, social proof

### Technical Implementation

- Move marketing content from `(marketing)/page.tsx` to `app/page.tsx`
- Keep `(marketing)/` route group for future marketing subpages (about, pricing, blog)
- Update `proxy.ts` to include `/` as public path (already done)
- SEO metadata for all marketing pages
- Responsive design for mobile-first Kenyan market

---

# 2. Custom Authentication System

## 2.1 Current State Analysis

| Aspect | Current State | Risk Level |
|---|---|---|
| Password hashing | bcryptjs (12 rounds) | ✅ Good |
| Session storage | Cookie-based (`session_user_id`, `session_user_role`) | ❌ Critical |
| Cookie security | Set via `document.cookie` (no httpOnly, no Secure, no SameSite) | ❌ Critical |
| Session expiry | None | ❌ High |
| Email verification | Not implemented | ❌ Medium |
| Password reset | Page exists, API route does NOT handle it | ❌ High |
| Rate limiting | Not implemented | ❌ Medium |
| Auth context hydration | Not implemented (user always null on load) | ❌ Medium |
| Registration flow | Creates user, redirects to login | ⚠️ Adequate |
| Permission system | Hardcoded matrix with 3 roles | ⚠️ Adequate |

## 2.2 Recommended Authentication Architecture

### Session Management

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Browser    │     │   Next.js App   │     │  PostgreSQL  │
│              │     │                 │     │              │
│  httpOnly    │────▶│  proxy.ts reads │────▶│  Session     │
│  Cookie      │     │  cookie, sets   │     │  Table       │
│  (session_   │     │  x-session-token│     │  (id, userId,│
│   token)     │◀────│  header         │◀────│  expiresAt,  │
│              │     │                 │     │  lastUsedAt) │
└──────────────┘     └─────────────────┘     └──────────────┘
```

### Key Changes

#### A. Database: New Session Model

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

#### B. Server-Side Cookie Setting

Replace `document.cookie` in login page with server action that sets httpOnly cookies:

```ts
// In loginUser action:
const sessionToken = crypto.randomUUID();
await prisma.session.create({
  data: {
    userId: user.id,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ipAddress: /* from headers */,
    userAgent: /* from headers */,
  },
});

// Set httpOnly cookie via NextResponse
const response = NextResponse.json({ success: true, data: { ...user } });
response.cookies.set('session_token', sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
});
```

#### C. Session Validation Middleware

```ts
// In proxy.ts:
const sessionToken = request.cookies.get('session_token')?.value;
if (sessionToken) {
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: { select: { id: true, role: true, organizationId: true } } },
  });
  if (session && session.expiresAt > new Date()) {
    // Update lastUsedAt
    await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
    // Set headers
    requestHeaders.set('x-user-id', session.user.id);
    requestHeaders.set('x-user-role', session.user.role);
  } else if (session) {
    // Expired session cleanup
    await prisma.session.delete({ where: { id: session.id } });
    response.cookies.delete('session_token');
  }
}
```

#### D. Password Reset Flow

Complete the existing stub:
1. User enters email at `/auth/reset-password`
2. Server generates reset token, stores in User model (`passwordResetToken`, `passwordResetExpires`)
3. Server sends email with reset link (service: `services/email/index.ts` already has `buildPasswordResetEmail`)
4. User clicks link, arrives at `/auth/reset-password/[token]`
5. Server validates token, allows password change
6. Token consumed (set to null)

#### E. Email Verification Flow

1. On registration, generate `emailVerificationToken`, store in User model
2. Send verification email (service: `services/email/index.ts` already has `buildEmailVerificationEmail`)
3. User clicks `/auth/verify-email/[token]`
4. Server sets `emailVerifiedAt` on User, clears token
5. Unverified users can log in but get reminder banner

#### F. Rate Limiting

```ts
// In-memory rate limiter (or Redis for production):
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}
// Usage: checkRateLimit(`login:${email}`, 5, 15 * 60 * 1000) // 5 attempts per 15 min
```

#### G. Auth Context Hydration

```tsx
// In Providers component:
export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setUser(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
```

New API route: `GET /api/v1/auth/me` - returns current user from session token cookie.

---

# 3. Kenyan Context Database Seeding

## 3.1 Research Summary

| Dimension | Finding |
|---|---|
| Market growth | 48-63% increase in PM demand by 2035 |
| Key sectors | Financial Services, Telecom, Energy, Government, Infrastructure, Healthcare |
| Key challenges | Execution capability, skills gap, stakeholder management, risk management |
| Government initiatives | Vision 2030, Digital Transformation, Infrastructure Development |
| PM maturity | Growing but fragmented; adoption of standardized practices still low |
| Local context | Nairobi-centered, mobile-first, need for offline-capable solutions |

## 3.2 Seed Data Architecture

### Organizations (5 Kenyan entities)

| Organization | Sector | Size | Subscription |
|---|---|---|---|
| Safaricom PLC | Telecommunications | Enterprise | ENTERPRISE |
| Equity Bank Kenya | Financial Services | Enterprise | PROFESSIONAL |
| KCB Group | Financial Services | Enterprise | PROFESSIONAL |
| Kenya Electricity Generating Company (KenGen) | Energy | Enterprise | PROFESSIONAL |
| Ministry of ICT & Digital Economy | Government | Enterprise | ENTERPRISE |

### Users (25 Kenyan users across organizations)

- Realistic Kenyan names (first name, last name)
- Mix of roles: Project Manager, Team Lead, Developer, Analyst, Executive
- Hierarchical distribution: 1 Admin, 4 Managers, 20 Team Members per org

### Projects (15 projects)

| Organization | Project | Type |
|---|---|---|
| Safaricom | M-Pesa Digital Upgrade | Digital Transformation |
| Safaricom | 5G Network Expansion - Nairobi | Infrastructure |
| Safaricom | Customer Experience Platform | IT |
| Equity Bank | Equitel Mobile Banking v3 | Fintech |
| Equity Bank | Agency Banking Expansion | Financial Inclusion |
| KCB Group | Core Banking System Migration | IT Infrastructure |
| KCB Group | KCB M-Pesa Integration | Partnership |
| KenGen | Olkaria Geothermal Plant Upgrade | Energy |
| KenGen | Wind Power Feasibility Study - Turkana | Renewable Energy |
| KenGen | Grid Modernization Program | Infrastructure |
| Ministry of ICT | Huduma Centre Digital Transformation | Government |
| Ministry of ICT | National Fiber Optic Backbone Phase IV | Infrastructure |
| Ministry of ICT | Kenya Digital ID System | Government |
| Ministry of ICT | Ajira Digital Program 2.0 | Employment |
| Ministry of ICT | County Connectivity Project | Infrastructure |

### Tasks (50+ tasks across all projects)

Realistic tasks with:
- Kenyan team member assignments
- Status distribution (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Priority mix
- Due dates within 2026
- Comments in Kenyan English
- Time entries with realistic hours

## 3.3 Seed Script Architecture

```
prisma/
├── schema.prisma
├── seed.ts              ← Entry point
└── seed-data/
    ├── organizations.ts  ← Organization definitions
    ├── users.ts          ← User definitions with Kenyan names
    ├── projects.ts       ← Project definitions
    ├── tasks.ts          ← Task definitions with assignments
    ├── comments.ts       ← Comment data
    └── helpers.ts        ← Shared utilities (random dates, etc.)
```

The seed script will:
1. Clear existing data in dependency order
2. Create organizations
3. Create users with hashed passwords
4. Create roles and permissions
5. Create teams and assign members
6. Create projects and assign members (with roles)
7. Create tasks with assignees, labels, priorities
8. Create comments on tasks
9. Create activity log entries
10. Create user preferences

---

# 4. Implementation Roadmap

## Phase 1: Landing Page (2-3 days)
| Task | Description |
|---|---|
| LP-1 | Redesign landing page with full marketing content |
| LP-2 | Implement feature showcase sections |
| LP-3 | Add SEO metadata and responsive design |
| LP-4 | Remove redirect in `app/page.tsx` |

## Phase 2: Auth System Overhaul (4-5 days)
| Task | Description |
|---|---|
| AUTH-1 | Add Session model to Prisma schema |
| AUTH-2 | Create server-side session management |
| AUTH-3 | Implement httpOnly cookie setting in login/logout |
| AUTH-4 | Update proxy.ts for session validation |
| AUTH-5 | Complete password reset flow |
| AUTH-6 | Implement email verification |
| AUTH-7 | Add rate limiting |
| AUTH-8 | Fix AuthContext hydration |

## Phase 3: Kenyan Context Seeding (2-3 days)
| Task | Description |
|---|---|
| SEED-1 | Create seed data modules |
| SEED-2 | Write organization/user data |
| SEED-3 | Write project/task data |
| SEED-4 | Write comments and activity data |
| SEED-5 | Execute and verify seeding |

## Phase 4: Documentation Update (1 day)
| Task | Description |
|---|---|
| DOC-1 | Update System Architecture document |
| DOC-2 | Update SRS document |
| DOC-3 | Update Database Design document |

---

# 5. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Session token theft | Low | Critical | httpOnly + Secure cookies, short expiry, rotation |
| Migration conflicts | Low | Medium | Run migration in dev first, test seed script |
| Rate limiting false positives | Low | Low | Use email+IP combo keys, reasonable windows |
| Kenyan data relevance | Low | Low | Research-based, easily modifiable seed data |
| Build failures | Medium | Medium | Run `next build` after each phase |

---

*End of Report*
