# User Stories

## Epic 1: Authentication & Authorization

### US-001: Register Account
As a new user,
I want to register an account with my full name, email, password, and organization name,
So that I can securely access the application.

**Acceptance Criteria:**
- Given I am on the registration page, when I enter valid full name, email, password (minimum 8 characters), and organization name, then my account is created and an email verification link is sent.
- Given I am on the registration page, when I submit the form with missing required fields, then validation errors are displayed for each missing field and the form is not submitted.
- Given I have registered but not verified my email, when I attempt to log in, then I see a message instructing me to verify my email before proceeding.
- Given I click the verification link in the email, then my account is activated and I can log in successfully.
- Given I register with an email that already exists, then I see an error message stating the email is already in use.

**Traceability:** FR-001

---

### US-002: Log In
As a registered user,
I want to log in with my email and password,
So that I can access my workspace.

**Acceptance Criteria:**
- Given I am on the login page, when I enter valid credentials, then I am redirected to my dashboard.
- Given I am on the login page, when I enter invalid credentials, then I see an error message and remain on the login page.
- Given I have forgotten my password, when I click "Forgot Password", then I am redirected to the password reset flow.
- Given my account is not yet verified, when I attempt to log in, then I see a message to verify my email.

**Traceability:** FR-002

---

### US-003: Reset Forgotten Password
As a registered user,
I want to reset my password via email,
So that I can regain access if I forget my credentials.

**Acceptance Criteria:**
- Given I am on the login page, when I click "Forgot Password" and enter my registered email, then a password reset link is sent to that email.
- Given I click the password reset link, when I enter a new password meeting complexity requirements, then my password is updated and I can log in with the new password.
- Given I use an expired or invalid reset token, then I see an error message and am prompted to request a new reset link.

**Traceability:** FR-003

---

### US-004: Log Out
As a logged-in user,
I want to log out of the application,
So that I can secure my session when I am done.

**Acceptance Criteria:**
- Given I am logged in, when I click the logout button, then I am redirected to the login page and my session is invalidated.
- Given I attempt to access a protected page after logging out, then I am redirected to the login page.

**Traceability:** FR-004

---

## Epic 8: Administration

### US-005: Admin Creates User Account
As an Administrator,
I want to create user accounts on behalf of users,
So that new team members can be onboarded without self-service registration.

**Acceptance Criteria:**
- Given I am on the user management page, when I enter full name, email, role, and organization, then a user account is created and an invitation email is sent.
- Given I create a user with an existing email, then I see an error message and the account is not created.
- Given an invited user receives the email, when they click the invitation link and set their password, then their account is activated and they can log in.

**Traceability:** FR-005

---

### US-006: Admin Deactivates User
As an Administrator,
I want to deactivate user accounts,
So that inactive or departing users cannot access the system.

**Acceptance Criteria:**
- Given I am on the user management page, when I select a user and click deactivate, then the user account is deactivated and they cannot log in.
- Given a deactivated user attempts to log in, then they see an error message stating their account is inactive.
- Given I deactivate a user, when I view their task history, then their historical tasks remain visible for audit purposes.

**Traceability:** FR-006

---

### US-007: User Updates Own Profile
As a logged-in user,
I want to update my profile information,
So that my details remain current.

**Acceptance Criteria:**
- Given I am on my profile settings page, when I edit my full name or email, then the changes are saved and reflected across the application.
- Given I attempt to change my email to one that is already in use, then I see an error message and the change is not saved.

**Traceability:** FR-007

---

### US-008: User Uploads Profile Picture
As a logged-in user,
I want to upload a profile picture,
So that other users can recognize me.

**Acceptance Criteria:**
- Given I am on my profile settings page, when I select an image file within the allowed size and format, then the image is uploaded and displayed as my profile picture.
- Given I select a file that exceeds the maximum size or is an unsupported format, then I see an error message and the upload is rejected.
- Given I have uploaded a profile picture, when I view my profile, then the picture is displayed.

**Traceability:** FR-008

---

## Epic 3: Project Management

### US-009: Admin Creates Project
As an Administrator,
I want to create a new project,
So that tasks can be organized under a common project.

**Acceptance Criteria:**
- Given I am on the projects page, when I enter a project name and description, then the project is created and I am redirected to the project details page.
- Given I attempt to create a project with a name that already exists within my organization, then I see an error message and the project is not created.
- Given I create a project, then I can immediately begin creating tasks within that project.

**Traceability:** FR-033

---

