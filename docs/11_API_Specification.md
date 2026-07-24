# API Specification

## Project

Professional Task Manager

Version: 1.0

---

# API Style

The application exposes RESTful APIs using JSON.

All endpoints:

- Use HTTPS.
- Return JSON responses.
- Require authentication unless explicitly public.
- Follow consistent naming conventions.

---

# API Versioning

## Base URL

/api/v1

## Versioning Strategy

The API uses URL-based versioning. The version prefix is part of the URL path (`/api/v1`).

## Breaking vs. Non-Breaking Changes

- **Non-breaking (minor):** Adding new optional request fields, adding new endpoints, adding new response fields, adding new enum values.
- **Breaking (major):** Removing or renaming endpoints, removing or renaming request/response fields, changing field types, changing required fields, changing status code semantics, changing authentication requirements.

## Deprecation Policy

- Deprecated endpoints are marked with a `Sunset` response header containing the deprecation date.
- Minimum deprecation notice period: 6 months.
- Deprecation is announced via API changelog, developer portal, and email notifications to registered API consumers.
- Deprecated endpoints remain functional but may receive only critical security fixes.

## Backward Compatibility

- v1 endpoints remain operational for a minimum of 12 months after v2 launch.
- Bug fixes are applied to v1 during the deprecation window.
- No new features are added to deprecated versions.

---

# Authentication API

## POST /api/v1/auth/register

Create a new user account.

**Authorization:** Public

**Request Body:**

```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 characters)",
  "firstName": "string (required, max 100 characters)",
  "lastName": "string (required, max 100 characters)",
  "organizationId": "string (optional, UUID)"
}
```

**Responses:**

- `201 Created` — User registered successfully
  ```json
  {
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "organizationId": "uuid",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
  ```
  Headers: `Location: /api/v1/auth/me`

- `422 Unprocessable Entity` — Validation error
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input",
      "errors": [
        { "field": "email", "message": "Email is required" },
        { "field": "password", "message": "Password must be at least 8 characters" }
      ]
    },
    "traceId": "abc123"
  }
  ```

- `409 Conflict` — Email already exists
  ```json
  {
    "success": false,
    "error": {
      "code": "EMAIL_ALREADY_EXISTS",
      "message": "An account with this email already exists"
    },
    "traceId": "abc123"
  }
  ```

---

## POST /api/v1/auth/login

Authenticate a user.

**Authorization:** Public

**Request Body:**

```json
{
  "email": "string (required, email format)",
  "password": "string (required)"
}
```

**Responses:**

- `200 OK` — Authentication successful
  ```json
  {
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "organizationId": "uuid",
        "lastLoginAt": "2025-01-01T00:00:00Z"
      },
      "token": "string (JWT or session token)"
    }
  }
  ```

- `401 Unauthorized` — Invalid credentials
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "Email or password is incorrect"
    },
    "traceId": "abc123"
  }
  ```

- `422 Unprocessable Entity` — Validation error

---

## POST /api/v1/auth/logout

Terminate the current session.

**Authorization:** Authenticated user

**Request Body:** None

**Responses:**

- `204 No Content` — Logout successful
- `401 Unauthorized` — Not authenticated

---

## POST /api/v1/auth/reset-password

Initiate password reset.

**Authorization:** Public

**Request Body:**

```json
{
  "email": "string (required, email format)"
}
```

**Responses:**

- `204 No Content` — Reset email sent (always returns 204 to prevent email enumeration)
- `422 Unprocessable Entity` — Validation error

---

## POST /api/v1/auth/reset-password/confirm

Complete password reset with token.

**Authorization:** Public

**Request Body:**

```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 8 characters)"
}
```

**Responses:**

- `204 No Content` — Password reset successful
- `401 Unauthorized` — Invalid or expired token
- `422 Unprocessable Entity` — Validation error

---

## GET /api/v1/auth/me

Return the currently authenticated user.

**Authorization:** Authenticated user

**Responses:**

- `200 OK`
  ```json
  {
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "organizationId": "uuid",
      "timezone": "string",
      "jobTitle": "string",
      "department": "string",
      "avatarUrl": "string",
      "isActive": true,
      "lastLoginAt": "2025-01-01T00:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
  ```
  Note: Sensitive fields (`passwordHash`, `emailVerificationToken`, `passwordResetToken`, `passwordResetExpires`) are never returned.

- `401 Unauthorized` — Not authenticated

---

# Task API

## GET /api/v1/tasks

Return all tasks visible to the current user.

**Authorization:** Authenticated user

**Query Parameters:**

