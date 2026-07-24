# Software Requirements Specification (SRS)

## Project

Professional Task Manager

Version: 2.0

Prepared By:
Software Engineering Team

Status:
Draft for Engineering Review

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the Professional Task Manager application.

The purpose of this document is to provide a complete description of how the software should behave so that developers, testers, designers, architects, and stakeholders share a common understanding before implementation begins.

---

## 1.2 Scope

The Professional Task Manager is a cloud-based web application that enables organizations to create, assign, monitor, and complete work efficiently.

The application supports collaboration between managers and employees while improving visibility, accountability, and productivity.

---

# 2. User Roles

The system shall support the following user roles.

## Administrator

Responsibilities

- Manage organizations
- Manage users
- Configure system settings
- View reports
- Manage permissions

---

## Manager

Responsibilities

- Create projects
- Create tasks
- Assign tasks
- Monitor progress
- Generate reports

---

## Team Member

Responsibilities

- View assigned tasks
- Update task status
- Add comments
- Upload attachments
- Receive notifications

## 2.1 Permission Matrix

The following matrix defines CRUD permissions for each role.

| Action | Administrator | Manager | Team Member |
|---|---|---|---|
| Create project | Yes | Yes | No |
| Create task | Yes | Yes | No |
| Assign task | Yes | Yes | No |
| Update task status | Yes | Yes | Yes (own tasks) |
| Edit task | Yes | Yes | No |
| Archive task | Yes | Yes | No |
| Delete task | Yes | No | No |
| View all tasks | Yes | Yes | No |
| View assigned tasks | Yes | Yes | Yes |
| Create user | Yes | No | No |
| Deactivate user | Yes | No | No |
| View reports | Yes | Yes | No |
| Configure settings | Yes | No | No |
| Manage permissions | Yes | No | No |

Only Managers and Administrators may assign tasks (BR-005). Team Members may update task status only on tasks assigned to them.

---
# 3. Functional Requirements

## Authentication

FR-001

The system shall allow users to register via self-service sign-up. Required fields: full name, email address, password, and organization name. The system shall send an email verification link before the account is activated.

FR-002

The system shall allow users to log in securely.

FR-003

The system shall allow users to reset forgotten passwords.

FR-004

The system shall allow users to log out.

---

## User Management

FR-005

Administrators shall create user accounts on behalf of users. Administrators shall assign a temporary password and send an invitation email. The invited user shall set their password on first login.

FR-006

Administrators shall deactivate users.

FR-007

Users shall update their profiles.

FR-008

Users shall upload profile pictures.

---

## Task Management

FR-009

Managers shall create tasks.

FR-010

Managers shall assign tasks.

FR-011

Managers shall define priorities.

FR-012

Managers shall set due dates.

FR-013

Managers shall edit tasks.

FR-014

Managers shall archive completed tasks.

---

## Task Progress

FR-015

Users shall update task status.

FR-016

Users shall add task comments.

FR-017

Users shall upload attachments.

FR-018

Managers shall monitor task progress.

---

## Notifications

FR-019

The system shall notify users when tasks are assigned.

FR-020

The system shall remind users before due dates.

FR-021

The system shall notify managers when tasks is completed.

## Notification Specifications

| ID | Notification | Trigger | Recipients | Channel | Latency |
|---|---|---|---|---|---|
| FR-019 | Task Assigned | Manager assigns task to one or more users | All assigned users | In-app, Email | Within 60 seconds |
| FR-020 | Due Date Reminder | Task due date is within 24 hours and status is not Completed | Assigned user | In-app, Email | At due date threshold |
| FR-021 | Task Completed | Task status changes to Completed | Task creator, all assigned managers | In-app, Email | Within 60 seconds |

Users may configure notification preferences per event type. The system shall respect user opt-out settings.

---

## Dashboard

FR-022

The dashboard shall display tasks assigned to the current user.

FR-023

The dashboard shall display tasks assigned to the current user whose due date has passed and status is not Completed.

FR-024

The dashboard shall display tasks assigned to the current user whose status is Completed, limited to the most recent 30 days.

FR-025

The dashboard shall display productivity statistics for the current user, including tasks completed this week, tasks overdue, and average task completion time.

---

## User Profile and Account

FR-026

Users shall change their password from account settings. The system shall require the current password for verification and enforce a minimum password length of 8 characters.

FR-027

Users shall view their own profile information, including name, email, role, and profile picture.

---

## Attachment Management

FR-028

Users shall download attachments from tasks they can access.

FR-029

Users shall delete attachments they have uploaded from tasks they can access. Deleting an attachment shall be permanent and shall be logged in the audit trail.

---

## Comment Management

FR-030

Users shall edit their own comments on tasks. The system shall record the edit timestamp and preserve the original comment in the audit trail.

FR-031

Users shall delete their own comments on tasks. The system shall mark the comment as deleted and preserve the content in the audit trail.

---

## Task Reassignment

FR-032

Managers and Administrators shall reassign tasks to different users. The system shall notify the newly assigned user and remove the task from the previous assignee's dashboard.

---

## Project Management

FR-033

Administrators shall create, view, edit, and delete projects. Each project shall have a name and description. Deleting a project shall archive all associated tasks and prevent new task creation within the project.

---

## Search and Filtering

FR-034

Users shall search tasks by title, description, assignee name, and status. Search shall be case-insensitive and shall return results within 2 seconds.

FR-035

Users shall filter task lists by status, priority, assignee, due date range, and project. Multiple filters shall be combinable. The system shall display the number of results matching the current filter set.

---

## Activity Timeline

FR-036

The system shall display an activity timeline on each task showing status changes, comments, and assignments in chronological order. The timeline shall include the actor, timestamp, and description of each event.

---