### US-010: Admin Views Projects
As an Administrator,
I want to view a list of all projects,
So that I can manage them.

**Acceptance Criteria:**
- Given I am on the projects page, when I view the project list, then I see all projects I have access to, including their names, descriptions, and task counts.
- Given there are no projects, then I see an empty state message with an option to create my first project.

**Traceability:** FR-033

---

### US-011: Admin Edits Project
As an Administrator,
I want to edit project details,
So that project information remains accurate.

**Acceptance Criteria:**
- Given I am on a project details page, when I edit the project name or description and save, then the changes are reflected across the application.
- Given I attempt to edit a project that has been archived, then I see an error message and cannot edit it.

**Traceability:** FR-033

---

### US-012: Admin Deletes Project
As an Administrator,
I want to delete a project,
So that outdated or unused projects are removed.

**Acceptance Criteria:**
- Given I am on a project details page, when I confirm deletion, then the project is archived and all associated tasks are archived.
- Given a project is deleted, when I attempt to create a new task, then I cannot assign it to the deleted project.
- Given I delete a project, then all historical task data remains accessible for reporting and audit purposes.

**Traceability:** FR-033

---

## Epic 4: Task Management

### US-013: Manager Creates Task
As a Manager,
I want to create a new task within a project,
So that work can be assigned to team members.

**Acceptance Criteria:**
- Given I am on a project page or the create task page, when I enter a title, description, select a project, assignee, priority, and due date, then the task is created.
- Given I attempt to create a task without a title, then I see a validation error and the task is not created.
- Given I attempt to create a task without selecting a project, then I see a validation error and the task is not created (per BR-001).
- Given I create a task, then the task appears on my dashboard and the assignee's dashboard.

**Traceability:** FR-009, BR-001

---

### US-014: Manager Assigns Task
As a Manager,
I want to assign a task to one or more users,
So that responsibilities are clearly defined.

**Acceptance Criteria:**
- Given I am creating or editing a task, when I select one or more assignees and save, then the task is assigned to those users.
- Given I assign a task to a user, then the assigned user receives a notification (FR-019).
- Given I assign a task to a user who is not part of the project, then I see a warning but can still assign the task.
- Given I view the assignee dropdown, then only Managers and Administrators are available for assignment (BR-005).

**Traceability:** FR-010, BR-005

---

### US-015: Manager Sets Task Priority
As a Manager,
I want to set the priority of a task,
So that team members understand urgency.

**Acceptance Criteria:**
- Given I am creating or editing a task, when I select a priority (Low, Medium, High, Urgent), then the priority is saved and displayed on the task.
- Given I do not select a priority, then the default priority is Medium.
- Given I view a task list, then tasks are sorted or visually distinguished by priority.

**Traceability:** FR-011, BR-007

---

### US-016: Manager Sets Task Due Date
As a Manager,
I want to set a due date for a task,
So that deadlines are clear.

**Acceptance Criteria:**
- Given I am creating or editing a task, when I select a due date, then the due date is saved and displayed on the task.
- Given I do not set a due date, then the task has no due date.
- Given a task has a due date within 24 hours and is not completed, then the assigned user receives a due date reminder (FR-020).

**Traceability:** FR-012, BR-007

---

### US-017: Manager Edits Task
As a Manager,
I want to edit task details after creation,
So that I can update information as requirements change.

**Acceptance Criteria:**
- Given I am on a task details page, when I edit the title, description, priority, due date, or assignees and save, then the changes are saved.
- Given the task is in Completed status, when I attempt to edit it, then I see a message that completed tasks cannot be edited unless reopened (BR-004).
- Given another user has edited the task since I opened it, when I attempt to save, then I see a conflict resolution UI (NFR-011).

**Traceability:** FR-013, BR-004, NFR-011

---

### US-018: Manager Archives Completed Task
As a Manager,
I want to archive completed tasks,
So that active task lists remain relevant.

**Acceptance Criteria:**
- Given I am on a task details page and the task is Completed, when I click Archive, then the task is removed from active task lists and moved to an archive.
- Given a task is archived, when I view the archive, then I can see the archived task with its full history.
- Given I archive a task, when I view reports, then the archived task is included in historical data.

**Traceability:** FR-014

---

### US-019: User Updates Task Status
As a Team Member,
I want to update the status of my assigned tasks,
So that my manager knows my progress.

**Acceptance Criteria:**
- Given I am on a task details page for a task assigned to me, when I change the status to one of the valid values (Not Started, In Progress, Blocked, Completed), then the status is saved.
- Given I am not the assignee of the task, when I attempt to update the status, then I see a permission error.
- Given I change the status to Completed, then the task creator and assigned managers receive a notification (FR-021).
- Given I change the status to Blocked, then the manager is notified of the blockage.