- `cursor` (optional, string) — Pagination cursor for cursor-based pagination
- `limit` (optional, integer) — Number of results per page. Default: 20. Maximum: 100.
- `status` (optional, string) — Comma-separated status values: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `ARCHIVED`
- `priority` (optional, string) — Comma-separated priority values: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `projectId` (optional, string) — Filter by project UUID
- `assigneeId` (optional, string) — Filter by assignee UUID
- `dueBefore` (optional, string, ISO 8601) — Filter by due date before this timestamp
- `dueAfter` (optional, string, ISO 8601) — Filter by due date after this timestamp
- `search` (optional, string) — Full-text search query (searches title, description)
- `sort` (optional, string) — Comma-separated sort fields. Prefix with `-` for descending. Example: `-dueDate,priority`

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "string",
        "description": "string",
        "status": "TODO",
        "priority": "MEDIUM",
        "dueDate": "2025-01-15T00:00:00Z",
        "startDate": "2025-01-01T00:00:00Z",
        "projectId": "uuid",
        "createdBy": "uuid",
        "assignedBy": "uuid",
        "completedAt": "2025-01-15T00:00:00Z",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 150,
      "limit": 20,
      "cursor": "eyJpZCI6MTIzfQ",
      "hasNextPage": true
    }
  }
  ```

- `422 Unprocessable Entity` — Invalid query parameters

---

## GET /api/v1/tasks/{id}

Return a single task.

**Authorization:** Authenticated user with access to the task's project

**Responses:**

- `200 OK`
  ```json
  {
    "data": {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "TODO",
      "priority": "MEDIUM",
      "dueDate": "2025-01-15T00:00:00Z",
      "startDate": "2025-01-01T00:00:00Z",
      "estimatedHours": 8,
      "actualHours": 4,
      "customFields": {},
      "projectId": "uuid",
      "parentTaskId": "uuid",
      "createdBy": "uuid",
      "assignedBy": "uuid",
      "completedAt": "2025-01-15T00:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z",
      "labels": [
        { "id": "uuid", "name": "string", "color": "string" }
      ],
      "assignees": [
        { "id": "uuid", "firstName": "string", "lastName": "string", "avatarUrl": "string" }
      ],
      "dependencies": [
        { "id": "uuid", "predecessorTaskId": "uuid", "successorTaskId": "uuid" }
      ]
    }
  }
  ```

- `404 Not Found` — Task does not exist or user lacks access
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Task not found"
    },
    "traceId": "abc123"
  }
  ```

---

## POST /api/v1/tasks

Create a task.

**Authorization:** Authenticated user with `task:create` permission in the project

**Request Body:**

```json
{
  "title": "string (required, max 200 characters)",
  "description": "string (optional, max 5000 characters)",
  "projectId": "string (required, UUID)",
  "status": "string (optional, enum: TODO, IN_PROGRESS, IN_REVIEW, DONE. Default: TODO)",
  "priority": "string (optional, enum: LOW, MEDIUM, HIGH, URGENT. Default: MEDIUM)",
  "dueDate": "string (optional, ISO 8601)",
  "startDate": "string (optional, ISO 8601)",
  "estimatedHours": "number (optional, >= 0)",
  "parentTaskId": "string (optional, UUID)",
  "assigneeIds": ["string (optional, array of UUIDs)"],
  "labelIds": ["string (optional, array of UUIDs)"],
  "customFields": "object (optional)"
}
```

**Responses:**

- `201 Created`
  ```json
  {
    "data": {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "TODO",
      "priority": "MEDIUM",
      "dueDate": "2025-01-15T00:00:00Z",
      "startDate": "2025-01-01T00:00:00Z",
      "estimatedHours": 8,
      "actualHours": 0,
      "customFields": {},
      "projectId": "uuid",
      "parentTaskId": "uuid",
      "createdBy": "uuid",
      "assignedBy": "uuid",
      "completedAt": null,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
  ```
  Headers: `Location: /api/v1/tasks/{id}`

- `422 Unprocessable Entity` — Validation error
- `403 Forbidden` — User lacks `task:create` permission in the project
- `409 Conflict` — Unique constraint violation (e.g., duplicate task label)

---

## PUT /api/v1/tasks/{id}

Update a task (full replacement).

**Authorization:** Authenticated user with `task:update` permission in the project, or the task assignee

**Request Body:**

```json
{
  "title": "string (required, max 200 characters)",
  "description": "string (optional, max 5000 characters)",
  "status": "string (required, enum: TODO, IN_PROGRESS, IN_REVIEW, DONE, ARCHIVED)",
  "priority": "string (required, enum: LOW, MEDIUM, HIGH, URGENT)",
  "dueDate": "string (optional, ISO 8601)",
  "startDate": "string (optional, ISO 8601)",
  "estimatedHours": "number (optional, >= 0)",
  "actualHours": "number (optional, >= 0)",
  "parentTaskId": "string (optional, UUID)",
  "assigneeIds": ["string (optional, array of UUIDs)"],
  "labelIds": ["string (optional, array of UUIDs)"],
  "customFields": "object (optional)"
}
```

**Responses:**

- `200 OK` — Updated task object
- `404 Not Found` — Task does not exist
- `403 Forbidden` — User lacks permission
- `422 Unprocessable Entity` — Validation error
- `409 Conflict` — Unique constraint violation or optimistic locking conflict

