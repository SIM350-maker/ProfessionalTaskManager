# Application Testing Guide — User Journey Walkthrough

> **Purpose:** This guide walks through every feature of the Professional Task Manager via end-to-end user journeys. Follow these steps sequentially to validate the entire system behaves correctly. Each section includes setup prerequisites, step-by-step actions, expected outcomes, and edge cases to test.

---

## Table of Contents

1. [Landing Page Experience](#1-landing-page-experience)
2. [User Registration](#2-user-registration)
3. [Email Verification](#3-email-verification)
4. [User Login](#4-user-login)
5. [Password Reset Flow](#5-password-reset-flow)
6. [Dashboard — First Look](#6-dashboard--first-look)
7. [Theme Switching (Light/Dark/System)](#7-theme-switching-lightdarksystem)
8. [Profile Management](#8-profile-management)
9. [Settings — Password & Notification Preferences](#9-settings--password--notification-preferences)
10. [Project Management](#10-project-management)
11. [Task Management — CRUD](#11-task-management--crud)
12. [Task Kanban Board (Drag & Drop)](#12-task-kanban-board-drag--drop)
13. [Task Filters, Search & Sort](#13-task-filters-search--sort)
14. [Task Detail View — Comments, Attachments, Activity](#14-task-detail-view--comments-attachments-activity)
15. [Task Dependencies & Subtasks](#15-task-dependencies--subtasks)
16. [Time Tracking](#16-time-tracking)
17. [Team Management](#17-team-management)
18. [Notifications](#18-notifications)
19. [Reports & Analytics](#19-reports--analytics)
20. [Admin — User Management](#20-admin--user-management)
21. [Admin — Organization Settings](#21-admin--organization-settings)
22. [Role-Based Access Control (RBAC)](#22-role-based-access-control-rbac)
23. [Empty States & Error Handling](#23-empty-states--error-handling)
24. [Logout & Session Expiry](#24-logout--session-expiry)
25. [Full Regression Checklist](#25-full-regression-checklist)

---

> **Prerequisites for Testing:**
> - Application must be running locally (`npm run dev`) or on a staging server.
> - PostgreSQL, Redis, and MinIO must be running (via Docker Compose or otherwise).
> - Database must be seeded (`npx prisma db seed`).
> - At least **three test accounts** are needed: one **Administrator**, one **Manager**, one **Team Member**. The seed data should provide these.
> - A clean browser profile is recommended (no cached session cookies).

---

## 1. Landing Page Experience

### Description
The landing page is the first thing unauthenticated visitors see. It should present the product, its features, and calls to action.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Navigate to `http://localhost:3000` (or the deployed URL) | The landing page loads without errors. No console errors. |
| 1.2 | Scroll through the page | Sections render: **Hero**, **Features Grid** (6 features: Task Management, Team Collaboration, Project Tracking, Time Tracking, Reports & Analytics, Role-Based Access), **Use Cases**, **How It Works**, **Pricing Cards**, **Footer**. |
| 1.3 | Click **"Get Started"** (Hero CTA) | Redirects to `/auth/register`. |
| 1.4 | Click **"Learn More"** (Hero CTA) | Scrolls smoothly to the Features section. |
| 1.5 | Click **"View Pricing"** | Scrolls to the Pricing section. |
| 1.6 | Click **"Log In"** (Header link) | Redirects to `/auth/login`. |
| 1.7 | Click any **Footer link** | Links navigate correctly (no broken links). |
| 1.8 | Resize the browser to mobile width (375px–768px) | Layout is responsive: sections stack vertically, text reflows, navigation collapses to a hamburger menu or similar. |
| 1.9 | Verify page load performance | Page loads within 3 seconds on a standard connection. Images are lazy-loaded. |

### Edge Cases
- **Slow network**: Verify skeleton/spinner states appear while content loads.
- **JavaScript disabled**: Verify basic content is server-side rendered (if SSR is configured).

---

## 2. User Registration

### Description
A new user creates an account. The system must create both the user and an organization (or use an existing one with matching name).

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Navigate to `/auth/register`. | The registration form is displayed with fields: First Name, Last Name, Email, Password, Confirm Password, Organization Name. |
| 2.2 | Leave all fields empty and click **"Create Account"**. | Form validation fires: each required field shows an error message. No network request is made. |
| 2.3 | Enter an invalid email (`not-an-email`) and submit. | Validation error: "Invalid email address". |
| 2.4 | Enter password of fewer than 8 characters and submit. | Validation error: "Password must be at least 8 characters". |
| 2.5 | Enter mismatched passwords (password ≠ confirm password) and submit. | Validation error: "Passwords do not match". |
| 2.6 | Enter valid data: `firstName=Jane`, `lastName=Doe`, `email=jane.doe@example.com`, `password=Password123!`, `confirmPassword=Password123!`, `organizationName=TestOrg`. Click **"Create Account"**. | **(Happy Path)** A loading spinner displays on the submit button. On success, the user is redirected to `/auth/login` with a success message: "Account created! Please check your email to verify your account." |
| 2.7 | Check the database (or logs): `User` record exists with `emailVerifiedAt = null` and an `emailVerificationToken`. `Organization` named "TestOrg" exists. | Confirmed. |
| 2.8 | Register again with the **same email** (`jane.doe@example.com`). | Error displayed: "A user with this email already exists." No duplicate created. |
| 2.9 | Register again with the **same organization name** but different email. | The new user is added to the **existing** organization. No duplicate organization is created. |
| 2.10 | Check password is stored securely | The `passwordHash` field contains a bcrypt hash (starts with `$2a$` or `$2b$`), never the plaintext password. |

### Edge Cases
- **Very long names/org names**: Should be truncated or rejected with a clear message.
- **XSS in name fields**: `<script>alert('xss')</script>` should be sanitized.
- **SQL injection in any field**: Should be prevented by parameterized queries (Prisma handles this).
- **Rate limiting**: Multiple rapid registration attempts from the same IP should be throttled.

---

## 3. Email Verification

### Description
After registration, the user must verify their email address before they can fully use the system.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | After registration, check the application logs or console for the email verification link (in development, emails may be logged rather than sent). | A verification email is "sent" containing a link like `http://localhost:3000/auth/verify-email/{token}`. |
| 3.2 | Copy the verification link and open it in a browser. | The verify-email page loads. If auto-verify on page load: the page displays "Email verified successfully! You can now log in." |
| 3.3 | Attempt to log in **before** verifying (if the system blocks unverified users). | Login fails with a message: "Please verify your email before logging in." |
| 3.4 | After verification, navigate to `/auth/login`. | User can log in successfully. |
| 3.5 | Click the verification link **a second time**. | Appropriate message: "Email already verified." or "This link has expired." No error/exception. |
| 3.6 | Open the verification link with an **invalid/expired token** (`/auth/verify-email/invalid-token`). | Error displayed: "Invalid or expired verification link." |

### Edge Cases
- **Token expiry**: If there's a token expiry (e.g., 24 hours), test with an expired token.
- **Concurrent verification**: Open the link in two tabs simultaneously — only one should succeed.

---

## 4. User Login

### Description
Registered users authenticate with email/password. The system creates a session and sets an HTTP-only cookie.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Navigate to `/auth/login`. | Login form is displayed with fields: Email, Password, "Remember Me" checkbox, "Forgot Password?" link. |
| 4.2 | Leave fields empty and click **"Log In"**. | Validation errors: "Email is required", "Password is required". |
| 4.3 | Enter an unregistered email and any password. Click **"Log In"**. | Error: "Invalid email or password." (No hint about which field is wrong — security best practice). |
| 4.4 | Enter a registered email but a wrong password. Click **"Log In"**. | Error: "Invalid email or password." |
| 4.5 | Enter valid credentials for a **deactivated user**. | Error: "Your account has been deactivated. Please contact your administrator." |
| 4.6 | Enter valid credentials for a **verified** active user. Click **"Log In"**. | **(Happy Path)** Redirected to `/dashboard`. A session cookie (`session_token`) is set (HTTP-only, Secure, SameSite=Lax). |
| 4.7 | Open browser DevTools → Application → Cookies. Verify the `session_token` cookie. | Cookie is present, flagged `HttpOnly`, `Secure` (in production), `SameSite=Lax`. |
| 4.8 | Close the browser tab, open a new tab, navigate to `/dashboard`. | User is still authenticated (session persists within expiry — default 7 days). |
| 4.9 | Check the `Session` table in the database. | A session record exists with the user's ID and a future `expiresAt`. |

### Edge Cases
- **Remember Me**: When checked, session expiry should be longer (e.g., 30 days). When unchecked, session should expire when browser closes (session cookie).
- **Concurrent sessions**: The same user can log in from multiple browsers/devices — each gets its own session.
- **Session replay**: The `session_token` should be a cryptographically random UUID.

---

## 5. Password Reset Flow

### Description
A user who forgot their password can request a reset email and set a new password.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Navigate to `/auth/login`. Click **"Forgot Password?"**. | Redirected to `/auth/reset-password`. |
| 5.2 | Submit the form with an empty email. | Validation error: "Email is required." |
| 5.3 | Submit with an unregistered email. | Message: "If an account with that email exists, a password reset link has been sent." (No information leakage). |
| 5.4 | Submit with a registered email. | Same success message as step 5.3 (to avoid email enumeration). |
| 5.5 | Check logs/console for the reset email. | A link like `http://localhost:3000/auth/reset-password/{token}` is "sent". |
| 5.6 | Open the reset link. | The reset password form is displayed with fields: New Password, Confirm New Password. |
| 5.7 | Enter a weak password (fewer than 8 characters). | Validation error: "Password must be at least 8 characters." |
| 5.8 | Enter mismatched passwords. | Validation error: "Passwords do not match." |
| 5.9 | Enter a valid new password and submit. | Success message: "Password reset successfully. You can now log in with your new password." Redirected to `/auth/login`. |
| 5.10 | Log in with the **old password**. | Error: "Invalid email or password." (Old password no longer works). |
| 5.11 | Log in with the **new password**. | **(Happy Path)** Success — redirected to `/dashboard`. |
| 5.12 | Open the same reset link again. | Error: "Invalid or expired reset link." (Token is single-use). |

### Edge Cases
- **Token expiry**: Reset tokens should expire (e.g., 1 hour). Test with an expired token.
- **User changes mind**: If the reset link is never used, the old password should still work.
- **Email delivery failure**: The system should handle email service failures gracefully (log error, do not crash).

---

## 6. Dashboard — First Look

### Description
After login, the user lands on the dashboard — their mission control showing task summaries, stats, and quick actions.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Log in as any user with some tasks assigned. | Dashboard loads. It displays: **Welcome message**, **Stats cards** (Total Tasks, Overdue, In Progress, Completed), **Overdue Tasks** section, **Productivity Chart**, **Recent Activity**. |
| 6.2 | Verify the stats cards show correct counts. | Cross-reference with the task list. E.g., if 3 tasks are overdue, the "Overdue" card shows "3". |
| 6.3 | Click on a stat card (e.g., "Overdue"). | Redirects to `/tasks` with the appropriate filter pre-applied (`status=OVERDUE`). |
| 6.4 | Log in as a **new user with no tasks**. | Dashboard shows **empty state**: "You have no assigned tasks. Create a new task or ask your manager to assign work to you." An action button ("Create Task" or "Browse Projects") is available. |
| 6.5 | Verify the **Productivity Chart** renders. | A line chart showing daily task completions for the last 7–30 days. No console errors. |
| 6.6 | Verify the **Status Distribution** chart renders. | A pie or bar chart showing task distribution by status (TODO, IN_PROGRESS, IN_REVIEW, DONE). |
| 6.7 | Verify page loads in under 2 seconds. | Acceptable performance. |

### Edge Cases
- **Empty state** for each widget: overdue list with no items, chart with no data, etc.
- **Very large dataset**: Dashboard with 100+ tasks should still load promptly (check for pagination or query limits).
- **Mobile responsiveness**: Dashboard widgets should stack vertically on mobile.

---

## 7. Theme Switching (Light/Dark/System)

### Description
Users can switch between light mode, dark mode, or follow their system preference.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Log in and locate the **theme toggle** (likely in the sidebar footer or header). | A sun/moon icon button or dropdown with options "Light", "Dark", "System". |
| 7.2 | Click the toggle to switch from **Light** to **Dark**. | All pages immediately switch to dark mode. Backgrounds are dark, text is light, charts and components re-color appropriately. |
| 7.3 | Navigate through all pages: Dashboard, Tasks, Projects, Teams, Reports, Notifications, Profile, Settings, Admin pages. | Every page renders correctly in dark mode. No invisible text, no unreadable contrast. |
| 7.4 | Switch back to **Light** mode. | All pages return to light mode. |
| 7.5 | Switch to **System** mode. | The theme follows the OS/browser preference. Change your OS theme to verify. |
| 7.6 | Refresh the page. | Theme preference is persisted (likely via `localStorage` or cookie). The correct theme loads immediately without flash. |
| 7.7 | Log out and log back in. | Theme preference is retained. |

### Edge Cases
- **Flash of incorrect theme**: There should be no flash of light mode when dark mode is selected (use a blocking `<script>` in `<head>` or inline critical CSS).
- **Print mode**: When printing, the page should default to light mode regardless of current theme.

---

## 8. Profile Management

### Description
Users can view and edit their profile: name, email, avatar.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Navigate to `/profile`. | Profile page shows: First Name, Last Name, Email (read-only), Avatar (initials if no image). |
| 8.2 | Edit the first name and/or last name. Click **"Save Changes"**. | Success toast: "Profile updated successfully." The sidebar/header user display updates immediately. |
| 8.3 | Leave the name fields empty and try to save. | Validation error: "First name is required." / "Last name is required." |
| 8.4 | Verify the email field is **read-only** (no edit). | Email should not be editable (or if editable, require re-verification). |
| 8.5 | Check the database after update. | The `User` record has the updated name. |

### Edge Cases
- **Avatar upload**: If available, upload an image. Verify it displays correctly. Test with oversized images (>5MB) and unsupported formats.
- **Unicode names**: Test with names containing accented characters, CJK characters, etc.
- **Concurrent profile edits**: Two tabs editing the profile simultaneously — last save wins (or conflict detection).

---

## 9. Settings — Password & Notification Preferences

### Description
Users change their password, configure notification preferences, and manage other settings.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Navigate to `/settings`. | Settings page displays sections: **Change Password**, **Notification Preferences**, **Theme** (if not in sidebar), **Language** (if implemented). |
| 9.2 | **Change Password**: Enter current password, new password, confirm new password. Click **"Update Password"**. | Success: "Password changed successfully." |
| 9.3 | Enter an incorrect **current password** and submit. | Error: "Current password is incorrect." |
| 9.4 | Enter a new password that matches the current password. | Error or success — depending on policy (some systems allow reusing the same password, others require a new one). |
| 9.5 | **Notification Preferences**: Review all toggles (Task Assigned, Task Completed, Due Date Reminder, Comment Added). | All toggles are present and reflect the current state. |
| 9.6 | Toggle **"Due Date Reminder"** OFF. Click **"Save Preferences"**. | Success toast. The `UserPreferences` record is updated. |
| 9.7 | Trigger a due date reminder (e.g., by having a task due soon). | No notification is generated for this user. |
| 9.8 | Toggle **"Due Date Reminder"** back ON. Save. | Notifications resume. |
| 9.9 | Toggle **Email notifications** for Task Assigned OFF, but leave **In-app** ON. | The user receives in-app notifications but no email for task assignments. |
| 9.10 | Change **Theme** in settings (if available) and verify it persists. | Theme updates immediately and persists across sessions. |

### Edge Cases
- **All notifications disabled**: User toggles everything OFF. The system should respect this and not send any notifications.
- **Password history**: Verify that the last N passwords cannot be reused (if implemented).

---

## 10. Project Management

### Description
Full CRUD for projects — create, view, edit, delete. Projects are the primary grouping for tasks.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | Navigate to `/projects`. | Project list displays. Shows: name, status badge, task count, member count, dates. |
| 10.2 | Use the **search bar** to search for a project by name. | Results filter in real-time (debounced) as you type. |
| 10.3 | Use the **status filter** (All / Planning / Active / On Hold / Completed / Archived). | Only projects matching the selected status are shown. |
| 10.4 | Click **"New Project"**. Navigate to `/projects/new`. | Project creation form: Name, Description, Status, Visibility (Private / Internal / Public), Start Date, End Date, Color. |
| 10.5 | Submit with an empty name. | Validation error: "Project name is required." |
| 10.6 | Fill all required fields and submit. | Success toast. Redirected to the new project's detail page (`/projects/{id}`). |
| 10.7 | On the project detail page, verify the tabs: **Overview**, **Tasks**, **Timeline**, **Members**. | Each tab loads correctly. |
| 10.8 | **Overview tab**: Shows project name, description, status, dates, member avatars, task summary. | All details are displayed correctly. |
| 10.9 | **Tasks tab**: Shows all tasks belonging to this project in a list. | Tasks are filterable and searchable within the project context. |
| 10.10 | **Timeline tab**: Shows a timeline or Gantt chart of project tasks. | Tasks with start/due dates are plotted on the timeline. |
| 10.11 | **Members tab**: Shows project members with their roles. | Members are listed. If you have permission, you can add/remove members. |
| 10.12 | Navigate to `/projects/{id}/edit`. | Edit form is pre-populated with existing data. |
| 10.13 | Change the project name, status to "Completed", and save. | Project updates. The detail page reflects changes. The project list shows the updated status. |
| 10.14 | **Delete the project** (if permitted by role). | Confirm dialog appears: "Are you sure you want to delete this project? This will also delete all associated tasks." |
| 10.15 | Confirm deletion. | Project is soft-deleted. Redirected to `/projects`. The deleted project no longer appears in the list. |
| 10.16 | Log in as a user who does **not** have delete permission. | The delete button is not visible or is disabled. |

### Edge Cases
- **Delete project with 100+ tasks**: All tasks should be soft-deleted in a transaction.
- **Project with the same name**: Duplicate project names should be allowed (if not explicitly prevented).
- **Date validation**: End date should not be before start date.
- **Visibility**: A "Private" project should only be visible to its members. A "Public" project is visible to the entire organization.

---

## 11. Task Management — CRUD

### Description
Core functionality: create, read, update, soft-delete tasks with full field support.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 11.1 | Navigate to `/tasks`. | Task list displays. Shows: title, status badge, priority badge, assignee avatars, due date. |
| 11.2 | Click **"New Task"** — navigate to `/tasks/new`. | Task creation form: Title, Description, Project (dropdown), Status, Priority, Assignees (multi-select), Labels, Start Date, Due Date, Estimated Hours, Parent Task (for subtasks). |
| 11.3 | Submit with only a title filled. | Task is created with defaults (status=TODO, priority=MEDIUM, no assignee, no due date). |
| 11.4 | Fill **all fields** and submit. | **(Happy Path)** Task created. Redirected to `/tasks/{id}` with full details. |
| 11.5 | On the task detail page, verify all information is displayed: title, description, project, status, priority, assignees, dates, labels, estimated hours. | All fields match what was entered. |
| 11.6 | Click **"Edit"** — navigate to `/tasks/{id}/edit`. | Edit form is pre-populated. |
| 11.7 | Change the title, status to "IN_PROGRESS", priority to "URGENT", and **reassign** to a different user. Click **"Save"**. | Changes saved. The detail page reflects updates. |
| 11.8 | Change the task status to "DONE". | If configured, the original assignee and the task creator receive a notification. |
| 11.9 | **Delete the task**. | Confirm dialog. On confirm, task is soft-deleted (`deletedAt` is set). Redirected to `/tasks`. |
| 11.10 | Verify the deleted task no longer appears in the task list. | Correct. |
| 11.11 | As an Admin, verify you can see the deleted task in the database (it still exists, just with `deletedAt` set). | Correct — soft delete preserves data integrity. |

### Edge Cases
- **Assigning a task to yourself**: Should be allowed.
- **Assigning a task to a deactivated user**: The deactivated user should not appear in the assignee dropdown.
- **Due date in the past**: Should be allowed (a task can be overdue from creation).
- **Estimated hours**: Accept decimal values (e.g., 2.5 hours). Reject negative values.
- **Subtask**: Creating a task with `parentTaskId` links it as a subtask. The parent task should show subtask count.

---

## 12. Task Kanban Board (Drag & Drop)

### Description
Tasks can be viewed and managed on a Kanban board with drag-and-drop between columns.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 12.1 | Navigate to `/tasks`. | The view defaults to **List View**. There is a toggle/button to switch to **Board View**. |
| 12.2 | Click **"Board View"** (or equivalent toggle). | Kanban board renders with 5 columns: **To Do**, **In Progress**, **In Review**, **Done**, **Archived**. Each column shows task cards. |
| 12.3 | Verify column counts are correct. | Each column header shows the count of tasks in that column. |
| 12.4 | Drag a task card from **"To Do"** to **"In Progress"**. | The card animates smoothly. The task's status updates to `IN_PROGRESS` in the database. |
| 12.5 | Refresh the page. | The card remains in the "In Progress" column (persisted). |
| 12.6 | Drag a task card to **"Done"**. | If configured, a notification is sent to the task assigner. |
| 12.7 | Drag a task to **"Archived"**. | The task is removed from active views (though still accessible via "Show Archived" filter). |
| 12.8 | Drag a task card back from **"Done"** to **"In Progress"**. | The status reverts. Verify the reversion works. |
| 12.9 | Test with **touch devices** (if touch input is supported). | Long-press and drag works on touch screens. |
| 12.10 | Attempt to drag a task for which you don't have permission to change status. | Drag should be prevented or show a "permission denied" feedback. |
| 12.11 | Test **keyboard accessibility** for the Kanban board. | Users should be able to navigate between tasks and columns using the keyboard. |

### Edge Cases
- **Moving the last task out of a column**: The column should remain visible (empty state).
- **Rapid drag-and-drop**: Moving multiple tasks quickly should not cause race conditions.
- **Concurrent drags**: Two users dragging the same task simultaneously — last write wins. No data corruption.

---

## 13. Task Filters, Search & Sort

### Description
Robust filtering, searching, and sorting on the task list.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 13.1 | On `/tasks`, use the **search bar** to type a task title keyword. | Results filter in real-time (debounced ~300ms). Only tasks matching the keyword appear. |
| 13.2 | Clear the search. | Full task list restores. |
| 13.3 | Use the **Status filter**: select "In Progress". | Only tasks with status `IN_PROGRESS` are shown. The URL updates (e.g., `?status=IN_PROGRESS`). |
| 13.4 | Combine **Status + Priority filters**: Status = "In Progress", Priority = "High". | Only tasks matching both criteria appear. |
| 13.5 | Add a **Project filter** on top of existing filters. | Results narrow further. |
| 13.6 | Use the **Sort** dropdown: sort by Due Date (ascending). | Tasks are ordered by nearest due date first. |
| 13.7 | Sort by Priority (descending). | Tasks ordered: Urgent → High → Medium → Low. |
| 13.8 | Sort by Created Date (newest first). | Correct ordering. |
| 13.9 | Use the **date range filter** (if available): filter tasks due "This Week". | Only tasks with due dates in the current week are shown. |
| 13.10 | Copy the filtered URL and open it in a new tab. | The same filters are applied (URL-synced filters). |
| 13.11 | Click **"Clear Filters"** (if available). | All filters are reset. The full task list is shown. |
| 13.12 | Search for a non-existent task. | **Empty state** displays: "No tasks match your search criteria." Action button: "Clear filters" or "Create a new task". |

### Edge Cases
- **Filter persistence**: When navigating away and back, filters should be preserved (URL-based) or reset (session-based).
- **Special characters in search**: Search should handle `!@#$%^&*()` without errors.
- **Very long search results**: Pagination should work correctly when combined with filters.

---

## 14. Task Detail View — Comments, Attachments, Activity

### Description
The task detail page is the hub for collaboration: comments, file attachments, and activity log.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 14.1 | Navigate to `/tasks/{id}`. | Task detail page loads: title, description, metadata panel (status, priority, assignees, dates, labels, project), comments section, activity log. |
| 14.2 | **Add a comment**: Type a comment and click **"Post Comment"**. | Comment appears immediately in the comments thread. |
| 14.3 | **Reply to a comment**: Click **"Reply"** on an existing comment. | A reply form appears. Posting it creates a threaded reply (indented below the parent). |
| 14.4 | **Edit your own comment**: Click the edit icon on your comment. | The comment becomes editable. Save the edit. The comment updates with an "Edited" indicator. |
| 14.5 | **Delete your own comment**: Click the delete icon. | Confirm dialog. On confirm, comment is soft-deleted. |
| 14.6 | Try to edit or delete **another user's comment**. | Edit/delete buttons are not visible or are disabled. |
| 14.7 | **Upload an attachment**: Click the attachment button, select a file (e.g., `.pdf`, `.png`, `.docx`). | File uploads with a progress indicator. The attachment appears in the attachments list. |
| 14.8 | Upload a file exceeding the size limit (e.g., >10MB). | Error: "File exceeds maximum size of 10 MB." Upload is rejected. |
| 14.9 | Upload an unsupported file type (e.g., `.exe`). | Error: "Unsupported file format." Upload is rejected. |
| 14.10 | **Download an attachment**: Click the download link/button on an uploaded file. | File downloads correctly. |
| 14.11 | View the **Activity Log** section. | Shows a chronological list of actions: "Task created", "Status changed from TODO to IN_PROGRESS", "Assignee added: John Doe", etc. |
| 14.12 | Perform several actions (change status, add comment, add assignee) and check the activity log updates. | Each action is logged with a timestamp and the acting user. |
| 14.13 | **@mention** a user in a comment (e.g., `@jane.doe`). | The mentioned user receives a notification. The mention is highlighted in the comment. |

### Edge Cases
- **Empty comment**: Posting a blank comment should be prevented.
- **XSS in comment**: `<script>alert('xss')</script>` should be sanitized/escaped.
- **File with virus**: If virus scanning is implemented, a file flagged as malicious should show "Virus detected" and be blocked.
- **Concurrent comment posting**: Two users posting simultaneously should both succeed.
- **Very long comment**: Should respect max length or truncate gracefully.

---

## 15. Task Dependencies & Subtasks

### Description
Tasks can have dependencies (blocked by/blocking) and subtasks (parent-child relationship).

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 15.1 | Create a **parent task** (Task A). | Task A is created. |
| 15.2 | Create a **subtask** (Task B) with `parentTaskId` pointing to Task A. | Task A's detail page shows Task B as a subtask. Task B's page shows "Parent Task: Task A". |
| 15.3 | Complete the subtask (Task B → DONE). | Task A's progress updates (e.g., "1/3 subtasks completed"). |
| 15.4 | Create a **dependency**: Task C depends on Task A (predecessor). | Task C's detail shows "Blocked by: Task A" with status. Task A's detail shows "Blocking: Task C". |
| 15.5 | Try to set Task C to DONE while Task A is not DONE. | If blocking logic is enforced, show a warning: "This task is blocked by Task A. Complete Task A first." |
| 15.6 | Complete Task A. | Task C's blocked status is automatically cleared (or user must manually refresh). |

### Edge Cases
- **Circular dependency**: Task A → Task B → Task A should be prevented.
- **Deep nesting**: Subtask of a subtask (3+ levels) should work.
- **Deleting a parent task**: Subtasks should be handled (either cascade delete or reparent).

---

## 16. Time Tracking

### Description
Users can log time entries against tasks to track how long work takes.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 16.1 | Navigate to a task detail page (`/tasks/{id}`). | If time tracking is enabled, a **Time Tracking** section is visible. |
| 16.2 | Click **"Log Time"** or **"Start Timer"**. | If start timer: timer begins counting. If log time: a form appears with Start Time, End Time, Description. |
| 16.3 | Enter start time, end time, and a description. Click **"Save"**. | Time entry is saved. Total logged time for the task updates. |
| 16.4 | Verify the time entry appears in the time tracking list on the task page. | Entry is listed with correct duration. |
| 16.5 | Check the database `TimeEntry` table. | Record exists with correct `userId`, `taskId`, `startTime`, `endTime`, `description`. |
| 16.6 | Log out and log in as another user. Verify time entries are user-specific. | You only see your own time entries (or manager sees team entries). |

### Edge Cases
- **Overlapping time entries**: Should be allowed or warned about.
- **Negative duration**: End time before start time should be rejected.
- **Zero duration**: Start time = end time should be allowed (maybe a placeholder entry).

---

## 17. Team Management

### Description
Create and manage teams — groups of users that can be assigned to projects or tasks.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 17.1 | Navigate to `/teams`. | Team list displays. Shows: name, member count, description. |
| 17.2 | Click **"New Team"** — navigate to `/teams/new`. | Creation form: Name, Description, Members (multi-select user list). |
| 17.3 | Submit with only a name. | Team is created with no members. |
| 17.4 | Create a team with selected members. | Team created. Members are associated (check `UserTeam` table). |
| 17.5 | Navigate to the team detail page (`/teams/{id}`). | Shows team name, description, list of members with avatars. |
| 17.6 | **Edit the team** (if editable): add a member, remove a member. | Changes are persisted. |
| 17.7 | Remove a member from the team. | The member's account and task history remain intact (only team membership is removed). |
| 17.8 | **Delete the team**. | Confirm dialog. On confirm, team is soft-deleted. Redirected to `/teams`. Members are unaffected. |
| 17.9 | Verify a deleted team no longer appears in the list. | Correct. |

### Edge Cases
- **Adding a deactivated user to a team**: Should not be allowed (deactivated users shouldn't be selectable).
- **Team with 0 members**: Should display gracefully.
- **Team with 50+ members**: Pagination or virtual scroll should work.

---

## 18. Notifications

### Description
Users receive in-app and email notifications for task assignments, completions, comments, and due date reminders.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 18.1 | Log in as User A (a Manager). Assign a task to User B (a Team Member). | User B receives an in-app notification (bell icon in header shows a badge with count). |
| 18.2 | Log in as User B. Click the **bell icon** in the header. | A notification dropdown opens showing: "User A assigned you to task: [Task Title]". |
| 18.3 | Click the notification. | Navigates to the task detail page (`/tasks/{id}`). The notification is marked as read. |
| 18.4 | Navigate to `/notifications`. | Full notifications list. The notification from step 18.1 appears (now marked as read). |
| 18.5 | **Mark as unread**: Toggle a read notification back to unread. | The badge count updates. |
| 18.6 | Click **"Mark All as Read"**. | All notifications are marked as read. The badge count disappears. |
| 18.7 | As User A, complete a task that was assigned to User B. | User B receives a "Task Completed" notification. |
| 18.8 | As User A, add a comment on a task assigned to User B. | User B receives a "Comment Added" notification. |
| 18.9 | As User A, set a due date on a task assigned to User B for tomorrow. | User B receives a "Due Date Reminder" notification at the configured reminder time. |
| 18.10 | As User B, go to `/settings` and disable "Due Date Reminder" notifications. | Due date reminders are no longer generated for User B. |
| 18.11 | Use the **filter** on the notifications page: "Unread Only". | Only unread notifications are displayed. |
| 18.12 | Check the `Notification` table in the database. | Records exist with correct `type` (TASK_ASSIGNED, TASK_COMPLETED, COMMENT_ADDED, DUE_DATE_REMINDER), `userId`, `actorId`, `readAt`, and `actionUrl`. |
| 18.13 | Log in as a user with no notifications. | Notifications page shows empty state: "No notifications yet." |

### Edge Cases
- **100+ notifications**: Pagination should work.
- **Real-time updates**: If WebSocket/polling is implemented, new notifications should appear without a page refresh.
- **Email delivery failure**: System should not crash; failure should be logged and the in-app notification still delivered.

---

## 19. Reports & Analytics

### Description
Manager and Administrator roles can view organization-wide reports with charts and data exports.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 19.1 | Log in as a **Manager** or **Administrator**. | Verify the "Reports" link is visible in the sidebar (Team Members should NOT see it). |
| 19.2 | Navigate to `/reports`. | Reports page loads. Charts render: **Tasks by Status** (bar chart), **Tasks by Priority** (pie chart), **Completion Trends** (line chart), **Overdue Tasks**, **Productivity Stats**. |
| 19.3 | Hover over chart elements. | Tooltips display accurate data (e.g., "In Progress: 12 tasks"). |
| 19.4 | Verify the **Overdue Tasks** section lists all overdue tasks across the organization. | Tasks are listed with title, assignee, due date, and days overdue. |
| 19.5 | Verify the **Productivity Stats** section. | Shows metrics: average completion time, tasks completed this week, completion rate. |
| 19.6 | If a CSV export button exists (Search for it — from the docs there is mention of CSV): Click **"Export CSV"** or **"Download Report"**. | A CSV file downloads containing report data. |
| 19.7 | Open the CSV in a spreadsheet application. | Data is well-structured (columns match report categories). |
| 19.8 | Log in as a **Team Member**. | "Reports" link is NOT visible in the sidebar. Navigating directly to `/reports` returns a 403, 404, or redirects to dashboard with an access denied message. |
| 19.9 | If the organization has **no tasks**, the reports page shows empty states for each chart. | "No data available" messages with guidance. |

### Edge Cases
- **Very large dataset**: Reports with hundreds of tasks should load within a few seconds.
- **Date range filter** (if available): Filtering by date should update all charts.
- **Chart rendering on mobile**: Charts should be responsive and scrollable if needed.

---

## 20. Admin — User Management

### Description
Administrators can manage users: view all, create new, deactivate/reactivate, search.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 20.1 | Log in as an **Administrator**. | "Admin" section is visible in the sidebar (with "Users" and "Organization" links). |
| 20.2 | Navigate to `/admin/users`. | User list displays all users in the organization. Shows: Name, Email (masked), Role, Status (Active/Deactivated), Last Login. |
| 20.3 | Use the **search bar** to search for a user by name or email. | Results filter in real-time. |
| 20.4 | Click **"Create User"**. | Form: First Name, Last Name, Email, Role (Administrator / Manager / Team Member), Temporary Password. |
| 20.5 | Fill the form and submit. | User is created. A success toast appears. The new user appears in the list. An invitation email is "sent". |
| 20.6 | **Deactivate a user**: Click the "Deactivate" button on an active user. | Confirm dialog. On confirm, the user's `deletedAt` is set (or `isActive = false`). User status changes to "Deactivated" in the list. |
| 20.7 | Attempt to log in with the deactivated user's credentials. | Error: "Your account has been deactivated. Please contact your administrator." |
| 20.8 | **Reactivate the user**: Click "Reactivate" (if available). | User is restored. They can log in again. |
| 20.9 | Log in as a **Manager** — attempt to access `/admin/users`. | Access denied. Manager should not see the Admin section at all. |
| 20.10 | Verify **emails are masked** in the list (e.g., `j***@example.com`). | Email masking is applied for privacy. |

### Edge Cases
- **Deactivate yourself**: Should be prevented or show a warning.
- **Create user with existing email**: Should be rejected with "Email already in use."
- **Deactivate the last Administrator**: Should be prevented (at least one admin must remain).

---

## 21. Admin — Organization Settings

### Description
Administrators can view organization details.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 21.1 | Navigate to `/admin/organization`. | Organization settings page loads: Organization Name, Slug, Subscription Tier, Timezone, Created Date. |
| 21.2 | Verify all displayed information is correct. | Matches the `Organization` record in the database. |
| 21.3 | If editable fields exist, change a value (e.g., organization name). | Changes are persisted. |
| 21.4 | Log in as a **non-Administrator** and try to navigate to `/admin/organization`. | Access denied. |

### Edge Cases
- **Changing organization name after users exist**: Should cascade correctly (users' `organizationId` still points to the same org, just renamed).

---

## 22. Role-Based Access Control (RBAC)

### Description
Three roles (Administrator, Manager, Team Member) with different permissions across the application.

### Test Steps

| Step | Action (Role: Team Member) | Expected Result |
|------|---------------------------|-----------------|
| 22.1 | Log in as a **Team Member**. | Sidebar shows: Dashboard, Tasks, Projects, Teams, Profile, Settings. **Does NOT** show: Reports, Admin. |
| 22.2 | Try to create a **new task** (`/tasks/new`). | Should be **denied** (depending on permission config — check `task:create` permission). The button or page should not be accessible. |
| 22.3 | Try to delete a task. | Delete button is not visible. |
| 22.4 | Try to create a **new project** (`/projects/new`). | Should be **denied**. |
| 22.5 | Try to navigate to `/reports`. | Redirected or shown "Access Denied". |
| 22.6 | Try to navigate to `/admin/users`. | Redirected or shown "Access Denied". |
| 22.7 | Edit a task **assigned to you** (your own task). | Should be **allowed** (Team Members can update their own tasks). |
| 22.8 | Edit a task **not assigned to you**. | Should be **denied** or read-only. |

| Step | Action (Role: Manager) | Expected Result |
|------|------------------------|-----------------|
| 22.9 | Log in as a **Manager**. | Sidebar shows: Dashboard, Tasks, Projects, Teams, Reports, Profile, Settings. Does NOT show: Admin. |
| 22.10 | Create a new task. | Should be **allowed**. |
| 22.11 | Create a new project. | Should be **allowed**. |
| 22.12 | Navigate to `/reports`. | Should be **allowed**. |
| 22.13 | Navigate to `/admin/users`. | Should be **denied**. |
| 22.14 | Delete a task. | Should be **denied** (check `task:delete` — Administrators only). |

| Step | Action (Role: Administrator) | Expected Result |
|------|------------------------------|-----------------|
| 22.15 | Log in as an **Administrator**. | Sidebar shows ALL links: Dashboard, Tasks, Projects, Teams, Reports, Notifications, Profile, Settings, Admin (Users, Organization). |
| 22.16 | Perform any action (create/delete tasks, projects, teams, manage users, view reports). | All actions should be **allowed**. |
| 22.17 | Verify Admin menu items work correctly. | Admin pages load without errors. |

### Permission Boundary Tests

| Step | Action | Expected Result |
|------|--------|-----------------|
| 22.18 | As a Team Member, call the API directly (e.g., `POST /api/v1/tasks`) with a forged request. | API returns `403 Forbidden`. Server-side permission checks must be enforced (not just UI hiding). |
| 22.19 | As a Manager, call `DELETE /api/v1/tasks/{id}` directly. | API returns `403 Forbidden`. |
| 22.20 | As a Team Member, try to access another user's data via API. | API returns `403` or filters results to only the user's own data. |

---

## 23. Empty States & Error Handling

### Description
The application should handle empty data, loading, and error conditions gracefully.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 23.1 | Log in as a user with **no projects**. Navigate to `/projects`. | Empty state: "No projects yet. Create your first project to get started." with a "Create Project" button. |
| 23.2 | Log in as a user with **no tasks**. Navigate to `/tasks`. | Empty state: "No tasks found." |
| 23.3 | Log in as a user with **no teams**. Navigate to `/teams`. | Empty state: "No teams yet." |
| 23.4 | Search for a task that doesn't exist (`/tasks?search=zzznotexistzzz`). | Empty state: "No tasks match your search criteria." Clear filters action. |
| 23.5 | Navigate to a **non-existent page** (e.g., `/this-page-does-not-exist`). | A custom 404 page is displayed (not the default browser error). |
| 23.6 | Navigate to a **non-existent task** (e.g., `/tasks/999999`). | 404 or "Task not found" page. |
| 23.7 | Navigate to a **non-existent project** (e.g., `/projects/999999`). | 404 or "Project not found" page. |
| 23.8 | **Kill the database connection** and refresh a page. | A loading state appears. Eventually an error state: "An error occurred. Please try again." or similar. NOT a stack trace or raw error. |
| 23.9 | Submit a form with **network disconnected**. | Appropriate error message: "Network error. Please check your connection." Form data is not lost (can retry). |
| 23.10 | Navigate to a route without being authenticated (e.g., `/dashboard` while logged out). | Redirected to `/auth/login`. After login, optionally redirected back to the original page. |

---

## 24. Logout & Session Expiry

### Description
Users can explicitly log out. Sessions should also expire after inactivity.

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 24.1 | While logged in, click **"Logout"** (in sidebar footer or user dropdown in header). | Session is deleted from the database. The `session_token` cookie is cleared. Redirected to `/auth/login`. |
| 24.2 | After logout, click the browser's **"Back"** button. | The dashboard page should not load (it should redirect to login). |
| 24.3 | Try to navigate directly to `/dashboard`. | Redirected to `/auth/login`. |
| 24.4 | Log in, then **manually delete the `session_token` cookie** from DevTools. Refresh the page. | User is logged out. Redirected to login. |
| 24.5 | Log in, then **wait for the session to expire** (default: 7 days of inactivity). Or modify the session's `expiresAt` in the database to be in the past. | On the next request, the session is detected as expired and deleted. User is redirected to login. |
| 24.6 | Check the database after logout. | The `Session` record is deleted (or `deletedAt` is set). |

### Edge Cases
- **Logout from multiple tabs**: Logging out in one tab should invalidate the session for all tabs (or at least on the next request).
- **Session hijacking**: If the `session_token` cookie is stolen, it should only be usable until the session expires. (In production, use HTTPS + Secure flag + short expiry.)

---

## 25. Full Regression Checklist

> Use this checklist for a quick sanity check before every release.

### Authentication & Session
- [ ] Landing page loads with all sections
- [ ] Registration with valid data creates user + organization
- [ ] Registration validation errors work (empty fields, invalid email, weak password, mismatched passwords)
- [ ] Duplicate email registration is rejected
- [ ] Email verification link works
- [ ] Expired/invalid verification link shows error
- [ ] Login with valid credentials creates session and cookie
- [ ] Login with invalid credentials shows generic error
- [ ] Login with deactivated user is rejected
- [ ] Password reset flow (request → email → reset → login with new password)
- [ ] Expired/invalid reset token shows error
- [ ] Logout clears session and cookie
- [ ] Session expiry redirects to login

### Navigation & Layout
- [ ] Sidebar shows correct links based on role
- [ ] Header shows notification bell, user info, theme toggle
- [ ] Mobile/responsive layout works (sidebar collapses, content stacks)
- [ ] Theme toggle switches light/dark/system correctly
- [ ] Theme preference persists across sessions

### Dashboard
- [ ] Stats cards show correct counts
- [ ] Clicking stat cards navigates to filtered task list
- [ ] Empty state for new users
- [ ] Charts render without errors
- [ ] Overdue tasks section loads

### Projects
- [ ] Project list loads with search and filter
- [ ] Create project with validation
- [ ] Project detail page with all tabs (Overview, Tasks, Timeline, Members)
- [ ] Edit project
- [ ] Delete project (soft-delete + confirm dialog)
- [ ] Visibility settings respected (Private/Internal/Public)

### Tasks
- [ ] Task list loads with all tasks
- [ ] Create task with all fields
- [ ] Create task with minimum fields (title only)
- [ ] Edit task (title, status, priority, assignees, dates)
- [ ] Delete task (soft-delete + confirm dialog)
- [ ] Task detail page shows all info, comments, attachments, activity
- [ ] Kanban board toggle (List/Board view)
- [ ] Drag-and-drop between Kanban columns
- [ ] Kanban changes persist on refresh
- [ ] Subtask creation and display
- [ ] Task dependencies (blocked by / blocking)
- [ ] Search tasks by keyword
- [ ] Filter tasks by status, priority, project, date
- [ ] Sort tasks (due date, priority, created date)
- [ ] Combined filters work correctly
- [ ] URL-synced filters persist on copy/paste

### Comments & Attachments
- [ ] Add comment on task
- [ ] Reply to comment (threaded)
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] Cannot edit/delete other user's comment
- [ ] Upload file attachment
- [ ] File size limit enforced
- [ ] File type validation enforced
- [ ] Download attachment
- [ ] @mention user in comment → notification sent

### Teams
- [ ] Team list loads
- [ ] Create team with members
- [ ] Team detail page shows members
- [ ] Edit team (add/remove members)
- [ ] Delete team (members unaffected)

### Time Tracking
- [ ] Log time entry on task
- [ ] Time entry appears in task detail

### Notifications
- [ ] In-app notification on task assignment
- [ ] In-app notification on task completion
- [ ] In-app notification on comment added
- [ ] Notification bell badge count
- [ ] Notification dropdown
- [ ] Notifications page with list
- [ ] Mark single notification read/unread
- [ ] Mark all notifications read
- [ ] Notification preferences in Settings (disable categories)
- [ ] Empty state when no notifications
- [ ] Filter notifications by read/unread

### Reports
- [ ] Reports page accessible to Manager and Admin only
- [ ] Charts render (Tasks by Status, by Priority, Completion Trends)
- [ ] Overdue tasks section
- [ ] Productivity stats
- [ ] CSV export (if implemented)

### Admin
- [ ] User list with search
- [ ] Create user
- [ ] Deactivate/reactivate user
- [ ] Emails masked in list
- [ ] Organization settings display
- [ ] Admin section hidden from non-Admin roles

### RBAC
- [ ] Team Member cannot create tasks
- [ ] Team Member cannot delete tasks
- [ ] Team Member cannot create projects
- [ ] Team Member cannot access Reports
- [ ] Team Member cannot access Admin
- [ ] Manager can create tasks and projects
- [ ] Manager cannot delete tasks
- [ ] Manager cannot access Admin
- [ ] Administrator has full access
- [ ] API-level permissions match UI-level permissions

### Error Handling
- [ ] Custom 404 page
- [ ] Empty states for all list pages
- [ ] Network error shows friendly message
- [ ] Form validation on all forms
- [ ] Server errors return appropriate status codes (not stack traces)

### Performance & Security
- [ ] Pages load in under 3 seconds
- [ ] CSRF protection is active (check for CSRF token)
- [ ] Rate limiting is active (rapid requests are throttled)
- [ ] XSS sanitization on user input
- [ ] Passwords stored as bcrypt hashes
- [ ] HTTP-only, Secure cookies for session

---

> **Note:** This guide covers the full scope of the Professional Task Manager as of the current codebase version. If new features are added (e.g., calendar sync, bulk operations, API tokens), corresponding test journeys should be appended.