**Traceability:** FR-015, BR-006, BR-008

---

### US-020: User Adds Task Comment
As a Team Member,
I want to add comments to a task,
So that I can communicate progress, blockers, or questions.

**Acceptance Criteria:**
- Given I am on a task details page, when I enter a comment and submit, then the comment appears in the activity timeline.
- Given I submit an empty comment, then I see a validation error and the comment is not posted.

**Traceability:** FR-016

---

### US-021: User Uploads Attachment to Task
As a Team Member,
I want to upload files to a task,
So that project resources remain organized and accessible.

**Acceptance Criteria:**
- Given I am on a task details page, when I select a file within the allowed types and under 10 MB, then the file is uploaded and attached to the task.
- Given I select a file exceeding 10 MB or an unsupported format, then I see an error message and the upload is rejected.
- Given I upload multiple files, when the total exceeds 50 MB for the task, then I see an error and cannot upload additional files.
- Given I upload a file, then the file appears in the attachments section with its name, size, and upload date.

**Traceability:** FR-017, NFR-010

---

### US-022: Manager Monitors Task Progress
As a Manager,
I want to monitor the progress of tasks assigned to my team,
So that I can identify risks and blockers early.

**Acceptance Criteria:**
- Given I am on the dashboard, when I view the project progress section, then I see tasks grouped by status, including overdue and blocked tasks.
- Given a task is overdue, when I view the dashboard, then the task is highlighted as overdue.
- Given a task is blocked, when I view the dashboard, then the task is marked with a blocked indicator.

**Traceability:** FR-018

---

### US-023: Manager Reassigns Task
As a Manager,
I want to reassign a task to a different user,
So that work can be redistributed as needed.

**Acceptance Criteria:**
- Given I am on a task details page, when I select a new assignee and save, then the task is reassigned.
- Given I reassign a task, then the previous assignee is notified that the task has been reassigned and it is removed from their dashboard.
- Given I reassign a task, then the new assignee receives a task assignment notification (FR-019).

**Traceability:** FR-032

---

### US-024: User Downloads Attachment
As a Team Member,
I want to download attachments from tasks I can access,
So that I can view or use the files.

**Acceptance Criteria:**
- Given I am on a task details page with attachments, when I click the download button on an attachment, then the file is downloaded to my device.
- Given I do not have permission to view the task, then I do not see the attachment or download option.

**Traceability:** FR-028

---

### US-025: User Deletes Own Attachment
As a Team Member,
I want to delete attachments I have uploaded,
So that I can remove incorrect or unnecessary files.

**Acceptance Criteria:**
- Given I am on a task details page and I uploaded the attachment, when I click delete and confirm, then the attachment is permanently removed.
- Given I did not upload the attachment, when I view the task, then I do not see a delete option for that attachment.
- Given I delete an attachment, then the deletion is logged in the audit trail.

**Traceability:** FR-029

---

### US-026: User Edits Own Comment
As a Team Member,
I want to edit my own comments on a task,
So that I can correct or update my messages.

**Acceptance Criteria:**
- Given I am on a task details page and I authored a comment, when I click edit and submit changes, then the comment is updated.
- Given I edit a comment, then the edit timestamp is recorded and the original comment is preserved in the audit trail.
- Given I did not author the comment, when I view the task, then I do not see an edit option for that comment.

**Traceability:** FR-030

---

### US-027: User Deletes Own Comment
As a Team Member,
I want to delete my own comments on a task,
So that I can remove inappropriate or outdated messages.

**Acceptance Criteria:**
- Given I am on a task details page and I authored a comment, when I click delete and confirm, then the comment is marked as deleted.
- Given I delete a comment, then the comment content is preserved in the audit trail but hidden from the normal timeline view.
- Given I did not author the comment, when I view the task, then I do not see a delete option for that comment.

**Traceability:** FR-031

---

### US-028: Reopen Completed Task
As a Manager or Administrator,
I want to reopen a completed task,
So that I can resume work if needed.

**Acceptance Criteria:**
- Given a task is in Completed status, when I click Reopen and confirm, then the task status changes to In Progress.
- Given I am a Team Member and not the task creator, when I attempt to reopen a completed task, then I see a permission error (BR-009).
- Given I reopen a task, then the status change is logged in the activity timeline.

**Traceability:** BR-008, BR-009