---

## PATCH /api/v1/tasks/{id}

Partially update a task.

**Authorization:** Authenticated user with `task:update` permission in the project, or the task assignee

**Request Body:** Any subset of the PUT fields. Only provided fields are updated.

**Responses:**

- `200 OK` — Updated task object
- `404 Not Found`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `409 Conflict`

---

## DELETE /api/v1/tasks/{id}

Soft delete (archive) a task.

**Authorization:** Authenticated user with `task:delete` permission in the project, or the task creator

**Behavior:** Sets `deletedAt` to the current timestamp and `isArchived` to `true`. The task is no longer visible in standard queries but can be restored by an admin.

**Responses:**

- `204 No Content` — Task archived successfully
- `404 Not Found` — Task does not exist or already deleted
- `403 Forbidden` — User lacks permission
- `409 Conflict` — Task has uncompleted dependencies (business rule: cannot delete tasks with incomplete successors)

**Note:** Hard delete is not exposed via the public API. Administrators may perform hard deletion via admin tools only.

---

## GET /api/v1/tasks/{id}/comments

Return comments for a task.

**Authorization:** Authenticated user with access to the task's project

**Query Parameters:**

- `cursor` (optional) — Pagination cursor
- `limit` (optional) — Default: 20, Maximum: 100

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "message": "string",
        "isEdited": false,
        "parentCommentId": "uuid",
        "authorId": "uuid",
        "author": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "avatarUrl": "string"
        },
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 45,
      "limit": 20,
      "cursor": "eyJpZCI6MTIzfQ",
      "hasNextPage": true
    }
  }
  ```

- `404 Not Found`
- `403 Forbidden`

---

## POST /api/v1/tasks/{id}/comments

Create a comment on a task.

**Authorization:** Authenticated user with access to the task's project

**Request Body:**

```json
{
  "message": "string (required, max 2000 characters)",
  "parentCommentId": "string (optional, UUID for threaded replies)"
}
```

**Responses:**

- `201 Created` — Comment object
  Headers: `Location: /api/v1/tasks/{taskId}/comments/{commentId}`
- `404 Not Found`
- `403 Forbidden`
- `422 Unprocessable Entity`

---

## GET /api/v1/tasks/{id}/attachments

Return attachments for a task.

**Authorization:** Authenticated user with access to the task's project

**Query Parameters:**

- `cursor` (optional)
- `limit` (optional) — Default: 20, Maximum: 100

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "filename": "string",
        "originalName": "string",
        "mimeType": "string",
        "size": 1024,
        "url": "string (signed URL)",
        "virusScanStatus": "CLEAN",
        "uploadedBy": "uuid",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 5,
      "limit": 20,
      "cursor": "eyJpZCI6MTIzfQ",
      "hasNextPage": false
    }
  }
  ```

- `404 Not Found`
- `403 Forbidden`

---

## POST /api/v1/tasks/{id}/attachments

Upload an attachment to a task.

**Authorization:** Authenticated user with access to the task's project

**Request Body:** `multipart/form-data`

Fields:
- `file` (required) — Binary file data
  - Allowed types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `image/png`, `image/jpeg`, `image/gif`, `text/plain`
  - Max size: 10 MB per file
  - Max total per task: 50 MB

**Responses:**

- `201 Created` — Attachment object with signed download URL
  Headers: `Location: /api/v1/tasks/{taskId}/attachments/{attachmentId}`
- `404 Not Found`
- `403 Forbidden`
- `413 Payload Too Large` — File exceeds size limit
- `422 Unprocessable Entity` — Invalid file type or quota exceeded
- `500 Internal Server Error` — Virus scan failed

---

## GET /api/v1/tasks/{id}/time-entries

Return time entries for a task.

**Authorization:** Authenticated user with access to the task's project

**Query Parameters:**

- `cursor` (optional)
- `limit` (optional) — Default: 20, Maximum: 100
- `userId` (optional) — Filter by user UUID

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "taskId": "uuid",
        "userId": "uuid",
        "user": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "avatarUrl": "string"
        },
        "startTime": "2025-01-01T09:00:00Z",
        "endTime": "2025-01-01T17:00:00Z",
        "description": "string",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 8,
      "limit": 20,
      "cursor": "eyJpZCI6MTIzfQ",
      "hasNextPage": false
    }
  }
  ```

- `404 Not Found`
- `403 Forbidden`

---

## POST /api/v1/tasks/{id}/time-entries

Create a time entry for a task.

**Authorization:** Authenticated user

**Request Body:**

```json
{
  "startTime": "string (required, ISO 8601)",
  "endTime": "string (required, ISO 8601, must be after startTime)",
  "description": "string (optional, max 1000 characters)"
}
```

**Responses:**

- `201 Created` — Time entry object
  Headers: `Location: /api/v1/tasks/{taskId}/time-entries/{timeEntryId}`
- `404 Not Found`
- `403 Forbidden`
- `422 Unprocessable Entity` — Validation error (e.g., endTime before startTime)

---

## GET /api/v1/tasks/{id}/assignable-users

Return users that can be assigned to a task.

**Authorization:** Authenticated user with access to the task's project

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "avatarUrl": "string",
        "jobTitle": "string"
      }
    ]
  }
  ```

