# User Journeys

## Journey 1 — Manager Creates and Assigns a Task (Happy Path)

1. Open application.
2. Log in with valid credentials.
3. Dashboard loads.
4. Navigate to a project.
5. Click "Create Task".
6. Enter title.
7. Enter description.
8. Select project (pre-selected if navigated from project).
9. Select assignee.
10. Set priority.
11. Set due date.
12. Save task.
13. Assignee receives in-app and email notification within 60 seconds.
14. Task appears in manager's dashboard and assignee's dashboard.

**Expected Result:** The task is created with all specified details and both parties are notified.

---

## Journey 2 — Employee Completes Work (Happy Path)

1. Receive task assignment notification.
2. Open notification or navigate to dashboard.
3. Open assigned task.
4. Read requirements.
5. Update status to "In Progress".
6. Add comments if necessary.
7. Upload attachments.
8. Mark task as Completed.
9. Manager receives completion notification within 60 seconds.

**Expected Result:** Manager is notified of completion. Task status is updated across all views.

---

## Journey 3 — Business Owner Reviews Progress (Happy Path)

1. Log in as Business Owner (Manager role with org-wide scope).
2. Open Dashboard.
3. View organization-wide productivity summary.
4. Review overdue tasks across all projects.
5. Review team productivity statistics.
6. Identify blocked work.
7. Export productivity report as CSV.

**Expected Result:** Business owner quickly understands overall project health and can export data for further analysis.

---

## Journey 4 — Administrator Onboards a New User

1. Log in as Administrator.
2. Navigate to User Management.
3. Click "Create User".
4. Enter full name, email, role, and organization.
5. Save user account.
6. System sends invitation email to the new user.
7. New user receives email and clicks invitation link.
8. New user sets password.
9. New user account is activated.
10. New user can log in and access the system.

**Expected Result:** New user is onboarded without self-service registration. Administrator retains control of user access.

---

## Journey 5 — Administrator Creates a Project

1. Log in as Administrator.
2. Navigate to Projects.
3. Click "Create Project".
4. Enter project name and description.
5. Save project.
6. Project appears in project list.
7. Administrator can immediately begin creating tasks within the project.

**Expected Result:** Project is created and ready for task assignment.

---

## Journey 6 — User Searches and Filters Tasks

1. Log in as Manager or Team Member.
2. Navigate to Task List or Dashboard.
3. Enter search term in search box (e.g., task title, assignee name).
4. View search results within 2 seconds.
5. Apply filters: status = "In Progress", priority = "High", due date range = "This Week".
6. View filtered results with result count.
7. Clear filters to return to full task list.

**Expected Result:** User can quickly find specific tasks using combined search and filter criteria.

---

## Journey 7 — User Configures Notification Preferences

1. Log in.
2. Navigate to Account Settings.
3. Click "Notification Preferences".
4. Review default notification settings (task assigned, due date reminder, task completed).
5. Toggle off "Due Date Reminder" notifications.
6. Save preferences.
7. When a due date reminder would have been sent, no notification is received.
8. Toggle "Due Date Reminder" back on.
9. Save preferences.
10. Due date reminders are received again.

**Expected Result:** User has full control over which notifications they receive.

---

## Journey 8 — Manager Generates and Exports a Report

1. Log in as Manager.
2. Navigate to Reports.
3. Select report type: "Tasks by Assignee".
4. Select date range: "Last 30 Days".
5. Click "Generate Report".
6. Report displays in browser with charts and tables.
7. Click "Export CSV".
8. CSV file downloads with report data.
9. Open CSV in spreadsheet application for further analysis.

**Expected Result:** Manager can view and export reports for offline analysis.

---

## Journey 9 — User Resets Forgotten Password

1. Navigate to login page.
2. Click "Forgot Password".
3. Enter registered email address.
4. Submit request.
5. Receive password reset email within 60 seconds.
6. Click reset link in email.
7. Enter new password (minimum 8 characters).
8. Confirm new password.
9. Submit form.
10. Log in with new password.
11. Old password no longer works.

**Expected Result:** User can regain access to their account without administrator assistance.

---

## Journey 10 — Manager Reassigns a Task

1. Log in as Manager.
2. Navigate to task details page.
3. Click "Edit" or "Reassign".
4. Select new assignee from dropdown.
5. Save changes.
6. Previous assignee receives notification that task has been reassigned.
7. Task is removed from previous assignee's dashboard.
8. New assignee receives task assignment notification.
9. Task appears on new assignee's dashboard.

**Expected Result:** Task ownership is transferred seamlessly with appropriate notifications.

---

## Journey 11 — User Encounters Permission Denied (Error Path)

1. Log in as Team Member (not a Manager).
2. Attempt to navigate to Admin settings or User Management page.
3. System displays "Access Denied" or redirects to dashboard.
4. User sees message explaining insufficient permissions.
5. User can navigate back to accessible areas of the application.

**Expected Result:** Unauthorized access is prevented with a clear user-facing message. No system errors or crashes occur.

---

## Journey 12 — User Encounters Concurrent Edit Conflict (Error Path)

1. Manager A opens a task for editing.
2. Manager B opens the same task for editing.
3. Manager B saves changes first.
4. Manager A attempts to save changes.
5. System detects version conflict (optimistic locking).
6. System displays "409 Conflict" error with both versions.
7. Manager A reviews differences and manually merges or accepts Manager B's changes.
8. Manager A saves resolved version.

**Expected Result:** Data loss is prevented. Both users are aware of the conflict and can resolve it explicitly.

---

## Journey 13 — User Uploads an Oversized Attachment (Error Path)

1. Log in as Team Member.
2. Navigate to task details page.
3. Attempt to upload a file exceeding 10 MB or an unsupported format.
4. System displays error message: "File exceeds maximum size of 10 MB" or "Unsupported file format".
5. Upload is rejected.
6. User selects a valid file.
7. Upload succeeds.

**Expected Result:** Invalid uploads are rejected with clear error messages. Valid uploads succeed.

---

## Journey 14 — Deactivated User Attempts to Log In (Error Path)

1. Administrator deactivates a user account.
2. Deactivated user attempts to log in.
3. System displays error: "Your account has been deactivated. Please contact your administrator."
4. User cannot access the system.
5. Administrator can reactivate the user if needed.

**Expected Result:** Deactivated users are prevented from accessing the system with a clear message.

---

## Journey 15 — User Encounters Empty State (No Tasks)

1. Log in as a new Team Member with no assigned tasks.
2. Navigate to Dashboard.
3. Dashboard displays empty state message: "You have no assigned tasks. Create a new task or ask your manager to assign work to you."
4. User sees option to browse available projects or request tasks.
5. When tasks are assigned, the empty state is replaced with task lists.

**Expected Result:** Empty states are graceful and provide guidance rather than appearing broken.

---

## Journey 11 — Administrator Manages Teams

1. Log in as Administrator.
2. Navigate to Teams.
3. Click "Create Team".
4. Enter team name.
5. Select members from user list.
6. Save team.
7. Team appears in team list with member count.
8. Edit team name or members.
9. Remove a member from team.
10. Member's account and task history remain intact.
11. Delete team.
12. Team is removed; members are unaffected.

**Expected Result:** Teams can be fully managed without impacting user accounts or task history.
