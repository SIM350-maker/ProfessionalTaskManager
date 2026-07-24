# Product Epics

## Epic 1: Authentication & Authorization

**Priority:** Must Have  
**Milestone:** M1: Foundation  
**Business Value:** Enables all other functionality by providing secure access control. Without authentication, no user can access the system.  
**Scope:** User registration, login, logout, password reset, and email verification.  
**Out of Scope:** SSO, OAuth, multi-factor authentication (post-V1).  
**Stories:** US-001, US-002, US-003, US-004

---

## Epic 2: Dashboard

**Priority:** Must Have  
**Milestone:** M4: Dashboard & Reporting  
**Business Value:** Provides users with immediate visibility into their work and business health. The dashboard is the primary interface for daily use.  
**Scope:** Personal task views, overdue tasks, completed tasks, productivity statistics, and business-owner org-wide analytics.  
**Out of Scope:** Customizable dashboard layouts, widgets (post-V1).  
**Stories:** US-033, US-034, US-035, US-036, US-037

---

## Epic 3: Project Management

**Priority:** Must Have  
**Milestone:** M1-M2  
**Business Value:** Organizes work into logical containers. Projects enable managers to group related tasks and provide context for team members.  
**Scope:** Create, view, edit, and delete projects. Each project has a name and description.  
**Out of Scope:** Project templates, project settings beyond name/description (post-V1).  
**Stories:** US-009, US-010, US-011, US-012

---

## Epic 4: Task Management

**Priority:** Must Have  
**Milestone:** M2-M3  
**Business Value:** Core value proposition of the application. Enables managers to create, assign, and track work, and team members to update progress.  
**Scope:** Task CRUD, assignment, priorities, due dates, status updates, comments, attachments, activity timeline, search, filtering, task reassignment, and reopening completed tasks.  
**Out of Scope:** Subtasks, task dependencies, time tracking (post-V1).  
**Stories:** US-013, US-014, US-015, US-016, US-017, US-018, US-019, US-020, US-021, US-022, US-023, US-024, US-025, US-026, US-027, US-028, US-040, US-041, US-042

---

## Epic 5: Notifications

**Priority:** Must Have  
**Milestone:** M3: Collaboration  
**Business Value:** Keeps users informed of relevant events without requiring them to actively check the system. Reduces communication overhead.  
**Scope:** In-app and email notifications for task assignment, due date reminders, and task completion. User-configurable notification preferences.  
**Out of Scope:** Push notifications, SMS, in-app notification center advanced features (post-V1).  
**Stories:** US-029, US-030, US-031, US-032

---

## Epic 6: Reports & Analytics

**Priority:** Must Have  
**Milestone:** M4: Dashboard & Reporting  
**Business Value:** Provides managers and business owners with insights into team performance, overdue tasks, and project health. Supports data-driven decision making.  
**Scope:** Basic reports showing tasks by status, tasks by assignee, and overdue tasks. Viewable in browser and exportable as CSV.  
**Out of Scope:** Advanced analytics, custom report builder, scheduled reports (post-V1).  
**Stories:** US-049, US-050

---

## Epic 7: User Profile and Account

**Priority:** Must Have  
**Milestone:** M1: Foundation  
**Business Value:** Enables users to manage their account security and personal information. Required for trust and compliance.  
**Scope:** View profile, update profile, change password, upload profile picture.  
**Out of Scope:** Profile customization, social links, bio (post-V1).  
**Stories:** US-038, US-039, US-007, US-008

---

## Epic 8: Administration

**Priority:** Must Have  
**Milestone:** M1: Foundation  
**Business Value:** Enables system configuration, user management, and project management by administrators. Required for multi-user operation.  
**Scope:** Create users, deactivate users, create projects, edit projects, delete projects.  
**Out of Scope:** Advanced permissions, roles beyond Administrator/Manager/Team Member, organization-level settings (post-V1).  
**Stories:** US-005, US-006, US-009, US-010, US-011, US-012

---

## Epic 9: Team Management

**Priority:** Should Have  
**Milestone:** M4: Dashboard & Reporting  
**Business Value:** Enables grouping of users for easier task assignment and management. Supports team-based reporting and collaboration.  
**Scope:** Create, view, edit, and delete teams. Add and remove team members. Removing a user from a team does not delete their account or task history.  
**Out of Scope:** Team roles, team permissions, team-level settings (post-V1).  
**Stories:** US-043, US-044, US-045, US-046, US-047, US-048

---

## Epic Coverage Map

| Epic | V1 MoSCoW | Stories | FRs Covered |
|------|-----------|---------|-------------|
| EPIC 1: Authentication & Authorization | Must Have | 4 | FR-001, FR-002, FR-003, FR-004 |
| EPIC 2: Dashboard | Must Have | 5 | FR-022, FR-023, FR-024, FR-025 |
| EPIC 3: Project Management | Must Have | 4 | FR-033 |
| EPIC 4: Task Management | Must Have | 18 | FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-032, FR-028, FR-029, FR-030, FR-031, BR-008, BR-009, FR-036 |
| EPIC 5: Notifications | Must Have | 4 | FR-019, FR-020, FR-021 |
| EPIC 6: Reports & Analytics | Must Have | 2 | FR-038 |
| EPIC 7: User Profile and Account | Must Have | 4 | FR-026, FR-007, FR-008, FR-027 |
| EPIC 8: Administration | Must Have | 6 | FR-005, FR-006, FR-033 |
| EPIC 9: Team Management | Should Have | 6 | FR-037 |