- `404 Not Found`
- `403 Forbidden`

---

# Project API

## GET /api/v1/projects

Return all projects visible to the current user.

**Authorization:** Authenticated user

**Query Parameters:**

- `cursor` (optional)
- `limit` (optional) — Default: 20, Maximum: 100
- `status` (optional) — Comma-separated: `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`
- `visibility` (optional) — `PRIVATE`, `INTERNAL`, `PUBLIC`
- `ownerId` (optional) — Filter by owner UUID
- `search` (optional) — Full-text search on name and description
- `sort` (optional) — Example: `-createdAt,name`

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "status": "ACTIVE",
        "visibility": "INTERNAL",
        "color": "string",
        "startDate": "2025-01-01T00:00:00Z",
        "endDate": "2025-01-31T00:00:00Z",
        "isArchived": false,
        "ownerId": "uuid",
        "organizationId": "uuid",
        "createdBy": "uuid",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 25,
      "limit": 20,
      "cursor": "eyJpZCI6MTIzfQ",
      "hasNextPage": true
    }
  }
  ```

---

## POST /api/v1/projects

Create a project.

**Authorization:** Authenticated user

**Request Body:**

```json
{
  "name": "string (required, max 200 characters)",
  "description": "string (optional, max 5000 characters)",
  "status": "string (optional, enum: PLANNING, ACTIVE, ON_HOLD, COMPLETED. Default: PLANNING)",
  "visibility": "string (optional, enum: PRIVATE, INTERNAL, PUBLIC. Default: PRIVATE)",
  "color": "string (optional, hex color code)",
  "startDate": "string (optional, ISO 8601)",
  "endDate": "string (optional, ISO 8601)"
}
```

**Responses:**

- `201 Created` — Project object
  Headers: `Location: /api/v1/projects/{id}`
- `422 Unprocessable Entity`
- `409 Conflict` — Project name already exists in organization (if unique constraint applies)

---

## GET /api/v1/projects/{id}

Return a single project.

**Authorization:** Authenticated user with access to the project

**Responses:**

- `200 OK`
  ```json
  {
    "data": {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "status": "ACTIVE",
      "visibility": "INTERNAL",
      "color": "string",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-01-31T00:00:00Z",
      "isArchived": false,
      "ownerId": "uuid",
      "organizationId": "uuid",
      "createdBy": "uuid",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z",
      "members": [
        {
          "userId": "uuid",
          "roleId": "uuid",
          "role": {
            "id": "uuid",
            "name": "string",
            "description": "string"
          },
          "user": {
            "id": "uuid",
            "firstName": "string",
            "lastName": "string",
            "avatarUrl": "string"
          }
        }
      ]
    }
  }
  ```

- `404 Not Found`
- `403 Forbidden`

---

## PUT /api/v1/projects/{id}

Update a project (full replacement).

**Authorization:** Authenticated user with `project:update` permission, or project owner

**Request Body:** Same fields as POST, all required.

**Responses:**

- `200 OK` — Updated project object
- `404 Not Found`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `409 Conflict`

---

## PATCH /api/v1/projects/{id}

Partially update a project.

**Authorization:** Authenticated user with `project:update` permission, or project owner

**Request Body:** Any subset of the POST fields.

**Responses:**

- `200 OK` — Updated project object
- `404 Not Found`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `409 Conflict`

---

## DELETE /api/v1/projects/{id}

Soft delete (archive) a project.

**Authorization:** Authenticated user with `project:delete` permission, or organization owner

**Behavior:** Sets `deletedAt` and `isArchived` to true. Tasks within the project are also marked as archived.

**Responses:**

- `204 No Content`
- `404 Not Found`
- `403 Forbidden`
- `409 Conflict` — Project has active tasks with uncompleted dependencies

---

## GET /api/v1/projects/{id}/tasks

Return tasks for a project.

**Authorization:** Authenticated user with access to the project

**Query Parameters:** Same as `GET /api/v1/tasks`, but scoped to the project.

**Responses:**

- `200 OK` — Task array with pagination metadata
- `404 Not Found`
- `403 Forbidden`

---

## GET /api/v1/projects/{id}/members

Return members of a project.

**Authorization:** Authenticated user with access to the project

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "userId": "uuid",
        "roleId": "uuid",
        "role": {
          "id": "uuid",
          "name": "string",
          "description": "string"
        },
        "user": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "email": "string",
          "avatarUrl": "string",
          "jobTitle": "string"
        },
        "joinedAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
  ```

