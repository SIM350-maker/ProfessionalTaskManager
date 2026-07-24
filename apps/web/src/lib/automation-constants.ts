export const TRIGGER_LABELS = {
  TASK_CREATED: 'Task Created',
  TASK_UPDATED: 'Task Updated',
  TASK_STATUS_CHANGED: 'Task Status Changed',
  TASK_OVERDUE: 'Task Overdue',
  TASK_ASSIGNED: 'Task Assigned',
  TASK_COMPLETED: 'Task Completed',
  COMMENT_ADDED: 'Comment Added',
  PROJECT_CREATED: 'Project Created',
} as const;

export const ACTION_LABELS = {
  SET_STATUS: 'Set Status',
  SET_PRIORITY: 'Set Priority',
  ASSIGN_USER: 'Assign User',
  ADD_LABEL: 'Add Label',
  SEND_NOTIFICATION: 'Send Notification',
  CREATE_TASK: 'Create Task',
  UPDATE_FIELD: 'Update Custom Field',
} as const;
