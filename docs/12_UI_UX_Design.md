# UI/UX Design

## Project

Professional Task Manager

Version: 1.1

---

# Information Architecture

The application is organized into the following primary areas.

- Authentication
- Dashboard
- Projects
- Tasks
- Teams
- Notifications
- Reports
- User Profile
- Administration
- Settings


# Primary Navigation

The sidebar navigation is role-aware. Items are filtered based on the authenticated user's permissions.

Dashboard

Projects

Tasks

Teams

Reports

Notifications

Profile

Settings

## Role-Based Navigation Rules

- **Team Member:** Dashboard, Tasks (assigned only), Notifications, Profile, Settings
- **Manager:** Dashboard, Projects, Tasks, Teams, Reports, Notifications, Profile, Settings
- **Administrator:** Dashboard, Projects, Tasks, Teams, Reports, Notifications, User Management, Role Management, Organization Settings, Profile, Settings

## Navigation States

- Active state: Current page is indicated with a filled background or accent border on the navigation item.
- Hover state: Subtle background change on mouse hover.
- Collapsed state: Sidebar can collapse to icon-only mode; tooltips display on hover.


# Screen Inventory

Authentication

- Login
- Register
- Email Verification
- Forgot Password
- Reset Password Confirmation
- Invitation Acceptance

Dashboard

- Manager Dashboard
- Team Member Dashboard
- Administrator Dashboard

Projects

- Project List
- Project Details
- Create Project
- Edit Project

Tasks

- Task List
- Task Details
- Create Task
- Edit Task
- Task Archive

Teams

- Team List
- Team Details
- Create Team
- Edit Team
- Delete Team

Notifications

- Notification Center

Reports

- Productivity Dashboard

Administration

- User Management
- Role Management
- Organization Settings

Profile

- View Profile
- Edit Profile
- Change Password

Settings

- Preferences


# Task State Workflow

Task statuses are presented as a visual workflow. The five states are:

- TODO
- IN_PROGRESS
- IN_REVIEW
- DONE
- ARCHIVED

Users transition between states via a status dropdown or inline quick-action buttons on the Task Details screen. The current state is visually distinguished using a color-coded badge. Transitions are constrained by business rules (e.g., completed tasks require reopening before editing).


# Screen Descriptions

## Authentication Screens

### Login
Email and password form. Includes "Forgot Password" link and "Register" link. Redirects authenticated users to their dashboard.

### Register
Full name, email, password, and organization name fields. On submission, sends email verification link and displays a verification prompt. Validates email uniqueness and password complexity (min 8 characters, at least one letter and one number).

### Email Verification
Displayed after registration. Informs the user to check their email and verify their account. Provides a "Resend Email" option. Blocks login until verified.

### Forgot Password
Email input field. On submission, sends a password reset link and displays a confirmation message. Always returns success response to prevent email enumeration.

### Reset Password Confirmation
New password and confirm password fields. Validates token from reset link. On success, redirects to Login with a success message.

### Invitation Acceptance
Displayed when an administrator creates a user. Contains a password setup form. Activates the account on submission.

## Dashboard Screens

### Manager Dashboard
Displays:
- Assigned tasks grouped by status
- Overdue tasks section
- Recently completed tasks
- Team productivity statistics
- Project progress overview

### Team Member Dashboard
Displays:
- My assigned tasks grouped by status
- Overdue tasks
- Recently completed tasks
- My productivity statistics

### Administrator Dashboard
Displays:
- Organization-wide metrics
- Active users count
- Recent activity log
- System health indicators

## Project Screens

### Project List
Displays all projects accessible to the user. Includes search, filter by status and visibility, and sort controls. Shows project name, status, task count, and owner.

### Project Details
Displays project information, member list with roles, and associated tasks. Includes tabs for Overview, Tasks, Members, and Activity. Edit and archive actions are available based on permissions.

### Create Project
Form with fields: name, description, status, visibility, color, start date, end date. Validates required fields and date constraints.

### Edit Project
Pre-populated form with all project fields. Same validation as Create Project. Access controlled by `project:update` permission or project owner role.

## Task Screens

### Task List
Displays tasks visible to the current user. Supports full-text search, multi-criteria filtering (status, priority, assignee, due date range, project), and sorting. Uses cursor-based pagination. Task rows display title, status, priority, due date, assignees, and project. Row actions include edit, archive, and delete.

### Task Details
Displays full task information. Organized into tabs:
- Overview: Title, description, status, priority, dates, estimates, assignees, labels, custom fields
- Activity: Chronological timeline of status changes, comments, and assignments
- Comments: Threaded comment list with add/edit/delete actions
- Attachments: File list with upload and delete actions
- Time Entries: Time log list with add action (if in scope)

Status transitions and task actions are presented as inline buttons or a dropdown menu based on user permissions.

### Create Task
Form with fields: title, description, project (required), status, priority, due date, start date, estimated hours, assignees (multi-select), labels (multi-select), parent task (optional), custom fields. Validates required fields and business rules.