- `404 Not Found`
- `403 Forbidden`

---

## POST /api/v1/projects/{id}/members

Add a member to a project.

**Authorization:** Authenticated user with `project:update` permission, or project owner

**Request Body:**

```json
{
  "userId": "string (required, UUID)",
  "roleId": "string (required, UUID)"
}
```

**Responses:**

- `201 Created`
  Headers: `Location: /api/v1/projects/{id}/members/{userId}`
- `404 Not Found`
- `403 Forbidden`
- `409 Conflict` — User is already a member
- `422 Unprocessable Entity`

---

## DELETE /api/v1/projects/{id}/members/{userId}

Remove a member from a project.

**Authorization:** Authenticated user with `project:update` permission, or project owner

**Responses:**

- `204 No Content`
- `404 Not Found`
- `403 Forbidden`
- `409 Conflict` — Cannot remove the project owner

---

# User API

## GET /api/v1/users

Return users in the current user's organization.

**Authorization:** Authenticated user with `user:read` permission (typically org admin or team lead)

**Behavior:** Returns only users belonging to the same organization as the authenticated user. Super-admin users may view all platform users via a separate admin endpoint.

**Query Parameters:**

- `cursor` (optional)
- `limit` (optional) — Default: 20, Maximum: 100
- `search` (optional) — Full-text search on name and email
- `isActive` (optional, boolean) — Filter by active status
- `sort` (optional) — Example: `lastName,firstName`

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "email": "string (masked for non-admins: j***@example.com)",
        "firstName": "string",
        "lastName": "string",
        "jobTitle": "string",
        "department": "string",
        "avatarUrl": "string",
        "isActive": true,
        "lastLoginAt": "2025-01-01T00:00:00Z",
        "organizationId": "uuid",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 50,
      "limit": 20,
      "cursor": "eyJpZCI6MTIzfQ",
      "hasNextPage": true
    }
  }
  ```

- `403 Forbidden` — User lacks `user:read` permission
- `422 Unprocessable Entity`

**Note:** Non-admin callers see masked email addresses. Admin callers see full emails. Sensitive fields (`passwordHash`, `emailVerificationToken`, `passwordResetToken`, `passwordResetExpires`) are never returned.

---

## GET /api/v1/users/{id}

Return a single user.

**Authorization:** Authenticated user. Users can view their own profile. Org admins can view any user in the organization.

**Responses:**

- `200 OK` — User object (same shape as GET /users, with field-level masking applied)
- `404 Not Found`
- `403 Forbidden`

---

## PUT /api/v1/users/{id}

Update a user (full replacement).

**Authorization:** User updating their own profile, or org admin updating any user

**Request Body:**

```json
{
  "firstName": "string (required, max 100 characters)",
  "lastName": "string (required, max 100 characters)",
  "jobTitle": "string (optional, max 200 characters)",
  "department": "string (optional, max 200 characters)",
  "timezone": "string (optional)",
  "avatarUrl": "string (optional, URL)"
}
```

**Responses:**

- `200 OK` — Updated user object
- `404 Not Found`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `409 Conflict` — Email uniqueness violation (if email is being changed)

---

## PATCH /api/v1/users/{id}

Partially update a user.

**Authorization:** Same as PUT

**Request Body:** Any subset of the PUT fields.

**Responses:**

- `200 OK`
- `404 Not Found`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `409 Conflict`

---

## GET /api/v1/organizations/current/members

Return all members of the current user's organization.

**Authorization:** Authenticated user with `organization:read` permission

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "email": "string (masked for non-admins)",
        "firstName": "string",
        "lastName": "string",
        "jobTitle": "string",
        "department": "string",
        "avatarUrl": "string",
        "isActive": true,
        "lastLoginAt": "2025-01-01T00:00:00Z",
        "teams": [
          {
            "id": "uuid",
            "name": "string"
          }
        ],
        "roles": [
          {
            "id": "uuid",
            "name": "string"
          }
        ]
      }
    ]
  }
  ```

- `403 Forbidden`
- `422 Unprocessable Entity`

---

# Notification API

## GET /api/v1/notifications

Return notifications for the current user.

**Authorization:** Authenticated user

**Query Parameters:**

- `page` (optional, integer) — Page number. Default: 1.
- `limit` (optional, integer) — Items per page. Default: 20. Maximum: 100.
- `isRead` (optional, boolean) — Filter by read status
- `type` (optional, string) — Comma-separated notification types
- `since` (optional, string, ISO 8601) — Notifications created after this timestamp

**Responses:**

- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "type": "string",
        "title": "string",
        "message": "string",
        "isRead": false,
        "entityType": "string",
        "entityId": "uuid",
        "actorId": "uuid",
        "actor": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "avatarUrl": "string"
        },
        "actionUrl": "string",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
  ```

---

## PATCH /api/v1/notifications/{id}/read

Mark a notification as read.

**Authorization:** Authenticated user (must be the notification recipient)

**Request Body:**

```json
{
  "isRead": true
}
```

**Responses:**

- `200 OK` — Updated notification object
- `404 Not Found`
- `403 Forbidden` — User is not the recipient

---

## POST /api/v1/notifications/batch-read

Mark multiple notifications as read.

**Authorization:** Authenticated user

**Request Body:**

```json
{
  "notificationIds": ["uuid (required, array of UUIDs)"]
}
```

**Responses:**

- `204 No Content`
- `422 Unprocessable Entity` — Empty array or invalid UUIDs

---

# Error Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "errors": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  },
  "traceId": "string (unique request identifier for support correlation)"
}
```

## HTTP Status Code Mapping

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Authenticated but lacking permission |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Uniqueness violation or business rule conflict |
| 413 | `PAYLOAD_TOO_LARGE` | Request body exceeds size limit |
| 422 | `VALIDATION_ERROR` | Request body or query parameter validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

## Error Code Catalog

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication missing or invalid |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `EMAIL_ALREADY_EXISTS` | Registration email already in use |
| `INVALID_CREDENTIALS` | Login failed |
| `INVALID_TOKEN` | Token is invalid or expired |
| `RATE_LIMIT_EXCEEDED` | Rate limit hit |
| `INTERNAL_ERROR` | Server error |

---

# Validation

All request bodies and query parameters are validated using Zod schemas.

## Task Validation Rules

- `title`: required, string, max 200 characters
- `description`: optional, string, max 5000 characters
- `status`: optional, enum: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `ARCHIVED`
- `priority`: optional, enum: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `dueDate`: optional, ISO 8601 datetime
- `startDate`: optional, ISO 8601 datetime
- `estimatedHours`: optional, number, >= 0
- `actualHours`: optional, number, >= 0
- `parentTaskId`: optional, UUID. Must not create a circular dependency.
- `projectId`: required on creation, UUID
- `assigneeIds`: optional, array of UUIDs. All assignees must belong to the same organization as the project.
- `labelIds`: optional, array of UUIDs. All labels must belong to the same organization as the project.

## Project Validation Rules

- `name`: required, string, max 200 characters
- `description`: optional, string, max 5000 characters
- `status`: optional, enum: `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`
- `visibility`: optional, enum: `PRIVATE`, `INTERNAL`, `PUBLIC`
- `color`: optional, string, hex color code format
- `startDate`: optional, ISO 8601 datetime
- `endDate`: optional, ISO 8601 datetime. Must be after `startDate` if both provided.

## Conditional Validation Rules

- `endDate` must be after `startDate` when both are provided.
- `dueDate` is recommended when `status` is not `TODO`.
- `assigneeIds` must reference users in the same organization as the task's project.
- `labelIds` must reference labels in the same organization as the task's project.
- `parentTaskId` must not create a circular dependency (task cannot be its own ancestor).

## User Validation Rules

- `email`: required, email format, max 255 characters
- `password`: required, min 8 characters, must contain at least one letter and one number
- `firstName`: required, string, max 100 characters
- `lastName`: required, string, max 100 characters
- `timezone`: optional, IANA timezone format (e.g., `America/New_York`)

## Uniqueness Constraints

The following fields have unique constraints at the database level. Clients should expect `409 Conflict` if violated:

- `User.email` — unique per organization
- `Organization.slug` — unique globally
- `UserTeam(userId, teamId)` — composite unique
- `ProjectMember(userId, projectId)` — composite unique
- `TaskAssignee(userId, taskId)` — composite unique
- `RolePermission(roleId, permissionId)` — composite unique
- `TaskLabel(taskId, labelId)` — composite unique
- `TaskDependency(predecessorTaskId, successorTaskId)` — composite unique

---

# Authorization

## Multi-Tenancy Scoping

All data is scoped to an organization. The current organization is determined by:

1. **Primary method:** Clerk JWT `orgId` claim. The authenticated user's current organization is extracted from the token.
2. **Service-to-service:** `X-Organization-Id` header. Used for internal API calls and background jobs. Requires service authentication.

All queries filter by `organizationId` at the repository layer. Row-Level Security (RLS) in PostgreSQL enforces this as a safety net.

## Per-Endpoint Authorization Requirements

