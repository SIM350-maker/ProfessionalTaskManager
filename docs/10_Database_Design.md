# Database Design

## Project

Professional Task Manager

Version: 2.0

---

# Database Philosophy

The database should:

- Store data accurately.
- Prevent duplication.
- Maintain integrity.
- Support future growth.
- Be easy to query.
- Be secure.
- Support auditing.

The system uses PostgreSQL as the relational database management system.

Prisma ORM will manage schema migrations and data access.


# Business Entities

The system contains the following core entities.

1. User
2. Organization
3. Team
4. Project
5. Task
6. Comment
7. Attachment
8. Notification
9. Activity Log
10. Role
11. Permission
12. UserTeam
13. ProjectMember
14. TaskAssignee
15. RolePermission
16. Label
17. TaskLabel
18. TimeEntry
19. TaskDependency
20. UserPreferences
21. Session


# Entity Relationships

Organization

1 → Many Teams
1 → Many Users
1 → Many Projects
1 → Many Roles

Team

1 → Many Users (via UserTeam)
1 → Many Projects (optional)

User

1 → Many Projects (as owner)
1 → Many Tasks (as creator)
1 → Many Comments
1 → Many Attachments
1 → Many Notifications
1 → Many Activity Logs
1 → Many TimeEntries
1 → Many UserPreferences
1 → Many Sessions

Project

1 → Many Tasks
1 → Many Comments (optional)
1 → Many Attachments (optional)
1 → Many Notifications (optional)
Many ← Many Users (via ProjectMember)

Task

1 → Many Comments
1 → Many Attachments
1 → Many Notifications
1 → Many TimeEntries
1 → Many TaskDependencies
Many ← Many Users (via TaskAssignee)
Many ← Many Labels (via TaskLabel)

Comment

1 → Many Comments (threaded, via parentCommentId)
1 → Many Attachments (optional)

Role

Many ← Many Users (via UserTeam / ProjectMember)
Many ← Many Permissions (via RolePermission)

Permission

Many ← Many Roles (via RolePermission)

UserTeam

Many ← Many Users
1 → Many Teams

ProjectMember

Many ← Many Users
1 → Many Projects

TaskAssignee

Many ← Many Users
1 → Many Tasks

RolePermission

Many ← Many Roles
Many ← Many Permissions

Label

1 → Many TaskLabels

TaskLabel

Many ← Many Labels
1 → Many Tasks

TimeEntry

1 → Many Users
1 → Many Tasks

TaskDependency

1 → Many Tasks (as predecessor)
1 → Many Tasks (as successor)


# User Table

Fields

- id
- firstName
- lastName
- email
- emailVerifiedAt
- emailVerificationToken
- passwordHash
- passwordResetToken
- passwordResetExpires
- profileImage
- timezone
- jobTitle
- department
- avatarUrl
- isActive
- lastLoginAt
- organizationId
- createdAt
- updatedAt
- deletedAt


# Organization Table

Fields

- id
- name
- slug
- logo
- website
- subscriptionTier
- defaultTimezone
- dateFormat
- weekStart
- settings (JSONB)
- isActive
- createdBy
- createdAt
- updatedAt
- deletedAt


# Team Table

Fields

- id
- name
- description
- organizationId
- createdBy
- isActive
- createdAt
- updatedAt
- deletedAt


# Project Table

Fields

- id
- name
- description
- status
- visibility
- color
- startDate
- endDate
- isArchived
- ownerId
- organizationId
- createdBy
- updatedBy
- createdAt
- updatedAt
- deletedAt


# Task Table

Fields

- id
- title
- description
- status
- priority
- dueDate
- startDate
- order
- parentTaskId
- estimatedHours
- actualHours
- customFields (JSONB)
- projectId
- assignedBy
- createdBy
- updatedBy
- completedAt
- createdAt
- updatedAt
- deletedAt


# Comment Table

Fields

- id
- message
- mentions (JSONB array of user IDs)
- isEdited
- parentCommentId
- taskId
- authorId
- createdAt
- updatedAt
- deletedAt


# Attachment Table

Fields