### Edit Task
Pre-populated form with all task fields. Same validation as Create Task. Access controlled by `task:update` permission or assignee role.

### Task Archive
Displays archived tasks. Supports search and filter. Users can restore archived tasks if they have appropriate permissions.

## Team Screens

### Team List
Displays all teams in the organization. Shows team name, member count, and description. Includes create and delete actions based on permissions.

### Team Details
Displays team information and member list with roles. Includes add and remove member actions. Edit and delete actions are available based on permissions.

### Create Team
Form with fields: name, description, members (multi-select). Validates required fields.

### Edit Team
Pre-populated form with all team fields. Same validation as Create Team.

### Delete Team
Confirmation dialog before deletion. Displays impact warning (members and task history are preserved).

## Notification Center

Displays notifications for the current user. Supports filtering by read status and type. Includes batch mark-as-read action. Notifications are grouped by date (Today, Yesterday, Older). Each notification displays title, message, actor, timestamp, and action link.

## Reports

### Productivity Dashboard
Displays:
- Tasks by status chart
- Tasks by assignee chart
- Overdue tasks list
- Completion trends over time
- Export CSV button

## Administration Screens

### User Management
Displays all users in the organization. Supports search, filter by active status, and sort. Shows name, email, role, department, and last login. Includes create, deactivate, and edit actions.

### Role Management
Displays all roles and their associated permissions. Supports create, edit, and delete for custom roles. System roles are protected from deletion.

### Organization Settings
Displays and allows editing of organization name, logo, default timezone, date format, week start day, and subscription tier. Access restricted to organization administrators.

## Profile Screens

### View Profile
Displays user name, email, role, department, job title, timezone, and profile picture. Includes link to edit profile and change password.

### Edit Profile
Form with fields: first name, last name, job title, department, timezone, profile picture upload. Validates required fields.

### Change Password
Form with fields: current password, new password, confirm new password. Validates current password and new password complexity. Redirects to profile on success with confirmation message.

## Settings

### Preferences
Displays user preferences: theme (light/dark/system), language, notification email enabled, notification in-app enabled. Changes are saved immediately on toggle.


# Design System

## Typography

- Heading 1: 32px, Bold
- Heading 2: 24px, Semibold
- Heading 3: 20px, Semibold
- Body: 16px, Regular
- Caption: 14px, Regular

Font family: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)

## Spacing

- 4px
- 8px
- 16px
- 24px
- 32px

## Border Radius

- Small: 4px
- Medium: 8px
- Large: 12px

## Color System

### Primary Colors
- Primary 50: #eff6ff
- Primary 100: #dbeafe
- Primary 200: #bfdbfe
- Primary 300: #93c5fd
- Primary 400: #60a5fa
- Primary 500: #3b82f6
- Primary 600: #2563eb
- Primary 700: #1d4ed8
- Primary 800: #1e40af
- Primary 900: #1e3a8a

### Semantic Colors
- Success: #22c55e
- Success light: #dcfce7
- Warning: #f59e0b
- Warning light: #fef3c7
- Error: #ef4444
- Error light: #fee2e2
- Info: #3b82f6
- Info light: #dbeafe

### Neutral Colors
- Gray 50: #f9fafb
- Gray 100: #f3f4f6
- Gray 200: #e5e7eb
- Gray 300: #d1d5db
- Gray 400: #9ca3af
- Gray 500: #6b7280
- Gray 600: #4b5563
- Gray 700: #374151
- Gray 800: #1f2937
- Gray 900: #111827

### Surface Colors
- Background: #ffffff
- Card: #ffffff
- Border: #e5e7eb
- Elevated: #ffffff

### Text Colors
- Primary: #111827
- Secondary: #6b7280
- Muted: #9ca3af
- Disabled: #d1d5db
- Inverse: #ffffff

### Status Colors
- TODO: #6b7280 (Gray)
- IN_PROGRESS: #3b82f6 (Blue)
- IN_REVIEW: #f59e0b (Amber)
- DONE: #22c55e (Green)
- ARCHIVED: #9ca3af (Gray)

### Priority Colors
- LOW: #6b7280 (Gray)
- MEDIUM: #3b82f6 (Blue)
- HIGH: #f59e0b (Amber)
- URGENT: #ef4444 (Red)

## Elevation and Shadows

- Level 0: No shadow (flat surfaces)
- Level 1: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) (cards, dropdowns)
- Level 2: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06) (modals, popovers)
- Level 3: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05) (dialogs, sheets)

## Dark Mode Colors

Dark mode uses the same hue values with adjusted lightness. Surfaces use Gray 900 as background, Gray 800 as card, and Gray 700 as border. Text uses Gray 50 as primary, Gray 300 as secondary, and Gray 400 as muted.

## Component States