---

## Epic 5: Notifications

### US-029: System Notifies on Task Assignment
As a Team Member,
I want to receive a notification when a task is assigned to me,
So that I am aware of new work.

**Acceptance Criteria:**
- Given a manager assigns a task to me, when the assignment is saved, then I receive an in-app notification and an email within 60 seconds.
- Given I have opted out of task assignment notifications, then I do not receive the notification.
- Given I receive a notification, when I click it, then I am taken to the assigned task.

**Traceability:** FR-019

---

### US-030: System Sends Due Date Reminders
As a Team Member,
I want to receive reminders before a task is due,
So that I can prioritize my work.

**Acceptance Criteria:**
- Given a task is assigned to me, has a due date within 24 hours, and is not completed, when the due date threshold is reached, then I receive an in-app notification and an email.
- Given I have opted out of due date reminders, then I do not receive the reminder.
- Given I complete the task before the reminder is sent, then no reminder is sent.

**Traceability:** FR-020

---

### US-031: System Notifies on Task Completion
As a Manager,
I want to receive a notification when a task I created or manage is completed,
So that I can track progress.

**Acceptance Criteria:**
- Given a task assigned to my team is marked as Completed, when the status changes, then I receive an in-app notification and an email within 60 seconds.
- Given I have opted out of task completion notifications, then I do not receive the notification.
- Given I receive a notification, when I click it, then I am taken to the completed task.

**Traceability:** FR-021

---

### US-032: User Configures Notification Preferences
As a logged-in user,
I want to configure which notifications I receive,
So that I am not overwhelmed by irrelevant messages.

**Acceptance Criteria:**
- Given I am on my notification settings page, when I toggle notification types on or off, then my preferences are saved.
- Given I opt out of a notification type, then I do not receive notifications of that type.
- Given I opt back in to a notification type, then I begin receiving those notifications again.

**Traceability:** SRS Notification Specifications

---

## Epic 2: Dashboard

### US-033: Dashboard Shows My Assigned Tasks
As a Manager or Team Member,
I want to see all tasks assigned to me on my dashboard,
So that I know what work I need to do.

**Acceptance Criteria:**
- Given I am logged in, when I view my dashboard, then I see a list of all tasks assigned to me, grouped by status.
- Given I have no assigned tasks, then I see an empty state message encouraging me to create or request tasks.

**Traceability:** FR-022

---

### US-034: Dashboard Shows My Overdue Tasks
As a Manager or Team Member,
I want to see my overdue tasks on my dashboard,
So that I can address them immediately.

**Acceptance Criteria:**
- Given I have tasks with due dates in the past that are not Completed, when I view my dashboard, then those tasks are displayed in an overdue section.
- Given I have no overdue tasks, then the overdue section is not displayed or shows a success message.

**Traceability:** FR-023

---

### US-035: Dashboard Shows My Completed Tasks
As a Manager or Team Member,
I want to see my recently completed tasks on my dashboard,
So that I can review my recent work.

**Acceptance Criteria:**
- Given I have tasks completed in the last 30 days, when I view my dashboard, then I see those tasks in a completed section.
- Given I have no tasks completed in the last 30 days, then the completed section is not displayed or shows an empty state.

**Traceability:** FR-024

---

### US-036: Dashboard Shows My Productivity Stats
As a Manager or Team Member,
I want to see my productivity statistics on my dashboard,
So that I can understand my performance.

**Acceptance Criteria:**
- Given I am on my dashboard, when I view the statistics section, then I see tasks completed this week, tasks overdue, and average task completion time.
- Given I have no task history, then the statistics show zero or N/A values.

**Traceability:** FR-025

---

### US-037: Business Owner Views Business Productivity
As a Business Owner,
I want to view organization-wide productivity metrics on my dashboard,
So that I can make informed decisions about the business.

**Acceptance Criteria:**
- Given I am logged in as a Business Owner (Manager role with org-wide scope), when I view my dashboard, then I see aggregate productivity metrics across all teams and projects.
- Given I view the dashboard, then I can identify blocked work, overdue tasks, and team performance at a glance.

**Traceability:** FR-025, Business Owner persona

---

## Epic 7: User Profile and Account

### US-038: User Changes Password
As a logged-in user,
I want to change my password from account settings,
So that I can maintain account security.

**Acceptance Criteria:**
- Given I am on my account settings page, when I enter my current password and a new password meeting complexity requirements, then my password is updated.
- Given I enter an incorrect current password, then I see an error message and the password is not changed.
- Given I enter a new password shorter than 8 characters, then I see a validation error.