- id
- filename
- originalName
- mimeType
- size
- url
- virusScanStatus
- taskId
- commentId
- uploadedBy
- createdAt
- updatedAt
- deletedAt


# Notification Table

Fields

- id
- type
- title
- message
- isRead
- entityType
- entityId
- actorId
- actionUrl
- userId
- createdAt
- updatedAt
- deletedAt


# Activity Log Table

Fields

- id
- userId
- action
- entityType
- entityId
- changes (JSONB)
- ipAddress
- userAgent
- organizationId
- createdAt


# Role Table

Fields

- id
- name
- description
- organizationId
- isSystem
- createdAt
- updatedAt
- deletedAt


# Permission Table

Fields

- id
- name
- description
- resource
- action
- createdAt
- updatedAt


# UserTeam Table

Fields

- id
- userId
- teamId
- organizationId
- createdAt
- updatedAt


# ProjectMember Table

Fields

- id
- userId
- projectId
- roleId
- organizationId
- createdAt
- updatedAt


# TaskAssignee Table

Fields

- id
- userId
- taskId
- assignedBy
- organizationId
- createdAt
- updatedAt


# RolePermission Table

Fields

- id
- roleId
- permissionId
- createdAt
- updatedAt


# Label Table

Fields

- id
- name
- color
- organizationId
- createdAt
- updatedAt
- deletedAt


# TaskLabel Table

Fields

- id
- taskId
- labelId
- organizationId
- createdAt
- updatedAt


# TimeEntry Table

Fields

- id
- taskId
- userId
- startTime
- endTime
- description
- organizationId
- createdAt
- updatedAt


# TaskDependency Table

Fields

- id
- predecessorTaskId
- successorTaskId
- organizationId
- createdAt
- updatedAt


# UserPreferences Table

Fields

- id
- userId
- notificationEmailEnabled
- notificationInAppEnabled
- theme
- language
- createdAt
- updatedAt


# Session Table

The Session table manages user authentication sessions server-side.

Fields

- id (PRIMARY KEY, CUID)
- userId (FOREIGN KEY → User.id, NOT NULL)
- token (UNIQUE, NOT NULL) — cryptographically random UUID v4
- expiresAt (TIMESTAMP, NOT NULL) — default 7 days from creation
- lastUsedAt (TIMESTAMP, NOT NULL) — updated on each validated request
- createdAt (TIMESTAMP, NOT NULL)
- ipAddress (VARCHAR, NULLABLE) — stored for audit
- userAgent (VARCHAR, NULLABLE) — stored for audit

Key Design Decisions

- Sessions use httpOnly, Secure, SameSite cookies for transport — never accessible to client-side JavaScript
- Session token is generated via `crypto.randomUUID()` (128 bits of entropy)
- On logout, the session is deleted from the database
- On password change, all user sessions are revoked
- Expired sessions are lazily cleaned up on validation
- "Remember me" extends expiry to 30 days


# Database Indexes

Indexed Fields

- User(email)
- User(organizationId)
- Task(projectId, status, dueDate)
- Task(assignedUserId, status, dueDate)
- Task(organizationId, projectId, status, dueDate)
- Task(parentTaskId)
- Task(createdAt)
- Task.status (GIN for full-text search via tsvector)
- Notification(userId, isRead, createdAt)
- ActivityLog(organizationId, entityType, entityId, createdAt)
- ActivityLog(userId, createdAt)
- Comment(taskId, createdAt)
- Attachment(taskId)
- TimeEntry(taskId, userId)
- TaskDependency(predecessorTaskId, successorTaskId)


# Database Constraints

Foreign Key Constraints

