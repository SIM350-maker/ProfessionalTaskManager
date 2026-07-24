# Product Backlog

## Prioritization Framework

This backlog uses the **MoSCoW** prioritization method to enforce V1 scope discipline:
- **Must Have**: Required for V1 launch. Without these, the product is not viable.
- **Should Have**: Important for V1 but can be deferred to a follow-up sprint if time is limited.
- **Could Have**: Desirable but not necessary for V1. Post-V1 candidates.
- **Won't Have**: Explicitly out of scope for V1 per BRD Section 5.

Story points use the **Fibonacci sequence** (1, 2, 3, 5, 8, 13) for estimation.

---

## Epic Priority Order

| Epic | Name | MoSCoW | Rationale |
|------|------|--------|-----------|
| EPIC 1 | Authentication & Authorization | Must Have | Foundation for all other features; blocks everything |
| EPIC 8 | Administration | Must Have | Required for user onboarding and system management |
| EPIC 3 | Project Management | Must Have | Core organizing structure for tasks |
| EPIC 4 | Task Management | Must Have | Core value proposition of the application |
| EPIC 5 | Notifications | Must Have | Required for collaboration and user awareness |
| EPIC 2 | Dashboard | Must Have | Required for visibility and progress tracking |
| EPIC 7 | User Profile and Account | Must Have | Required for account management and security |
| EPIC 9 | Team Management | Should Have | Important for collaboration but can be added early in V1 |
| EPIC 6 | Reports & Analytics | Must Have | Required for business owner value and M4 milestone |

---

## Story List

### EPIC 1: Authentication & Authorization

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-001 | Register Account | 5 | — | Blocks all other stories |
| Must Have | US-002 | Log In | 3 | US-001 | Blocks all authenticated features |
| Must Have | US-003 | Reset Forgotten Password | 3 | US-002 | User recovery flow |
| Must Have | US-004 | Log Out | 1 | US-002 | Security requirement |

### EPIC 8: Administration

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-005 | Admin Creates User Account | 3 | US-002 | Onboarding without self-service |
| Must Have | US-006 | Admin Deactivates User | 2 | US-005 | Offboarding and security |
| Should Have | US-007 | User Updates Own Profile | 2 | US-002 | Low effort, user expectation |
| Should Have | US-008 | User Uploads Profile Picture | 2 | US-002 | UX enhancement |

### EPIC 3: Project Management

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-009 | Admin Creates Project | 3 | US-005 | Organizing structure |
| Must Have | US-010 | Admin Views Projects | 2 | US-009 | Project list view |
| Must Have | US-011 | Admin Edits Project | 2 | US-009 | Project maintenance |
| Must Have | US-012 | Admin Deletes Project | 2 | US-009 | Project removal; archives tasks |

### EPIC 4: Task Management

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-013 | Manager Creates Task | 5 | US-009 | Core workflow |
| Must Have | US-014 | Manager Assigns Task | 3 | US-013 | Requires assignee selection |
| Must Have | US-015 | Manager Sets Task Priority | 2 | US-013 | Part of task creation |
| Must Have | US-016 | Manager Sets Task Due Date | 2 | US-013 | Part of task creation |
| Must Have | US-017 | Manager Edits Task | 3 | US-013 | Includes concurrency conflict handling |
| Must Have | US-018 | Manager Archives Completed Task | 2 | US-019 | Requires completed status first |
| Must Have | US-019 | User Updates Task Status | 3 | US-014 | Core progress tracking |
| Must Have | US-020 | User Adds Task Comment | 2 | US-014 | Collaboration feature |
| Must Have | US-021 | User Uploads Attachment to Task | 3 | US-014 | Collaboration feature; size limits apply |
| Must Have | US-022 | Manager Monitors Task Progress | 3 | US-019 | Dashboard dependency |
| Must Have | US-023 | Manager Reassigns Task | 2 | US-014 | Work redistribution |
| Must Have | US-028 | Reopen Completed Task | 2 | US-019 | Exception handling; BR-008/009 |
| Should Have | US-024 | User Downloads Attachment | 2 | US-021 | Attachment lifecycle |
| Should Have | US-025 | User Deletes Own Attachment | 2 | US-021 | Attachment lifecycle |
| Should Have | US-026 | User Edits Own Comment | 2 | US-020 | Comment lifecycle |
| Should Have | US-027 | User Deletes Own Comment | 2 | US-020 | Comment lifecycle |
| Must Have | US-040 | Activity Timeline Displayed on Task | 2 | US-020 | Audit trail and history |

### EPIC 5: Notifications

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-029 | System Notifies on Task Assignment | 3 | US-014 | In-app and email; within 60 seconds |
| Must Have | US-030 | System Sends Due Date Reminders | 3 | US-016 | In-app and email; at due date threshold |
| Must Have | US-031 | System Notifies on Task Completion | 3 | US-019 | In-app and email; within 60 seconds |
| Should Have | US-032 | User Configures Notification Preferences | 2 | US-029 | Per-event opt-out |

