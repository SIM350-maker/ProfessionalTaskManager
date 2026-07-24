# UI/UX Transformation Specification — Premium Redesign

> **Objective:** Transform the Professional Task Manager from a functional but basic interface into a premium, insight-driven, modern dashboard experience matching the quality standard of leading project management tools (Linear, Notion, Asana) and the Behance reference design.

---

## Table of Contents

1. [Design System Overhaul](#1-design-system-overhaul)
2. [Core Component Redesign](#2-core-component-redesign)
3. [Layout & Navigation Redesign](#3-layout--navigation-redesign)
4. [Dashboard Page Redesign](#4-dashboard-page-redesign)
5. [Tasks Pages Redesign](#5-tasks-pages-redesign)
6. [Projects Pages Redesign](#6-projects-pages-redesign)
7. [Teams Pages Redesign](#7-teams-pages-redesign)
8. [Reports Page Redesign](#8-reports-page-redesign)
9. [Notifications Page Redesign](#9-notifications-page-redesign)
10. [Profile & Settings Redesign](#10-profile--settings-redesign)
11. [Admin Pages Redesign](#11-admin-pages-redesign)
12. [Authentication Pages Redesign](#12-authentication-pages-redesign)
13. [Landing Page Redesign](#13-landing-page-redesign)
14. [Animation & Micro-interactions](#14-animation--micro-interactions)
15. [Mobile Experience](#15-mobile-experience)
16. [Accessibility Compliance](#16-accessibility-compliance)
17. [Implementation Priority & Ordering](#17-implementation-priority--ordering)

---

## 1. Design System Overhaul

### Current State
Minimal CSS variables for colors only. No design tokens for spacing, radii, shadows, or typography. Relies entirely on Tailwind defaults.

### Target State — Token-Based Design System in `globals.css`

```css
/* ===== DESIGN TOKENS ===== */
@theme {
  /* Spacing scale */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 2rem;       /* 32px */
  --spacing-2xl: 3rem;      /* 48px */
  --spacing-3xl: 4rem;      /* 64px */

  /* Border radius */
  --radius-sm: 0.375rem;    /* 6px */
  --radius-md: 0.5rem;      /* 8px */
  --radius-lg: 0.75rem;     /* 12px */
  --radius-xl: 1rem;        /* 16px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-dropdown: 0 4px 16px rgba(0,0,0,0.12);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.15);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-sidebar: 2px 0 12px rgba(0,0,0,0.06);

  /* Typography scale */
  --text-xs: 0.75rem;       /* 12px */
  --text-sm: 0.875rem;      /* 14px */
  --text-base: 1rem;        /* 16px */
  --text-lg: 1.125rem;      /* 18px */
  --text-xl: 1.25rem;       /* 20px */
  --text-2xl: 1.5rem;       /* 24px */
  --text-3xl: 1.875rem;     /* 30px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Transition durations */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
}

/* ===== COLOR PALETTE (already exists, augment with semantic tokens) ===== */
:root {
  /* Existing colors kept + additions */
  --color-bg-subtle: #f8fafc;        /* Very subtle gray for section backgrounds */
  --color-bg-card: #ffffff;
  --color-bg-sidebar: #fafbfc;
  --color-bg-hover: #f1f5f9;
  --color-bg-active: #e8f0fe;

  --color-border-default: #e2e8f0;
  --color-border-hover: #cbd5e1;

  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-text-inverse: #ffffff;

  --color-accent-blue: #2563eb;
  --color-accent-blue-hover: #1d4ed8;
  --color-accent-blue-light: #eff6ff;
  --color-accent-green: #16a34a;
  --color-accent-green-light: #f0fdf4;
  --color-accent-amber: #d97706;
  --color-accent-amber-light: #fffbeb;
  --color-accent-red: #dc2626;
  --color-accent-red-light: #fef2f2;
  --color-accent-purple: #9333ea;
  --color-accent-purple-light: #faf5ff;
}

.dark {
  --color-bg-subtle: #0f1117;
  --color-bg-card: #1a1d27;
  --color-bg-sidebar: #13151d;
  --color-bg-hover: #23263b;
  --color-bg-active: #1e293b;

  --color-border-default: #2d3148;
  --color-border-hover: #3d4260;

  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-tertiary: #64748b;

  --color-accent-blue-light: #1e293b;
  --color-accent-green-light: #052e16;
  --color-accent-amber-light: #451a03;
  --color-accent-red-light: #450a0a;
  --color-accent-purple-light: #2e1065;
}
```

### Implementation Steps

1. Replace the current `globals.css` with the token-based system above
2. Remove hardcoded Tailwind utility classes in favor of semantic token references
3. Create a `tailwind-variants` or `cva` utility for component variants
4. Add a `tokens.css` file that documents all tokens for developer reference
5. Ensure dark mode overrides every semantic color properly

---

## 2. Core Component Redesign

### 2.1 Button
**Current:** 6/10 — Functional but flat. Missing loading text, icon support, keyboard shortcuts.

**Target:**
```tsx
// Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean | string;  // string = custom loading text
  icon?: ReactNode;            // Icon at start
  iconRight?: ReactNode;       // Icon at end
  shortcut?: string;           // e.g., "⌘K"
  fullWidth?: boolean;
}
```

**Visual spec:**
- sm: `h-8 px-3 text-xs gap-1.5`
- md: `h-10 px-4 text-sm gap-2`
- lg: `h-12 px-6 text-base gap-2.5`
- Primary: blue-600 bg, white text, blue-700 hover, blue-800 active, ring blue-300
- Secondary: gray-100 bg, gray-900 text, gray-200 hover, ring
- Destructive: red-600 bg (same pattern)
- Outline: border only, transparent bg, hover fills
- Ghost: no border/bg, hover fills subtle
- Link: blue-600 text, underline on hover

**Micro-interactions:** Scale 0.98 on mousedown, smooth color transitions, loading spinner + text fades in.

**Testing:** All variants rendered correctly, loading prevents click, icon renders, shortcut badge visible.

### 2.2 Input
**Current:** 8/10 — Good but missing prefix/suffix icons, clear button, character count.

**Target additions:**
- `prefix` / `suffix` — icon or text nodes positioned at start/end
- `clearable` — shows X button when value is non-empty
- `maxLength` — shows character counter at bottom-right
- `onClear` callback

**Visual spec:**
- Default: `h-10 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg`
- Focus: `ring-2 ring-blue-500/20 border-blue-500`
- Error: `border-red-500 ring-2 ring-red-500/20`
- Disabled: `bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed`
- Prefix/suffix icon: `text-gray-400` 16px, positioned absolute

### 2.3 Select
**Current:** 7/10 — Native `<select>` is limiting.

**Target:** Custom dropdown component with:
- Search/filter within options (for 10+ items)
- Multi-select support (checkbox list like current `MultiSelect` but standardized)
- Grouped options with labels
- Clearable
- Selected count display for multi-select

### 2.4 Card
**Current:** 7/10 — Solid but no padding customization.

**Target additions:**
- `padding` prop: `none` | `sm` | `md` | `lg`
- `hover` prop with lift + shadow animation (already exists)
- `variant`: `default` (border + shadow) | `elevated` (more shadow) | `flat` (no border, subtle bg)
- Optional header divider control

### 2.5 Modal
**Current:** 8/10 — Solid but missing animation and focus trap.

**Target additions:**
- Framer Motion enter/exit animation: scale + opacity
- Focus trap: tab cycling within modal
- `preventClose` prop (for dirty forms)
- `size` prop: `sm` | `md` | `lg` | `xl` | `full`
- Scroll lock on body (already done, verify)
- `description` prop for `aria-describedby`

### 2.6 Badge
**Current:** 8/10 — Good. Additions:
- Dot variant (small colored circle, no text)
- Removable badge (X button)
- Counter badge (for notification counts)
- Outline variant for each color

### 2.7 Avatar
**Current:** 8/10 — Good. Additions:
- Online/offline status indicator (green dot bottom-right)
- Click-to-expand group (opens tooltip with all names)
- Skeleton variant during loading
- `getInitials` fallback for missing image

### 2.8 Skeleton
**Current:** 7/10 — Need more variants.

**Target additions:**
- `button` variant
- `chart` variant (bar/pie shapes)
- `table-row` variant with configurable columns
- `card-list` variant (multiple cards)
- Customizable width (use `w-full`, `w-3/4` etc. patterns)

### 2.9 Search (SearchBar)
**Current:** 7/10 — Missing clear button and results count.

**Target additions:**
- Clear button (X) when value set
- Loading spinner (small) during debounce
- Results count display: "12 results"
- Keyboard shortcut hint: `⌘F` or `/` to focus
- `placeholder` customization

### 2.10 Pagination
**Current:** 6/10 — Basic.

**Target**: Page-number pagination with:
- Previous/Next buttons
- Numbered page buttons with ellipsis for large sets (1...4 5 6...20)
- Current page highlighted
- "Go to page" input
- Page size selector (20 / 50 / 100)
- Total count display: "Showing 1–20 of 156"

### 2.11 EmptyState
**Current:** 8/10 — Well designed. Additions:
- Built-in illustration variants (task empty, project empty, search empty, notification empty)
- Action button can be secondary (not just primary)
- Centered by default, optional `compact` mode for inline use

### 2.12 Toast
**Current:** 8/10 — Good sonner wrapper. Additions:
- Custom duration per call
- `loading` toast variant (persistent until resolved)
- Stack limit configuration
- Dismiss all button

---

## 3. Layout & Navigation Redesign

### 3.1 Sidebar — Complete Visual Overhaul

**Current:** 8/10 — Functional. But visually basic and lacks premium feel.

**Target:** Linear-style sidebar with:
- Cleaner spacing: `py-6 px-4` with section grouping
- **Workspace switcher** at top: org name dropdown with avatar + chevron
- **Navigation sections** with subtle dividers:
  ```
  [Workspace Name ▼]
  ---
  Dashboard
  Tasks
  Projects
  Teams
  ---
  Reports
  Notifications
  ---
  Profile
  Settings
  ---
  [Admin section, admin-only]
  User Management
  Organization
  ```
- **Active state**: subtle gray bg + left border accent (blue, 3px)
- **Hover state**: soft bg fill, scale icon slightly
- **Icons**: 20px, consistent stroke width (1.5), current color
- **Notification badge**: red dot with count on Notifications link, inline
- **User section at bottom**: compact avatar + name + role, click for dropdown (Profile, Settings, Sign out)
- **Collapse**: smoothly shrinks to icon-only `w-16`, tooltip on hover
- **Dark mode**: dark-gray bg (`#13151d`), borders `#2d3148`

### 3.2 Header — Refined Command Bar Style

**Current:** 7/10 — Hardcoded badge, no search.

**Target:** Clean header with:
- **Breadcrumb** or page title on left
- **Global command bar** center: `⌘K` style search with rounded pill input
- **Notification bell**: animated bell icon, real badge count from API, dropdown preview (last 5 notifications)
- **Theme toggle**: sun/moon icon with rotation animation
- **User avatar**: dropdown with Profile, Settings, Sign out
- **Responsive**: collapse to minimal on mobile

### 3.3 Layout — Full-Width Optional

**Current:** `max-w-7xl` with `px-8` — feels narrow on big screens.

**Target:** Optional full-width layout toggle:
- Default: `max-w-7xl mx-auto` with `px-6 lg:px-8`
- User can toggle to full-width via a layout button in header
- Preference persisted

---

## 4. Dashboard Page Redesign

### Current Score: 8/10
Good foundation. Target: 10/10 — premium insight-driven dashboard.

### Target Layout

```
┌──────────────────────────────────────────────────────┐
│  Good morning, Jane  |  [Today's date]               │
│  Here's your project overview                         │
├──────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Total │ │Active│ │Over- │ │Due   │ │Compl-│       │
│ │Tasks │ │Tasks │ │due   │ │This  │ │eted  │       │
│ │ 24   │ │ 12   │ │ 3 ⬆ │ │Week  │ │This  │       │
│ │      │ │      │ │      │ │ 8    │ │Week  │       │
│ │      │ │      │ │      │ │      │ │ 5    │       │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │
├──────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌──────────────────────┐ │
│ │  Productivity Trend     │ │  Status Distribution │ │
│ │  [Line Chart]           │ │  [Donut Chart]       │ │
│ │  Weekly completions     │ │  Todo  In Prog       │ │
│ │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁       │ │  Done  Review        │ │
│ └─────────────────────────┘ └──────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌──────────────────────────────┐ │
│ │ Overdue Tasks   │ │ Recent Activity              │ │
│ │ ┌─────────────┐ │ │ ┌──────────────────────────┐ │ │
│ │ │ Task A - 3d │ │ │ │ Jane completed Task X   │ │ │
│ │ │ Task B - 1d │ │ │ │ Bob commented on Task Y │ │ │
│ │ │             │ │ │ │ Task Z was created       │ │ │
│ │ └─────────────┘ │ │ └──────────────────────────┘ │ │
│ └─────────────────┘ └──────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │  My Tasks — This Week                            │ │
│ │  ┌────┬──────────┬────────┬─────────┬──────────┐│ │
│ │  │    │ Task     │ Project│ Priority│ Due      ││ │
│ │  │    │ Design   │ WebApp │ 🔴 High │ 22 Jul   ││ │
│ │  │    │ API      │ Backend│ 🟡 Med  │ 24 Jul   ││ │
│ │  │    │ Testing  │ Mobile │ 🟢 Low  │ 25 Jul   ││ │
│ │  └────┴──────────┴────────┴─────────┴──────────┘│ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Key Changes

1. **Welcome section**: Dynamic greeting + date, motivational subtext
2. **Stat cards**: 5 cards instead of 4 (add "This Week" and "Completed This Week"), trend arrows (⬆⬇) with percentage change from last week. Each card has a subtle icon in the corner.
3. **Charts side by side**: Productivity Trend (line chart with gradient fill) + Status Distribution (donut with center total). Use the token color palette.
4. **Overdue tasks**: Compact list with severity indicators (red border for urgent, amber for 1-2 days overdue). Each item has a quick "Mark done" button.
5. **Recent activity**: Timelines-style list with colored dots per action type (blue=created, green=completed, amber=commented)
6. **My Tasks table**: Compact table view of assigned tasks for the current week with quick-status-change inline dropdown

### Charts Refresh
- Replace hardcoded Recharts colors with semantic design tokens
- Add chart loading skeleton (animated bar/chart shapes)
- Add empty state for charts: "No data available yet"
- Add chart animation on mount (Recharts supports this natively)
- Chart tooltips: premium styled, dark mode compatible, with shadow and rounded corners

---

## 5. Tasks Pages Redesign

### 5.1 Tasks List/Board View

**Current:** 8/10 — Good but improvements needed.

**Target:**
- **Cleaner list rows**: compact, more whitespace, subtle row dividers
- **Quick actions**: hover on task row shows inline action buttons (Edit, Assign, Delete)
- **Status inline change**: click status badge to get dropdown
- **Priority color strip**: left border 3px color-coded by priority (like current KanbanCard but for list view)
- **Checkbox selection**: leftmost column for multi-select + bulk action bar:
  ```
  [☐ Select all]  [Bulk Status ▼]  [Bulk Assign ▼]  [Delete]  [3 selected]
  ```
- **Column headers**: draggable to reorder (persisted preference)
- **Virtual scrolling**: for 100+ tasks, use react-window or similar
- **Drag-to-order**: in list view, drag tasks to reorder within same status

### 5.2 Kanban Board Refresh

**Current:** 8/10 — Good. Target: 9/10.

**Target additions:**
- **Column WIP limits**: configurable number near column header (e.g., "5/8")
- **Column quick-add**: inline "Add task" at bottom of column
- **Card density**: compact mode toggle
- **Expandable cards**: click to expand inline without full page navigation
- **Scrollable board**: sticky column headers
- **Column color**: each column has distinct top border color scheme

### 5.3 Task Detail Page

**Current:** 7/10 — Missing comments display, attachments, time tracking.

**Target layout:**
```
┌─────────────────────────────────────────────────────┐
│  ← Back to Tasks  |  Project Name / Task Title     │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌─────────────────┐ │
│ │  Edit Description           │ │ Status: In Prog │ │
│ │  [Rich text area or        │ │ Priority: High  │ │
│ │   markdown preview]         │ │ Assignees: [..] │ │
│ │                             │ │ Due: 22 Jul     │ │
│ │  Properties                 │ │ Est: 8h         │ │
│ │  ┌──────┬────────────────┐  │ │ Labels: #bug    │ │
│ │  │ Start│ 15 Jul         │  │ │ #frontend       │ │
│ │  │ Due  │ 22 Jul         │  │ │                 │ │
│ │  │ Proj │ Web App        │  │ │ Time Tracking   │ │
│ │  │ Est  │ 8h · 4h logged│  │ │ ┌───┬─────────┐ │ │
│ │  └──────┴────────────────┘  │ │ │ ▶ │ 0:00   │ │ │
│ │                             │ │ │ + │ Log    │ │ │
│ │  Description                │ │ └───┴─────────┘ │ │
│ │  Lorem ipsum dolor sit...   │ │                 │ │
│ │                             │ │ Subtasks        │ │
│ │  [Comment Form]             │ │ ☐ Setup DB   ✅ │ │
│ │  ┌────────────────────┐     │ │ ☐ API route  ✅ │ │
│ │  │ Write a comment...   │     │ ☐ Frontend   ⏳ │ │
│ │  │ [@mention] [Attach]  │     │                 │ │
│ │  └────────────────────┘     │ │ Dependencies    │ │
│ │                             │ │ ⛔ Blocked by   │ │
│ │  Comments                   │ │   Task #42      │ │
│ │  ┌────────────────────────┐ │ │                 │ │
│ │  │ Jane — 2h ago          │ │ │ Attachments     │ │
│ │  │ Looks good! Let's...   │ │ │ 📎 design.pdf  │ │
│ │  │ [Like] [Reply] [Edit]  │ │ │ 📎 screenshot  │ │
│ │  └────────────────────────┘ │ └─────────────────┘ │
│ └─────────────────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

### Key Changes for Task Detail

1. **Sidebar**: compact property panel with inline editing (click to edit fields directly)
2. **Description**: rich text area or markdown preview with edit/save toggle
3. **Comments**: fully render the already-fetched comments with threaded replies, likes, edit/delete own
4. **Attachments**: show uploaded files with download links
5. **Time tracking**: start/stop timer + manual log entry form
6. **Subtasks**: inline checklist with progress indicator
7. **Dependencies**: show blocked by / blocking tasks with links
8. **Activity log**: full history of changes (not just creation)

### 5.4 Task Creation Form

**Current:** 7/10 — Two conflicting implementations.

**Target:** Single unified `TaskForm.tsx` (feature component) used everywhere:
- Cleaner layout with inline field labels
- Project search (type to filter) instead of long dropdown
- Assignee search (type to find users)
- Label multi-select with color dots
- Subtask creation directly in form
- Attachment upload in form
- Template from existing task option

---

## 6. Projects Pages Redesign

### 6.1 Projects List

**Current:** 8/10 — Good. Additions:
- **Project health indicator**: colored dot (green=on track, amber=at risk, red=behind). Already implemented in `getProjectHealth` — use it on the card!
- **Compact card**: more info-dense with task progress bar
- **Grid/List toggle**: user preference on view
- **Quick favorite**: star icon to favorite projects (filterable)

### 6.2 Project Detail

**Current:** 7/10 — Tab-based, mostly read-only.

**Target:**
- **Overview tab**: summary stat cards (total tasks, completed %, overdue, members), description, health indicator, timeline progress bar
- **Tasks tab**: embed the full tasks list filtered by this project (reuse task components)
- **Timeline tab**: Gantt chart (already solid, 8/10), add zoom controls (days/weeks/months)
- **Members tab**: member list with roles, add/remove (already partially there)
- **Settings tab**: edit project name, description, visibility, status, dates. Move from separate edit page into tab.
- **Project header**: cover image with project name overlay (like Linear)

---

## 7. Teams Pages Redesign

### Current: 6/10 — Very minimal.

### Target

**Teams list** — same card pattern as projects:
- Team name, description, member avatars, member count
- Quick status: "5 members · Created 2 months ago"
- Empty state: "No teams yet"

**Team detail** — full-featured:
- **Header**: team name, description, edit button
- **Members tab**: member list with avatars, names, roles, "Remove" action
- **Projects tab**: projects this team is associated with
- **Tasks tab**: tasks assigned to any team member, grouped by status

---

## 8. Reports Page Redesign

### Current: 7/10 — Good charts but no interactivity.

### Target
- **Date range picker**: preset buttons (7d, 30d, 90d, This Quarter, Custom) + calendar range
- **Filter bar**: filter by project, team, assignee
- **Download button**: CSV export with current filter applied
- **Chart interactions**: click on bar/pie slice to drill down
- **Comparison**: "vs last period" percentage changes on stat cards
- **Export as PNG**: button to download chart as image
- **Key metrics row**: 4 stat cards at top (Total Tasks, Completed, Overdue, Avg Completion Time)
- **Below charts**: detailed tables for overdue tasks, top contributors, task distribution

---

## 9. Notifications Page Redesign

### Current: 8/10 — Well done. Minor improvements:
- **Click-to-navigate**: clicking a notification navigates to the related entity
- **Real-time updates**: add polling (every 30s) or SSE for new notifications
- **Group by date**: "Today", "Yesterday", "This Week", "Earlier" — already partially implemented in `useNotifications`, use the grouping in the UI
- **Toast preview**: when new notification arrives while on another page, show a brief toast
- **Notification types**: distinct icons per type (bell for assignment, check for completion, clock for due date, message for comment)

---

## 10. Profile & Settings Redesign

### Current: 6/10 — Read-only prefs on profile, editable on settings — confusing.

### Target: Merge into cohesive Preferences page

**Profile section:**
- Avatar upload with drag-and-drop + crop
- Name, email (read-only with verification badge)
- Department, job title, timezone
- Last login info

**Settings section:**
- Password change (current behavior, cleanup UI)
- Notification preferences: richer grid with per-event-type toggles (Email / In-app / Off) for each notification type:
  ```
  │ Event               │ Email │ In-App │
  │ Task assigned       │  ☑    │   ☑    │
  │ Task completed      │  ☐    │   ☑    │
  │ Due date reminder   │  ☑    │   ☑    │
  │ Comment added       │  ☑    │   ☑    │
  │ Team invitation     │  ☑    │   ☐    │
  ```
- Theme: light / dark / system (segmented control)
- Language dropdown (prep for i18n)
- Session management: "Active sessions" list with revoke button
- Danger zone: account deletion (with confirmation)

---

## 11. Admin Pages Redesign

### 11.1 User Management
**Current:** 8/10 — Solid. Additions:
- **Inline role editing**: dropdown to change user role directly in table
- **Create user modal**: modal form instead of separate page
- **Bulk actions**: select multiple users → deactivate / change role
- **Pagination**: for large organizations
- **Sort**: click column headers to sort
- **User detail panel**: click a row to expand a side panel with full user info, activity log, assigned tasks

### 11.2 Organization Settings
**Current:** 4/10 — Barely anything.

**Target:** Full organization settings:
- **General**: name, slug, timezone editing
- **Branding**: logo upload, primary color picker (if multi-tenant)
- **Billing**: subscription tier display, payment method, invoice history
- **Security**: session timeout, password policy, SSO toggle
- **API**: API key management (generate, revoke)
- **Delete organization**: danger zone with confirmation

---

## 12. Authentication Pages Redesign

### Current: 6/10 — Two conflicting implementations, basic design.

### Target: Premium auth experience

**Login page:**
- Split layout: left side with brand/illustration, right side with form
- Left panel: gradient bg (blue → indigo), app logo, tagline, testimonial quote
- Right panel: clean centered card with:
  ```
  [Logo]
  Welcome back
  Sign in to your account
  
  [Email]
  [Password]  [Show/Hide toggle]
  [Forgot password?]
  
  [Sign in button]
  
  ─── or continue with ───
  [Google] [GitHub] (future SSO)
  
  Don't have an account? [Sign up]
  ```
- Loading: button spinner + disable
- Error: inline error on specific field (not just generic banner)
- No test credentials (already removed)

**Register page:**
- Same split layout
- Fields: First Name, Last Name, Email, Password (with strength meter), Confirm Password, Organization Name
- Password strength: visual bar (weak/medium/strong) with requirements checklist
- Success: "Account created! Check your email."

**Password reset:** Same design language, clear step indicator:
```
Step 1: Enter email  →  Step 2: Check email  →  Step 3: Set new password
```

**Email verification:** Clean success/error page with animated checkmark/cross icon

---

## 13. Landing Page Redesign

### Current: 7/10 — Good content, needs visual polish.

### Target: Premium SaaS landing page

- **Hero**: larger headline with gradient text effect, animated illustration or mockup of the dashboard, floating elements (small cards/stats animating in background)
- **Features grid**: replace text-only icons with small screenshots or illustrations of each feature in action
- **How it works**: add small animated demos for each step
- **Pricing**: toggle for monthly/annual (with "Save 20%" badge), feature comparison table below cards
- **Testimonials**: add a carousel of user quotes with avatars
- **CTA section**: "Ready to streamline your workflow?" with email capture + "Get Started Free" button
- **Footer**: refined with social links, legal, and sitemap

---

## 14. Animation & Micro-interactions

### Current: 7/10 — Good Framer Motion usage. Target: 9/10.

### Page Transitions
- **Enter**: fade + slide up (current — keep)
- **Exit**: fade + slide down (CURRENTLY MISSING — add)
- **Route change**: layout animation (AnimatePresence with mode="wait")

### Component Animations
- **Button**: scale 0.98 on mousedown, smooth color transition, loading spinner
- **Card**: hover lift (-2px) + shadow increase (current — keep)
- **Modal**: scale from 0.95 + fade in overlay (CURRENTLY MISSING — add)
- **Dropdown**: opacity + translateY from -4px to 0
- **Toast**: slide from right (sonner default — keep)
- **Sidebar**: smooth width transition on collapse (current — keep)
- **Kanban card drag**: smooth follow, drop animation (current — keep)
- **Checkbox**: smooth checkmark draw animation
- **Notification badge**: pulse animation when count changes
- **Stat card number**: count-up animation on mount

### Loading States
- **Page load**: skeleton that matches page layout shape
- **Data refresh**: subtle shimmer on content area without full page skeleton
- **Action feedback**: optimistic updates with rollback on error
- **File upload**: progress bar with percentage + filename

### Reduced Motion
- Respect `prefers-reduced-motion` OS setting
- When enabled, skip all Framer Motion animations, use instant transitions

---

## 15. Mobile Experience

### Current: 7/10 — Functional but needs polish.

### Target

**Navigation:**
- Bottom tab bar on mobile (Dashboard, Tasks, Projects, More) instead of hamburger overlay
- Swipe gestures for back navigation
- Pull-to-refresh on list pages (dashboard, tasks, projects)

**Layout:**
- Single column, full-width on mobile
- All grids collapse to 1 column
- Tables convert to card list (each row becomes a card)
- Kanban scrolls horizontally with snap points

**Interactions:**
- Touch targets minimum 44×44px
- Long-press on list item for context menu
- Swipe to delete/complete on task items
- Bottom sheet instead of modal on mobile
- Native-like scroll behavior (overscroll, momentum)

**Sidebar:**
- Bottom sheet drawer or slide-in panel from right
- User section at bottom of drawer

**Testing breakpoints:**
- Mobile: 375px — iPhone SE size
- Mobile Large: 414px — iPhone Plus/Max
- Tablet: 768px — iPad
- Desktop: 1280px+
- Wide: 1920px+

---

## 16. Accessibility Compliance

### Current: 5/10 — Significant gaps.

### Target: WCAG 2.1 AA (minimum)

1. **Focus management:**
   - Visible focus ring on all interactive elements (2px solid blue, 2px offset)
   - Focus trap in modals, command palette, dropdowns
   - Skip-to-content link at top of page
   - `aria-current="page"` on active nav items

2. **Keyboard navigation:**
   - All interactions reachable via Tab/Shift+Tab
   - Kanban board: arrow keys to navigate, Space/Enter to pick up/drop cards
   - Command palette: arrow keys to navigate results
   - Dropdowns: arrow keys, Escape to close

3. **Screen reader:**
   - `aria-label` on all icon-only buttons
   - `role="img"` + `aria-label` on chart containers
   - Live regions (`aria-live="polite"`) for toast notifications
   - `aria-expanded` on dropdown/collapsible toggles
   - Descriptive alt text on all images
   - Proper heading hierarchy (h1 → h2 → h3, no skipping)

4. **Color & contrast:**
   - All text meets 4.5:1 contrast ratio (normal text) / 3:1 (large text)
   - Dark mode passes same thresholds
   - Color is never the only differentiator (add icons, text labels, patterns)
   - Focus indicators visible in both light and dark mode

5. **Motion & timing:**
   - Respect `prefers-reduced-motion`: disable all Framer Motion animations
   - No auto-playing content
   - Session timeout warning before logout

6. **Forms:**
   - All inputs have associated `<label>` elements
   - Required fields marked visually + programmatically (`aria-required`)
   - Error messages linked via `aria-describedby` or `aria-errormessage`
   - Auto-focus first field on modal/form open

7. **Testing tools:**
   - Run axe-core on every page in CI
   - Manual keyboard-only walkthrough before release
   - Screen reader testing (VoiceOver or NVDA)

---

## 17. Implementation Priority & Ordering

### Phase 1 — Foundation (Week 1)
| # | Task | Files Affected |
|---|------|---------------|
| 1 | Design tokens in globals.css | `globals.css` |
| 2 | CVA/variant system for components | New utility file |
| 3 | Button redesign | `button.tsx` |
| 4 | Input redesign (prefix, suffix, clear) | `input.tsx` |
| 5 | Select redesign (searchable, multi) | `select.tsx` |
| 6 | Badge additions (dot, removable, counter) | `badge.tsx` |
| 7 | Skeleton variants | `skeleton.tsx` |

### Phase 2 — Navigation (Week 2)
| # | Task | Files Affected |
|---|------|---------------|
| 8 | Sidebar visual overhaul | `sidebar.tsx` |
| 9 | Header redesign with command bar | `header.tsx` |
| 10 | Full-width layout toggle | `(app)/layout.tsx` |
| 11 | Breadcrumb component | New component |
| 12 | Global search command palette | `CommandPalette.tsx` |

### Phase 3 — Core Pages (Week 3-4)
| # | Task | Files Affected |
|---|------|---------------|
| 13 | Dashboard redesign (stat cards, charts, my tasks) | `dashboard/page.tsx`, dashboard components |
| 14 | Task list redesign (bulk actions, quick actions, compact rows) | `tasks/page.tsx` |
| 15 | Kanban board refresh (WIP, quick-add, density) | `KanbanBoard.tsx`, `KanbanCard.tsx` |
| 16 | Task detail full rebuild (comments, attachments, time, subtasks) | `tasks/[id]/page.tsx` |
| 17 | Unified task form | `TaskForm.tsx`, remove `NewTaskForm.tsx` |

### Phase 4 — Secondary Pages (Week 5)
| # | Task | Files Affected |
|---|------|---------------|
| 18 | Project detail redesign | `projects/[id]/page.tsx` |
| 19 | Team detail full implementation | `teams/[id]/page.tsx` |
| 20 | Reports interactivity (date range, filters, export) | `reports/page.tsx` |
| 21 | Notifications: click-to-navigate, real-time, grouping | `notifications/page.tsx` |

### Phase 5 — Profile, Auth & Admin (Week 6)
| # | Task | Files Affected |
|---|------|---------------|
| 22 | Profile + Settings merge | `profile/page.tsx`, `settings/page.tsx` |
| 23 | Auth pages redesign (split layout, password strength) | `login/page.tsx`, `register/page.tsx` |
| 24 | Admin improvements (inline edit, create modal, sorting) | `admin/users/page.tsx` |
| 25 | Organization settings expansion | `admin/organization/page.tsx` |

### Phase 6 — Polish (Week 7)
| # | Task | Files Affected |
|---|------|---------------|
| 26 | Accessibility audit + fixes | All pages |
| 27 | Mobile responsiveness pass | All components |
| 28 | Exit animations + reduced motion | `PageTransition.tsx` |
| 29 | Dark mode visual audit | All components |
| 30 | Landing page animation pass | Landing components |

### Phase 7 — Testing & QA (Week 8)
| # | Task | Files Affected |
|---|------|---------------|
| 31 | Component tests for new/redesigned components | Test files |
| 32 | Visual regression tests | E2E |
| 33 | Accessibility test (axe-core) | CI pipeline |
| 34 | Performance audit (Lighthouse) | All pages |
| 35 | Browser compatibility (Chrome, Firefox, Safari, Edge) | Manual |

---

## Appendix: Reference Design System

### Color Usage Rules
- **Primary actions**: blue-600 (`#2563eb`)
- **Success states**: green-600 (`#16a34a`)
- **Warning states**: amber-600 (`#d97706`)
- **Error states**: red-600 (`#dc2626`)
- **Info states**: blue-500 (`#3b82f6`)
- **Neutral borders**: gray-200 (`#e2e8f0`) light, gray-700 (`#334155`) dark
- **Backgrounds**: white cards on gray-50 (`#f8fafc`) light, dark-800 cards on dark-950 (`#030712`) dark
- **Text hierarchy**: gray-900 primary → gray-600 secondary → gray-400 tertiary (light)

### Typography
- **Headings**: Geist Sans, font-semibold
- **Body**: Geist Sans, font-normal
- **Code/monospace**: Geist Mono
- **Scale**: 12/14/16/18/20/24/30px
- **Line height**: 1.5 body, 1.25 headings

### Spacing Grid
- 4px → 8px → 12px → 16px → 20px → 24px → 32px → 40px → 48px → 64px
- Card padding: 24px
- Page padding: 32px desktop, 16px mobile
- Section gap: 32px
- Component gap: 16px
- Form field gap: 20px

### Icon Set
- All icons: Heroicons Outline (24px default, 20px for inline, 16px for small)
- Consistent 1.5px stroke width
- Current color (inherit from text color)

### Corner Radius
- Cards/modals: 12px (`rounded-xl`)
- Buttons/inputs: 8px (`rounded-lg`)
- Badges/pills: 9999px (`rounded-full`)
- Small elements: 6px (`rounded-md`)