All interactive components support the following states:
- Default
- Hover
- Active / Pressed
- Focus (visible ring, 2px solid Primary 500, 2px offset)
- Disabled
- Loading (spinner overlay or skeleton)
- Error (red border and error message)

## Icons

- Lucide React

## Buttons

- Primary
- Secondary
- Destructive
- Outline
- Ghost

All buttons support the states defined in Component States. Icon buttons are supported as a variant with 40px square touch target.

## Cards

- Standard Card
- Statistics Card

Cards use Level 1 elevation by default. Hover state elevates to Level 2 for interactive cards.

## Forms

- Input
- Select
- MultiSelect
- Checkbox
- Radio Button
- Textarea
- DatePicker
- TagInput

All form controls include:
- Label above the input
- Required field indicator (asterisk)
- Helper text below the input
- Error message below the input in Error state
- Full keyboard accessibility

## Task State Components

- StatusPill: Color-coded badge showing current task status
- PriorityBadge: Color-coded badge showing task priority
- StatusDropdown: Dropdown menu for changing task status
- QuickActions: Contextual action buttons (Reopen, Archive, Delete) based on task state and user permissions

## Navigation Components

- Sidebar: Collapsible, role-aware navigation
- Breadcrumb: Shows current location in hierarchy (Project > Tasks > Task Details)
- TabBar: For organizing content within a screen (Task Details tabs)

## Overlay Components

- Modal: Centered overlay for focused actions
- Dialog: Full-screen or large overlay for complex workflows
- Toast: Temporary notification in bottom-right corner
- ConfirmationDialog: Modal with title, message, and confirm/cancel actions

## Data Display Components

- Table: Sortable, filterable rows with actions column
- Pagination: Cursor-based or offset-based pagination controls
- Avatar: User avatar with fallback to initials
- AvatarGroup: Overlapping avatars for task assignees or project members
- Badge: Small status or count indicator
- EmptyState: Illustrated message when no data exists
- ErrorState: Illustrated message when an error occurs
- SkeletonLoader: Animated placeholder while content loads
- LoadingSpinner: Centered spinner for full-page or section loading

## Feedback Components

- Toast: Success, error, warning, and info variants
- ProgressBar: For upload progress or completion percentage

## Utility Components

- SearchBar: Full-text search input with debounced API calls
- DropdownMenu: Action menu for table rows and cards
- ContextMenu: Right-click menu for task actions
- CommandPalette: Keyboard-driven search and navigation (Cmd+K)
- Tooltip: Hover or focus tooltip for truncated content


# Shared Components

Navbar (global top bar for mobile; on desktop, the sidebar serves as primary nav)

Sidebar

Button

Input

Select

MultiSelect

Checkbox

Radio Button

Textarea

DatePicker

TagInput

Card

Table

Avatar

AvatarGroup

Badge

StatusPill

PriorityBadge

Modal

Dialog

Toast

Breadcrumb

SearchBar

Pagination

LoadingSpinner

SkeletonLoader

EmptyState

ErrorState

ConfirmationDialog

DropdownMenu

ContextMenu

Tabs

TabBar

ProgressBar

Tooltip

CommandPalette


# Responsive Design

V1 is a desktop-focused web application. The minimum supported viewport is 1024px width.

Breakpoints:
- Desktop: 1024px and above (full layout with collapsible sidebar)
- Tablet: 768px to 1023px (sidebar collapsed by default, tables scroll horizontally)
- Mobile: below 768px (not supported in V1; displays unsupported browser message)

Table behavior on smaller desktop viewports: tables use horizontal scrolling within a container rather than collapsing columns, to preserve data access.


# Accessibility

All interactive elements must be keyboard accessible. Tab order follows visual layout. Focus indicators are visible on all interactive elements (2px solid Primary 500 ring, 2px offset).

Modals trap focus within the dialog. Closing a modal returns focus to the triggering element.

Forms associate error messages with inputs via aria-describedby. Required fields are indicated with aria-required.

Dynamic content (notifications, toast messages, live status updates) uses aria-live regions.

Color is not the sole means of conveying information. Status and priority use both color and text labels.

All images, including avatars, include appropriate alt text. Decorative images use alt="".


# V1 Scope and Deferred Features

The following API-backed entities and features are modeled in the backend but are deferred for V1 UI implementation:

- Time Entries: API endpoints exist but the UI does not include time tracking in V1. Time entry data may be displayed in Task Details if available but creation and editing flows are deferred.
- Labels: API support exists. Basic label display on tasks is in scope. Full label management (create, edit, delete labels) is deferred.
- Task Dependencies: API support exists. Display of dependencies on Task Details is in scope. Dependency creation and management UI is deferred.
- Custom Fields: API support exists. Display of custom field values on Task Details is in scope. Custom field configuration UI is deferred.
- Attachments: Upload, list, and delete are in scope for V1.
- Comments: Threaded comments are in scope for V1.
- Notifications: In-app notifications and email are in scope for V1.