### EPIC 2: Dashboard

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-033 | Dashboard Shows My Assigned Tasks | 3 | US-019 | Core dashboard view |
| Must Have | US-034 | Dashboard Shows My Overdue Tasks | 2 | US-016, US-019 | Requires due date and status |
| Must Have | US-035 | Dashboard Shows My Completed Tasks | 2 | US-019 | Last 30 days filter |
| Must Have | US-036 | Dashboard Shows My Productivity Stats | 3 | US-019 | Requires task history |
| Must Have | US-037 | Business Owner Views Business Productivity | 3 | US-036 | Org-wide aggregation |

### EPIC 7: User Profile and Account

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-038 | User Changes Password | 2 | US-002 | Requires current password verification |
| Must Have | US-039 | User Views Own Profile | 1 | US-002 | Basic profile view |

### EPIC 9: Team Management

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Should Have | US-043 | Admin Creates Team | 2 | US-005 | Group users for task assignment |
| Should Have | US-044 | Admin Views Teams | 2 | US-043 | Team list view |
| Should Have | US-045 | Admin Edits Team | 2 | US-043 | Team maintenance |
| Should Have | US-046 | Admin Deletes Team | 2 | US-043 | Team removal; preserves user accounts |
| Should Have | US-047 | Manager Adds Team Member | 2 | US-043 | Team membership management |
| Should Have | US-048 | Manager Removes Team Member | 2 | US-043 | Team membership management |

### EPIC 6: Reports & Analytics

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-049 | Manager Generates Basic Report | 3 | US-019 | Tasks by status, assignee, overdue |
| Must Have | US-050 | Manager Exports Report as CSV | 2 | US-049 | CSV export functionality |

### Search and Filtering

| Priority | Story ID | Feature | Points | Depends On | Notes |
|----------|----------|---------|--------|------------|-------|
| Must Have | US-041 | User Searches Tasks | 3 | US-019 | Case-insensitive; within 2 seconds |
| Must Have | US-042 | User Filters Tasks | 3 | US-019 | Combinable filters; result count |

---

## Dependency Map

The following critical dependencies must be respected in sprint planning:

```
US-001 (Register)
  └── US-002 (Login)
        ├── US-003 (Password Reset)
        ├── US-004 (Logout)
        ├── US-005 (Admin Create User)
        │     └── US-006 (Admin Deactivate User)
        ├── US-007 (Update Profile)
        ├── US-008 (Upload Profile Picture)
        ├── US-009 (Create Project)
        │     ├── US-010 (View Projects)
        │     ├── US-011 (Edit Project)
        │     └── US-012 (Delete Project)
        │           └── US-013 (Create Task)
        │                 ├── US-014 (Assign Task)
        │                 │     ├── US-019 (Update Status)
        │                 │     │     ├── US-018 (Archive Task)
        │                 │     │     ├── US-022 (Monitor Progress)
        │                 │     │     ├── US-023 (Reassign Task)
        │                 │     │     ├── US-028 (Reopen Task)
        │                 │     │     └── US-033 (Dashboard: My Tasks)
        │                 │     │           ├── US-034 (Dashboard: Overdue)
        │                 │     │           ├── US-035 (Dashboard: Completed)
        │                 │     │           └── US-036 (Dashboard: Stats)
        │                 │     │                 └── US-037 (Business Owner View)
        │                 │     ├── US-020 (Add Comment)
        │                 │     │     ├── US-026 (Edit Comment)
        │                 │     │     └── US-027 (Delete Comment)
        │                 │     ├── US-021 (Upload Attachment)
        │                 │     │     ├── US-024 (Download Attachment)
        │                 │     │     └── US-025 (Delete Attachment)
        │                 │     └── US-040 (Activity Timeline)
        │                 ├── US-015 (Set Priority)
        │                 ├── US-016 (Set Due Date)
        │                 │     └── US-030 (Due Date Reminders)
        │                 └── US-017 (Edit Task)
        ├── US-038 (Change Password)
        ├── US-039 (View Profile)
        ├── US-041 (Search Tasks)
        ├── US-042 (Filter Tasks)
        ├── US-029 (Task Assignment Notification)
        ├── US-031 (Task Completion Notification)
        ├── US-032 (Notification Preferences)
        ├── US-043 (Create Team)
        │     ├── US-044 (View Teams)
        │     ├── US-045 (Edit Team)
        │     ├── US-046 (Delete Team)
        │     ├── US-047 (Add Team Member)
        │     └── US-048 (Remove Team Member)
        └── US-049 (Generate Report)
              └── US-050 (Export CSV)
```