| Endpoint | Required Permission / Role |
|----------|---------------------------|
| `POST /auth/register` | Public |
| `POST /auth/login` | Public |
| `POST /auth/logout` | Authenticated user |
| `POST /auth/reset-password` | Public |
| `POST /auth/reset-password/confirm` | Public |
| `GET /auth/me` | Authenticated user |
| `GET /tasks` | Authenticated user |
| `GET /tasks/{id}` | Authenticated user with access to the task's project |
| `POST /tasks` | `task:create` in the project |
| `PUT /tasks/{id}` | `task:update` in the project, or task assignee |
| `PATCH /tasks/{id}` | `task:update` in the project, or task assignee |
| `DELETE /tasks/{id}` | `task:delete` in the project, or task creator |
| `GET /tasks/{id}/comments` | Access to the task's project |
| `POST /tasks/{id}/comments` | Access to the task's project |
| `GET /tasks/{id}/attachments` | Access to the task's project |
| `POST /tasks/{id}/attachments` | Access to the task's project |
| `GET /tasks/{id}/time-entries` | Access to the task's project |
| `POST /tasks/{id}/time-entries` | Authenticated user |
| `GET /tasks/{id}/assignable-users` | Access to the task's project |
| `GET /projects` | Authenticated user |
| `POST /projects` | Authenticated user |
| `GET /projects/{id}` | Access to the project |
| `PUT /projects/{id}` | `project:update`, or project owner |
| `PATCH /projects/{id}` | `project:update`, or project owner |
| `DELETE /projects/{id}` | `project:delete`, or organization owner |
| `GET /projects/{id}/tasks` | Access to the project |
| `GET /projects/{id}/members` | Access to the project |
| `POST /projects/{id}/members` | `project:update`, or project owner |
| `DELETE /projects/{id}/members/{userId}` | `project:update`, or project owner |
| `GET /users` | `user:read` (org admin or team lead) |
| `GET /users/{id}` | User themselves, or org admin |
| `PUT /users/{id}` | User themselves, or org admin |
| `PATCH /users/{id}` | User themselves, or org admin |
| `GET /organizations/current/members` | `organization:read` |
| `GET /notifications` | Authenticated user (recipient only) |
| `PATCH /notifications/{id}/read` | Notification recipient |
| `POST /notifications/batch-read` | Authenticated user (recipient only) |

## Resource-Level Authorization

- **Task visibility:** A user can view a task if they are a member of the task's project, or the project visibility is `INTERNAL`/`PUBLIC` within their organization.
- **Project visibility:**
  - `PRIVATE`: Only explicitly added members can view
  - `INTERNAL`: All organization members can view
  - `PUBLIC`: All authenticated users can view
- **Task update rights:** Assignees can update task status and log time. Only users with `task:update` can modify title, description, priority, due dates, or assignments.

## Field-Level Authorization

| Field | Visible To |
|-------|-----------|
| `User.passwordHash` | Never (system only) |
| `User.emailVerificationToken` | Never (system only) |
| `User.passwordResetToken` | Never (system only) |
| `User.passwordResetExpires` | Never (system only) |
| `User.email` | Admin: full. Non-admin: masked (`j***@example.com`) |
| `Task.internalNotes` (custom field) | Admin and assignee only |
| `Organization.settings` | Org admin only |

---

# Security

## HTTPS

All communication must use HTTPS. HTTP requests are rejected with a `403 Forbidden` response.

## Authentication

Authentication is handled by Clerk. The API validates Clerk session tokens on every request.

## CORS Policy

Allowed origins:
- Production: `https://app.professionaltaskmanager.com`
- Preview/staging: `https://staging.professionaltaskmanager.com`
- Local development: `http://localhost:3000`

Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

Allowed headers:
- `Authorization`
- `Content-Type`
- `Idempotency-Key`
- `X-Request-ID`

Credentials: `Access-Control-Allow-Credentials: true` (if cookies are used for session management)

## Security Headers

All responses must include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';`

## Input Validation

All inputs are validated using Zod schemas at the route handler layer. Validation occurs before any business logic executes.

## Output Sanitization

User-generated content (task descriptions, comment messages) is sanitized to prevent XSS. HTML is escaped unless explicitly rendered by the client.

## Rate Limiting

Rate limits are applied per authenticated user and per IP address.

| Scope | Limit | Window |
|-------|-------|--------|
| Authenticated (per user) | 1000 requests | 1 hour |
| Authenticated (per user, burst) | 100 requests | 1 minute |
| Anonymous (per IP) | 100 requests | 1 hour |

When rate limited, the API returns `429 Too Many Requests` with headers:

- `X-RateLimit-Limit: 1000`
- `X-RateLimit-Remaining: 0`
- `X-RateLimit-Reset: 2025-01-01T01:00:00Z`

Rate limits may vary by subscription tier. Enterprise tiers receive higher limits.

## Audit Logging

All create, update, and delete operations emit audit events. The Audit module persists these events in an append-only store. Audit logs include:

- `userId`
- `organizationId`
- `action` (e.g., `task.created`, `task.updated`, `task.deleted`)
- `entityType`
- `entityId`
- `changes` (JSONB diff of changed fields)
- `ipAddress`
- `userAgent`
- `timestamp`

Audit logs are immutable and retained for a minimum of 90 days.

## Sensitive Data Redaction

The API never returns the following fields in any response:

- `User.passwordHash`
- `User.emailVerificationToken`
- `User.passwordResetToken`
- `User.passwordResetExpires`

Email addresses are masked for non-admin callers:

