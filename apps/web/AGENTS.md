<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:engineering-standards -->

# Engineering Standards

- Server Components by default. Use Client Components (`"use client"`) only when necessary (state, effects, browser APIs).
- Name Client Components with `.client.tsx` suffix.

<!-- END:engineering-standards -->