- User.organizationId → Organization.id
- Team.organizationId → Organization.id
- Project.organizationId → Organization.id
- Project.ownerId → User.id
- Task.projectId → Project.id
- Task.parentTaskId → Task.id
- Comment.taskId → Task.id
- Comment.parentCommentId → Comment.id
- Comment.authorId → User.id
- Attachment.taskId → Task.id
- Attachment.commentId → Comment.id
- Attachment.uploadedBy → User.id
- Notification.userId → User.id
- Notification.actorId → User.id
- ActivityLog.userId → User.id
- ActivityLog.organizationId → Organization.id
- Role.organizationId → Organization.id
- UserTeam.userId → User.id
- UserTeam.teamId → Team.id
- UserTeam.organizationId → Organization.id
- ProjectMember.userId → User.id
- ProjectMember.projectId → Project.id
- ProjectMember.roleId → Role.id
- ProjectMember.organizationId → Organization.id
- TaskAssignee.userId → User.id
- TaskAssignee.taskId → Task.id
- TaskAssignee.assignedBy → User.id
- TaskAssignee.organizationId → Organization.id
- TaskLabel.taskId → Task.id
- TaskLabel.labelId → Label.id
- TaskLabel.organizationId → Organization.id
- TimeEntry.taskId → Task.id
- TimeEntry.userId → User.id
- TimeEntry.organizationId → Organization.id
- TaskDependency.predecessorTaskId → Task.id
- TaskDependency.successorTaskId → Task.id
- TaskDependency.organizationId → Organization.id
- UserPreferences.userId → User.id
- Session.userId → User.id

Unique Constraints

- User(email) — unique per organization or globally
- Organization.slug — unique
- UserTeam(userId, teamId) — composite unique
- ProjectMember(userId, projectId) — composite unique
- TaskAssignee(userId, taskId) — composite unique
- RolePermission(roleId, permissionId) — composite unique
- TaskLabel(taskId, labelId) — composite unique
- TaskDependency(predecessorTaskId, successorTaskId) — composite unique
- Session.token — unique

Check Constraints

- Task.priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
- Task.status IN valid workflow states
- Project.status IN valid workflow states
- Notification.isRead BOOLEAN
- User.isActive BOOLEAN
- Organization.isActive BOOLEAN
- Team.isActive BOOLEAN
- Role.isActive BOOLEAN
- Attachment.virusScanStatus IN ('PENDING', 'CLEAN', 'INFECTED', 'ERROR')


# Soft Deletes

Soft deletes are implemented via `deletedAt` timestamp on:

- User
- Organization
- Team
- Project
- Task
- Comment
- Attachment
- Notification
- Role
- Label

Activity Log does not support soft deletes. It is append-only.


# Row-Level Security (RLS)

Row-level security is enabled in PostgreSQL on all tenant tables.

Tenant tables:

- User
- Team
- Project
- Task
- Comment
- Attachment
- Notification
- ActivityLog
- Role
- UserTeam
- ProjectMember
- TaskAssignee
- TaskLabel
- TimeEntry
- TaskDependency
- Label

RLS policies restrict rows to `organizationId = current_setting('app.current_organization_id')`.

All queries must filter by `organizationId` at the data access layer.


# Optimistic Locking

Optimistic locking is implemented via `version` integer column on:

- User
- Organization
- Project
- Task

Version is incremented on each update. Concurrent updates are rejected if version does not match.


# Immutable Activity Log

ActivityLog is append-only.

Database-level enforcement via PostgreSQL RULE or trigger prevents UPDATE and DELETE operations.


# Full-Text Search

PostgreSQL full-text search is enabled on Task.

A generated `tsvector` column indexes:

- Task.title
- Task.description

A GIN index supports fast full-text queries.


# JSONB Fields

JSONB is used for flexible, schema-less data:

- Organization.settings — tenant configuration
- ActivityLog.changes — diff of changed fields
- Task.customFields — task-specific extensions


# Partitioning (Future)

Partitioning by `createdAt` is planned for large-scale tables:

- ActivityLog — monthly partitions
- Notification — monthly partitions

Partitioning is not required for v1 but is documented for future scaling.


# Database Authentication and Authorization

Authentication is handled by Clerk.

Authorization is enforced at the service and repository layers via a centralized policy engine.

The database enforces multi-tenancy through RLS and `organizationId` scoping.


# Database Backup and Recovery

Automated backups are configured with a retention period appropriate to the subscription tier.

Point-in-time recovery (PITR) is enabled for production.


# Audit Retention

ActivityLog entries are retained for a minimum of 90 days.

Archival to cold storage is planned for entries older than 90 days.


# Connection Pooling

Database connection pooling (e.g., PgBouncer) is configured for horizontal scaling.

The schema is designed to perform well under pooled connections.