- Admin: `john.doe@example.com`
- Non-admin: `j***@example.com`

---

# Pagination

## Cursor-Based Pagination (Preferred)

Used for task lists, comment lists, attachment lists, and time entry lists.

**Request:**

```
GET /api/v1/tasks?cursor=eyJpZCI6MTIzfQ&limit=20
```

**Response:**

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "cursor": "eyJpZCI6MTIzfQ",
    "hasNextPage": true
  }
}
```

- `cursor`: Opaque string provided by the server. The client must not modify or interpret it.
- `hasNextPage`: Boolean indicating whether more results exist.
- `total`: Total number of records matching the query (may be approximate for very large datasets).

## Offset-Based Pagination

Used for notifications where total count is important for UI badges.

**Request:**

```
GET /api/v1/notifications?page=2&limit=20
```

**Response:**

```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 2,
    "limit": 20,
    "totalPages": 3
  }
}
```

## Pagination Defaults

- Default `limit`: 20
- Maximum `limit`: 100
- If `limit` exceeds the maximum, the server returns `422 Unprocessable Entity`.

---

# Filtering and Sorting

## Filtering Conventions

Multiple values are comma-separated:

```
GET /api/v1/tasks?status=TODO,IN_PROGRESS&priority=HIGH,URGENT&projectId=abc123
```

Date range filters:

```
GET /api/v1/tasks?dueAfter=2025-01-01T00:00:00Z&dueBefore=2025-01-31T23:59:59Z
```

Full-text search:

```
GET /api/v1/tasks?search=quarterly report
```

## Sorting Conventions

Prefix with `-` for descending order. Multiple sort fields are comma-separated:

```
GET /api/v1/tasks?sort=-dueDate,priority
GET /api/v1/projects?sort=-createdAt,name
```

Invalid sort fields return `422 Unprocessable Entity`.

---

# Caching

## Cacheable Endpoints

The following endpoints support HTTP caching:

- `GET /api/v1/projects/{id}` — `Cache-Control: private, max-age=300`
- `GET /api/v1/tasks/{id}` — `Cache-Control: private, max-age=60`
- `GET /api/v1/organizations/current/members` — `Cache-Control: private, max-age=300`

## Cache Headers

Responses include:

- `Cache-Control: private, max-age=300` — Client-side caching for 5 minutes
- `ETag: "abc123"` — Entity tag for conditional requests
- `Last-Modified: Wed, 01 Jan 2025 00:00:00 GMT` — Last modification timestamp

Clients may send `If-None-Match` or `If-Modified-Since` headers. If the resource has not changed, the server returns `304 Not Modified`.

Cache invalidation occurs on any create, update, or delete operation affecting the cached resource. Invalidation is event-driven via the Application Layer.

---

# Idempotency

## Idempotency-Key Header

Clients may include an `Idempotency-Key` header on `POST` requests to prevent duplicate resource creation on network retries.

```
Idempotency-Key: unique-client-generated-uuid
```

If a request with the same `Idempotency-Key` is received within 24 hours, the server returns the original response instead of processing the request again.

Supported endpoints:

- `POST /api/v1/tasks`
- `POST /api/v1/projects`
- `POST /api/v1/tasks/{id}/comments`
- `POST /api/v1/tasks/{id}/attachments`
- `POST /api/v1/tasks/{id}/time-entries`

---

# Request Correlation

## X-Request-ID Header

Clients may include an `X-Request-ID` header with a unique identifier (UUID). If not provided, the server generates one.

The `traceId` is returned in all error responses and included in all audit logs and structured logs. This enables distributed tracing across the request lifecycle.

---

# WebSocket and Real-Time (Future)

## Planned: /api/v1/ws

A WebSocket endpoint is planned for real-time notifications.

Planned features:

- Push notifications when tasks are assigned, commented on, or status changes
- Connection authenticated via Clerk token in the handshake
- Reconnection with exponential backoff

This endpoint is not included in v1 but is documented for future implementation.

---

# Background Jobs and Async Operations

## Long-Running Operations

Operations such as report exports and bulk email notifications are processed asynchronously.

**Response pattern:**

```json
{
  "data": {
    "jobId": "uuid",
    "status": "PENDING",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

Clients can poll `GET /api/v1/jobs/{jobId}` for status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).

Job processor implements retry with exponential backoff (1s, 2s, 4s) up to 3 attempts.

---

# API Limits

## Request Size Limits

- Maximum request body size: 1 MB (excluding multipart file uploads)
- Maximum JSON field depth: 10 levels
- Maximum URL length: 8192 characters

## File Upload Limits

- Maximum file size: 10 MB per file
- Maximum total attachments per task: 50 MB
- Allowed MIME types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, GIF, TXT

---

# OpenAPI Documentation

OpenAPI 3.0 specification is generated from Route Handlers and published at `/api/v1/openapi.json`. A human-readable version is available at `/api/docs`.