## Team Management

FR-037

Administrators shall create, view, edit, and delete teams. Each team shall have a name and a set of members. Managers shall add and remove team members. Removing a user from a team shall not delete the user's account or their task history.

---

## Reporting

FR-038

Managers shall generate basic reports showing tasks by status, tasks by assignee, and overdue tasks. Reports shall be viewable in the browser and exportable as CSV.

---

# 4. Non-Functional Requirements

## Performance

NFR-001

Pages shall load within 2 seconds at the p95 percentile under normal operating conditions (simulated 3G network, 100 concurrent users).

---

## Availability

NFR-002

The system shall achieve at least 99.5% monthly uptime, excluding planned maintenance windows communicated at least 48 hours in advance.

---

## Security

NFR-003

Passwords shall be hashed using Argon2id with a minimum memory cost of 64 MB, time cost of 2 iterations, and parallelism of 2. Each password hash shall use a unique salt.

NFR-004

Communication shall use HTTPS.

NFR-005

Role-based authorization shall enforce the permission matrix defined in Section 2.1. Every API endpoint and UI route shall validate the current user's role before granting access.

---

## Scalability

NFR-006

The application shall support future horizontal scaling.

---

## Reliability

NFR-007

The application shall retry failed database and external API calls up to 3 times with exponential backoff (1s, 2s, 4s). After 3 failures, the system shall surface an error message to the user and log the failure.

---

## Usability

NFR-008

90% of first-time users shall complete task creation without assistance in under 5 minutes, measured via usability testing with at least 5 participants.

---

## Maintainability

NFR-009

The codebase shall be organized into controllers, services, and repositories. Each module shall have an interface definition. Cyclomatic complexity shall not exceed 10 per function. A CONTRIBUTING.md document shall define coding standards.

---

## Data Validation

NFR-010

The system shall validate all user input server-side. Required fields shall be rejected if missing. String fields shall enforce maximum length limits. Email fields shall match RFC 5322 format. Password fields shall enforce a minimum length of 8 characters and shall be checked against a minimum-strength policy.

---

## Concurrency

NFR-011

The system shall handle concurrent edits using optimistic locking. Each task record shall include a version number. When a user saves edits, the system shall compare the submitted version with the current version. If they differ, the system shall return a 409 Conflict response and present both versions to the user for manual resolution.

---

## Accessibility

NFR-012

The user interface shall conform to WCAG 2.1 Level AA standards. All interactive elements shall be keyboard navigable. Color contrast shall meet a minimum ratio of 4.5:1 for normal text and 3:1 for large text.

---

# 5. Business Rules

BR-001

Every task must belong to one project.

BR-002

Every task must have exactly one creator.

BR-003

Every task may be assigned to one or more users.

BR-004

Completed tasks cannot be edited unless reopened.

BR-005

Only managers and administrators may assign tasks.

BR-006

Valid task status values are: Not Started, In Progress, Blocked, Completed.

BR-007

Valid priority values are: Low, Medium, High, Urgent.

BR-008

Task status may transition from any state to Blocked or Completed. From Blocked, it may transition to In Progress. From Completed, it may only transition to In Progress if reopened by a Manager or Administrator.

BR-009

Only the task creator, a Manager, or an Administrator may reopen a completed task.

---

# 6. Constraints

The system shall:

- Operate as a web application.
- Support modern browsers (latest two stable versions of Chrome, Firefox, Safari, and Edge).
- Optimize the user interface for desktop viewports ≥ 1024px width. Mobile optimization is deferred to a future release.
- Store data securely using encryption at rest and in transit.
- Maintain audit logs for all create, update, and delete operations. Logs shall be immutable and retained for a minimum of 90 days.
- Validate all user input server-side to prevent injection attacks.
- Enforce a maximum file upload size of 10 MB per file and 50 MB per task. Allowed file types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, GIF, TXT.
- Use optimistic locking with version numbers to handle concurrent task edits. If a conflict is detected, the system shall present both versions and allow the user to resolve the conflict.

---

# 7. Assumptions

- Users have internet connectivity.
- Users possess basic computer literacy.
- Organizations have defined managers and team members.

---

# 8. Future Enhancements

Future releases may include:

- AI task prioritization
- AI deadline prediction
- AI workload balancing
- Calendar integration
- Mobile applications
- Third-party integrations

---

# 9. Acceptance Criteria

The software shall be accepted when the following criteria are met:

## Functional Acceptance
- All functional requirements (FR-001 through FR-038) pass acceptance testing.
- All critical defects (severity 1 and 2) are resolved.
- All BRD-scoped features (Search, Filters, Activity Timeline, Team Management, Basic Reporting) have corresponding test cases and pass.

## Security Acceptance
- Password hashing uses Argon2id with the parameters defined in NFR-003.
- All API endpoints enforce role-based authorization per the permission matrix in Section 2.1.
- Input validation prevents SQL injection, XSS, and CSRF attacks.
- Security scan yields zero critical vulnerabilities (CVSS ≥ 7.0).

## Performance Acceptance
- Page load time is ≤ 2 seconds at p95 under normal operating conditions (NFR-001).
- System uptime is ≥ 99.5% during a 30-day measurement period (NFR-002).
- Search returns results within 2 seconds (FR-034).

## Usability Acceptance
- 90% of first-time users complete task creation without assistance in under 5 minutes (NFR-008).
- The interface conforms to WCAG 2.1 Level AA (NFR-012).

## Code Quality Acceptance
- The codebase passes a maintainability review with modular architecture, documented coding standards, and test coverage ≥ 70% (NFR-009).
- Cyclomatic complexity does not exceed 10 per function.

## Stakeholder Acceptance
- Stakeholders approve Version 1 functionality as defined in the BRD.