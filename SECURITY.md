# Security Policy

## Supported Versions

| Version | Supported          |
|---------|-------------------|
| 1.x     | ✅ Active         |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please **do not** open a public issue.

Instead, send a private report to: **security@professionaltaskmanager.com**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

We will acknowledge receipt within 48 hours and provide a timeline for a fix.

## Security Measures

- **Authentication**: Session-based with HTTP-only cookies, bcrypt password hashing (12 rounds)
- **Authorization**: Role-based access control (RBAC) with granular permission matrix
- **Input Validation**: Zod schemas on all API endpoints and server actions
- **Output Sanitization**: HTML escaping for all user-generated content
- **HTTP Security Headers**: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- **Rate Limiting**: Auth endpoint protection (Redis-backed, in-memory fallback)
- **CSRF Protection**: Double-submit cookie pattern
- **Database**: Parameterized queries via Prisma ORM (no SQL injection)
- **Session Management**: 7-day expiry, crypto-random tokens, cleanup on expiry
- **File Uploads**: Type validation, size limits (10MB), S3-compatible private storage

## Data Protection

- All passwords are hashed (never stored in plaintext)
- Email addresses are masked in API responses
- Sessions are invalidated on logout
- Soft deletes preserve data integrity with `deletedAt` timestamps