---

## Release Plan by Milestone

### M1: Foundation (2 weeks)
Target: Users can register, log in, and administrators can manage users and projects.

| Story ID | Feature | Points |
|----------|---------|--------|
| US-001 | Register Account | 5 |
| US-002 | Log In | 3 |
| US-003 | Reset Forgotten Password | 3 |
| US-004 | Log Out | 1 |
| US-005 | Admin Creates User Account | 3 |
| US-006 | Admin Deactivates User | 2 |
| US-007 | User Updates Own Profile | 2 |
| US-008 | User Uploads Profile Picture | 2 |
| US-009 | Admin Creates Project | 3 |
| US-010 | Admin Views Projects | 2 |
| US-038 | User Changes Password | 2 |
| US-039 | User Views Own Profile | 1 |

**M1 Total: 28 points**

### M2: Task Core (4 weeks)
Target: Managers can create, assign, and manage tasks. Team members can update task status.

| Story ID | Feature | Points |
|----------|---------|--------|
| US-011 | Admin Edits Project | 2 |
| US-012 | Admin Deletes Project | 2 |
| US-013 | Manager Creates Task | 5 |
| US-014 | Manager Assigns Task | 3 |
| US-015 | Manager Sets Task Priority | 2 |
| US-016 | Manager Sets Task Due Date | 2 |
| US-017 | Manager Edits Task | 3 |
| US-019 | User Updates Task Status | 3 |
| US-028 | Reopen Completed Task | 2 |

**M2 Total: 24 points**

### M3: Collaboration (3 weeks)
Target: Users can communicate via comments, attachments, and notifications.

| Story ID | Feature | Points |
|----------|---------|--------|
| US-018 | Manager Archives Completed Task | 2 |
| US-020 | User Adds Task Comment | 2 |
| US-021 | User Uploads Attachment to Task | 3 |
| US-023 | Manager Reassigns Task | 2 |
| US-029 | System Notifies on Task Assignment | 3 |
| US-030 | System Sends Due Date Reminders | 3 |
| US-031 | System Notifies on Task Completion | 3 |
| US-032 | User Configures Notification Preferences | 2 |
| US-040 | Activity Timeline Displayed on Task | 2 |
| US-024 | User Downloads Attachment | 2 |
| US-025 | User Deletes Own Attachment | 2 |
| US-026 | User Edits Own Comment | 2 |
| US-027 | User Deletes Own Comment | 2 |

**M3 Total: 30 points**

### M4: Dashboard & Reporting (2 weeks)
Target: Users can view dashboards, search, filter, and generate reports.

| Story ID | Feature | Points |
|----------|---------|--------|
| US-022 | Manager Monitors Task Progress | 3 |
| US-033 | Dashboard Shows My Assigned Tasks | 3 |
| US-034 | Dashboard Shows My Overdue Tasks | 2 |
| US-035 | Dashboard Shows My Completed Tasks | 2 |
| US-036 | Dashboard Shows My Productivity Stats | 3 |
| US-037 | Business Owner Views Business Productivity | 3 |
| US-041 | User Searches Tasks | 3 |
| US-042 | User Filters Tasks | 3 |
| US-043 | Admin Creates Team | 2 |
| US-044 | Admin Views Teams | 2 |
| US-045 | Admin Edits Team | 2 |
| US-046 | Admin Deletes Team | 2 |
| US-047 | Manager Adds Team Member | 2 |
| US-048 | Manager Removes Team Member | 2 |
| US-049 | Manager Generates Basic Report | 3 |
| US-050 | Manager Exports Report as CSV | 2 |

**M4 Total: 37 points**

### M5: Hardening & Launch (1 week)
Target: Security review, performance testing, bug fixes, and launch preparation.

| Story ID | Feature | Points |
|----------|---------|--------|
| — | Security hardening and NFR validation | 13 |
| — | Performance optimization and testing | 8 |
| — | Bug fixes and polish | 8 |
| — | Launch preparation and documentation | 5 |

**M5 Total: 34 points (estimated technical work)**

---

## Out of Scope for V1

The following features are explicitly excluded from V1 per BRD Section 5 and will be evaluated for future releases:

- AI task prioritization
- AI deadline prediction
- AI workload balancing
- Mobile application (native or responsive)
- Calendar integration
- Time tracking
- Workflow automation
- Third-party integrations (Slack, GitHub, etc.)

---

## Backlog Statistics

- **Total Stories:** 50
- **Must Have:** 39 stories
- **Should Have:** 11 stories
- **Could Have:** 0 stories
- **Won't Have:** 0 stories (explicitly excluded)
- **Total Story Points (Must Have):** 119 points
- **Total Story Points (Should Have):** 30 points
- **Total Story Points (V1):** 149 points