**Traceability:** FR-026

---

### US-039: User Views Own Profile
As a logged-in user,
I want to view my own profile information,
So that I can verify my details.

**Acceptance Criteria:**
- Given I am logged in, when I navigate to my profile page, then I see my name, email, role, and profile picture.
- Given I have not uploaded a profile picture, then I see a default avatar.

**Traceability:** FR-027

---

## Epic 4: Task Management (continued)

### US-040: Activity Timeline Displayed on Task
As a Team Member,
I want to see an activity timeline on each task,
So that I can understand the history of changes.

**Acceptance Criteria:**
- Given I am on a task details page, when I view the activity timeline, then I see status changes, comments, and assignments in chronological order.
- Given an event occurs (status change, comment, assignment), when I refresh the timeline, then the event appears with the actor, timestamp, and description.

**Traceability:** FR-036

---

### US-041: User Searches Tasks
As a Team Member,
I want to search for tasks by title, description, assignee, or status,
So that I can quickly find specific work.

**Acceptance Criteria:**
- Given I am on a task list page, when I enter a search term, then tasks matching the term in title, description, assignee name, or status are displayed.
- Given I search for a term, then the results are case-insensitive and returned within 2 seconds.
- Given I search for a term with no matches, then I see a "no results" message.

**Traceability:** FR-034

---

### US-042: User Filters Tasks
As a Team Member,
I want to filter task lists by multiple criteria,
So that I can focus on specific subsets of work.

**Acceptance Criteria:**
- Given I am on a task list page, when I apply filters for status, priority, assignee, due date range, and project, then the task list shows only matching tasks.
- Given I apply multiple filters, then the filters are combined and the result count is displayed.
- Given I clear all filters, then all tasks are displayed again.

**Traceability:** FR-035

---

## Epic 9: Team Management

### US-043: Admin Creates Team
As an Administrator,
I want to create a team,
So that I can group users for easier task assignment and management.

**Acceptance Criteria:**
- Given I am on the teams page, when I enter a team name and select members, then the team is created.
- Given I attempt to create a team with no name, then I see a validation error.

**Traceability:** FR-037

---

### US-044: Admin Views Teams
As an Administrator,
I want to view all teams,
So that I can manage them.

**Acceptance Criteria:**
- Given I am on the teams page, when I view the team list, then I see all teams with their names and member counts.
- Given there are no teams, then I see an empty state message.

**Traceability:** FR-037

---

### US-045: Admin Edits Team
As an Administrator,
I want to edit team details,
So that team information remains accurate.

**Acceptance Criteria:**
- Given I am on a team details page, when I edit the team name or members and save, then the changes are saved.

**Traceability:** FR-037

---

### US-046: Admin Deletes Team
As an Administrator,
I want to delete a team,
So that outdated teams are removed.

**Acceptance Criteria:**
- Given I am on a team details page, when I confirm deletion, then the team is deleted.
- Given I delete a team, then the members' user accounts are not deleted and their task history remains intact.

**Traceability:** FR-037

---

### US-047: Manager Adds Team Member
As a Manager,
I want to add users to a team,
So that the team can collaborate on tasks.

**Acceptance Criteria:**
- Given I am on a team details page, when I select a user to add and confirm, then the user is added to the team.
- Given the user is already on the team, then I see an error message.

**Traceability:** FR-037

---

### US-048: Manager Removes Team Member
As a Manager,
I want to remove users from a team,
So that team membership remains accurate.

**Acceptance Criteria:**
- Given I am on a team details page, when I select a user to remove and confirm, then the user is removed from the team.
- Given I remove a user from a team, then the user's account and task history are not deleted.

**Traceability:** FR-037

---

## Epic 6: Reports & Analytics

### US-049: Manager Generates Basic Report
As a Manager,
I want to generate reports showing tasks by status, tasks by assignee, and overdue tasks,
So that I can understand project health.

**Acceptance Criteria:**
- Given I am on the reports page, when I select a report type and date range, then the report is generated and displayed in the browser.
- Given I view a report, then I see visualizations or tables showing the requested data.

**Traceability:** FR-038

---

### US-050: Manager Exports Report as CSV
As a Manager,
I want to export reports as CSV,
So that I can analyze data in external tools.

**Acceptance Criteria:**
- Given I am viewing a report, when I click Export CSV, then a CSV file containing the report data is downloaded.
- Given the report has no data, then the exported CSV contains headers but no data rows.

**Traceability:** FR-038
