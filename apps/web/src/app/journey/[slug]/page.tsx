import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Zap, Users, FolderKanban, BarChart3, Bell, Settings, ClipboardList } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

type RoleKey = 'ADMINISTRATOR' | 'MANAGER' | 'TEAM_MEMBER' | 'PERSONAL';

interface JourneyPage {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  roles: Record<RoleKey, {
    label: string;
    entryPoint: string;
    howToAccess: string[];
    keyComponents: { name: string; description: string }[];
    interactions: string[];
    tips: string[];
    nextSteps: { title: string; href: string }[];
  }>;
}

const journeyPages: Record<string, JourneyPage> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Your command center for understanding what needs attention, tracking progress, and taking quick actions.',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'from-accent-blue to-accent-purple',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → Admin Dashboard (/admin) or main Dashboard (/dashboard)',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to /admin for system-wide view or /dashboard for personal overview',
          'The dashboard loads real-time data from all projects and users in the organization',
        ],
        keyComponents: [
          { name: 'KPI Cards', description: 'Show total users, projects, tasks, and active counts at a glance.' },
          { name: 'Status Distribution', description: 'Pie chart breaking down tasks by status (Todo, In Progress, Done, etc.).' },
          { name: 'Priority Chart', description: 'Bar chart showing task distribution across priority levels.' },
          { name: 'Productivity Chart', description: 'Line chart showing completion trends over time.' },
          { name: 'Recent Users', description: 'List of recently joined team members for admin oversight.' },
          { name: 'Overdue Tasks', description: 'Visual alert for tasks past their due date requiring intervention.' },
        ],
        interactions: [
          'Click KPI cards to filter related task lists',
          'Use date range selectors to change analytics period',
          'Hover over charts for detailed tooltips with counts',
          'Click "Export" to download reports as CSV',
        ],
        tips: [
          'Check the dashboard first thing each morning',
          'Use the admin dashboard for org health, main dashboard for personal focus',
          'Set up notifications to get alerts without constant checking',
        ],
        nextSteps: [
          { title: 'Manage Users', href: '/journey/users' },
          { title: 'Review Projects', href: '/journey/projects' },
          { title: 'View Reports', href: '/journey/reports' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /dashboard',
        howToAccess: [
          'Sign in with Manager credentials',
          'Your default landing page after login is the Dashboard',
          'Data is scoped to projects you own or manage',
        ],
        keyComponents: [
          { name: 'My Tasks', description: 'KPI showing your personal assigned task count.' },
          { name: 'Managed Projects', description: 'KPI showing projects under your management.' },
          { name: 'Team Tasks', description: 'KPI showing total tasks across your managed projects.' },
          { name: 'Overdue Tasks', description: 'KPI and list highlighting tasks past due date.' },
          { name: 'My Projects', description: 'Grid of projects you own with task counts and status.' },
          { name: 'Completion Rate', description: 'Circular progress showing managed project completion.' },
        ],
        interactions: [
          'Click project cards to navigate to project detail',
          'Use status filters to view tasks by workflow stage',
          'Click task rows to open detailed task views',
          'Use the board/calendar toggle for different perspectives',
        ],
        tips: [
          'Review overdue tasks daily and reassign if needed',
          'Use the board view for sprint planning',
          'Check completion rates before team standups',
        ],
        nextSteps: [
          { title: 'Create a Project', href: '/journey/projects' },
          { title: 'Assign Tasks', href: '/journey/tasks' },
          { title: 'Build Teams', href: '/journey/teams' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'Login → /dashboard',
        howToAccess: [
          'Sign in with Team Member credentials',
          'Your default landing page after login is the Dashboard',
          'Data shows only tasks assigned to you',
        ],
        keyComponents: [
          { name: 'Total Tasks', description: 'Count of all tasks assigned to you.' },
          { name: 'Active Tasks', description: 'Tasks currently in progress or todo.' },
          { name: 'Overdue Tasks', description: 'Tasks past due date needing attention.' },
          { name: 'My Active Tasks', description: 'List of active tasks with project context.' },
          { name: 'Recent Completions', description: 'List of recently completed tasks with dates.' },
        ],
        interactions: [
          'Click task titles to open task detail',
          'Use status buttons to update task progress',
          'Click project names to view project context',
          'Check the activity feed for recent updates',
        ],
        tips: [
          'Update task status daily for accurate tracking',
          'Use the activity feed to see recent changes',
          'Check due dates regularly to avoid overdue tasks',
        ],
        nextSteps: [
          { title: 'View Your Tasks', href: '/journey/tasks' },
          { title: 'Update Profile', href: '/journey/profile' },
          { title: 'Adjust Settings', href: '/journey/settings' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'Login → /dashboard',
        howToAccess: [
          'Sign in with your personal account',
          'Your default landing page is the personal Dashboard',
          'Data shows only your personal tasks and projects',
        ],
        keyComponents: [
          { name: 'My Tasks', description: 'Count of all your personal tasks.' },
          { name: 'Active Tasks', description: 'Tasks currently in progress or todo.' },
          { name: 'Overdue Tasks', description: 'Tasks past due date.' },
          { name: 'Completed Tasks', description: 'Tasks you have finished.' },
          { name: 'Status Distribution', description: 'Chart showing task breakdown by status.' },
          { name: 'Priority Chart', description: 'Chart showing task breakdown by priority.' },
        ],
        interactions: [
          'Click task titles to open task detail',
          'Use status buttons to update progress',
          'Click "New Task" to create tasks from templates',
          'Use board/calendar views for different perspectives',
        ],
        tips: [
          'Use task templates to quickly create recurring tasks',
          'Update status regularly to track progress',
          'Use the calendar view for deadline management',
        ],
        nextSteps: [
          { title: 'Create a Task', href: '/journey/tasks' },
          { title: 'Manage Projects', href: '/journey/projects' },
          { title: 'Adjust Settings', href: '/journey/settings' },
        ],
      },
    },
  },
  tasks: {
    title: 'Tasks',
    description: 'The central hub for all work items. Create, assign, track, and complete tasks across projects.',
    icon: <ClipboardList className="h-6 w-6" />,
    color: 'from-accent-green to-accent-cyan',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /tasks',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Tasks from the sidebar or go directly to /tasks',
          'View all tasks across all projects in the organization',
        ],
        keyComponents: [
          { name: 'Task Table', description: 'Sortable, filterable list of all tasks with inline editing.' },
          { name: 'Bulk Actions', description: 'Select multiple tasks to update status, assign, or delete in bulk.' },
          { name: 'Task Filters', description: 'Filter by project, status, priority, assignee, and date range.' },
          { name: 'Board View', description: 'Kanban-style board for visualizing task workflow.' },
          { name: 'Calendar View', description: 'Calendar layout showing tasks by due date.' },
          { name: 'New Task Button', description: 'Opens the task creation form with all available fields.' },
        ],
        interactions: [
          'Click task title to open detail view',
          'Double-click title to edit inline',
          'Drag cards in board view to change status',
          'Use bulk actions for mass updates',
          'Click filters to narrow down task list',
        ],
        tips: [
          'Use keyboard shortcuts for faster navigation',
          'Save filter views for common queries',
          'Use the board view for sprint planning',
        ],
        nextSteps: [
          { title: 'Create a Project', href: '/journey/projects' },
          { title: 'Set Up Workflows', href: '/journey/settings' },
          { title: 'Review Reports', href: '/journey/reports' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /tasks',
        howToAccess: [
          'Sign in with Manager credentials',
          'Navigate to Tasks from sidebar',
          'View tasks from all projects you manage',
        ],
        keyComponents: [
          { name: 'Task List', description: 'Table showing tasks with project, assignee, status, priority, and due date.' },
          { name: 'Inline Edit', description: 'Click any task title to quickly rename it.' },
          { name: 'Status Badges', description: 'Color-coded badges for quick status identification.' },
          { name: 'Priority Badges', description: 'Visual indicators for task urgency.' },
          { name: 'Assignee Avatars', description: 'Visual representation of who is working on each task.' },
        ],
        interactions: [
          'Click task row to view full details',
          'Use the "New Task" button to create and assign work',
          'Filter by project to focus on specific initiatives',
          'Use bulk assign to distribute work efficiently',
        ],
        tips: [
          'Create tasks from templates for consistency',
          'Use priorities to guide team focus',
          'Review overdue tasks daily',
        ],
        nextSteps: [
          { title: 'Create a Task', href: '/journey/tasks' },
          { title: 'Build Your Team', href: '/journey/teams' },
          { title: 'View Reports', href: '/journey/reports' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'Login → /tasks',
        howToAccess: [
          'Sign in with Team Member credentials',
          'Navigate to Tasks from sidebar',
          'View only tasks assigned to you',
        ],
        keyComponents: [
          { name: 'My Tasks List', description: 'Focused view of only your assigned tasks.' },
          { name: 'Status Update', description: 'Quick buttons to move tasks through workflow stages.' },
          { name: 'Due Date Indicator', description: 'Visual warning for overdue or upcoming deadlines.' },
          { name: 'Task Detail', description: 'Full view with description, comments, and activity log.' },
        ],
        interactions: [
          'Click task to view details and add comments',
          'Use status buttons to update progress',
          'Click project name to see project context',
          'Use search to find specific tasks',
        ],
        tips: [
          'Update status regularly for accurate tracking',
          'Add comments to ask questions early',
          'Check due dates at the start of each day',
        ],
        nextSteps: [
          { title: 'Update Your Profile', href: '/journey/profile' },
          { title: 'Check Notifications', href: '/journey/notifications' },
          { title: 'Adjust Settings', href: '/journey/settings' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'Login → /tasks',
        howToAccess: [
          'Sign in with your personal account',
          'Navigate to Tasks from sidebar',
          'View all tasks in your personal workspace',
        ],
        keyComponents: [
          { name: 'Task Table', description: 'List of all your personal tasks with inline editing.' },
          { name: 'New Task Button', description: 'Create tasks with access to your personal templates.' },
          { name: 'Board View', description: 'Kanban board for personal task management.' },
          { name: 'Calendar View', description: 'Calendar view for deadline tracking.' },
        ],
        interactions: [
          'Create tasks using templates for recurring work',
          'Move tasks through statuses as you progress',
          'Use the board view for visual organization',
          'Set due dates for deadline management',
        ],
        tips: [
          'Use templates for recurring tasks like standups',
          'Keep tasks small and actionable',
          'Review and archive completed tasks weekly',
        ],
        nextSteps: [
          { title: 'View Your Dashboard', href: '/journey/dashboard' },
          { title: 'Manage Projects', href: '/journey/projects' },
          { title: 'Adjust Settings', href: '/journey/settings' },
        ],
      },
    },
  },
  projects: {
    title: 'Projects',
    description: 'Organize work into projects. Set scope, assign leads, define milestones, and track progress.',
    icon: <FolderKanban className="h-6 w-6" />,
    color: 'from-accent-purple to-accent-pink',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /projects',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Projects from the sidebar',
          'View and manage all projects across the organization',
        ],
        keyComponents: [
          { name: 'Project Grid', description: 'Visual cards showing project status, task counts, and progress.' },
          { name: 'Search & Filters', description: 'Find projects by name, status, or sort by creation date.' },
          { name: 'New Project Button', description: 'Create projects with name, description, dates, and visibility settings.' },
          { name: 'Project Detail', description: 'Deep-dive view with tasks, members, timeline, and discussions.' },
        ],
        interactions: [
          'Click project card to view details',
          'Use search to find specific projects',
          'Filter by status to see active vs archived work',
          'Click "New Project" to create initiatives',
        ],
        tips: [
          'Use clear naming conventions for projects',
          'Set visibility appropriately for sensitive work',
          'Assign project leads for accountability',
        ],
        nextSteps: [
          { title: 'Create Tasks', href: '/journey/tasks' },
          { title: 'Assign Teams', href: '/journey/teams' },
          { title: 'View Reports', href: '/journey/reports' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /projects',
        howToAccess: [
          'Sign in with Manager credentials',
          'Navigate to Projects from sidebar',
          'View projects you own or are a member of',
        ],
        keyComponents: [
          { name: 'Project Cards', description: 'Cards showing project health, task progress, and team activity.' },
          { name: 'Task Count Badge', description: 'Quick view of how many tasks are in each project.' },
          { name: 'Status Indicators', description: 'Color-coded status showing project phase.' },
          { name: 'Project Actions', description: 'Edit, view tasks, and manage project settings.' },
        ],
        interactions: [
          'Click card to open project detail',
          'Use "New Task" from project to create context-aware tasks',
          'View project timeline for milestone tracking',
          'Assign project leads through edit form',
        ],
        tips: [
          'Create a project for each major initiative',
          'Set clear start and end dates',
          'Use the project lead field to designate ownership',
        ],
        nextSteps: [
          { title: 'Add Team Members', href: '/journey/teams' },
          { title: 'Create Tasks', href: '/journey/tasks' },
          { title: 'Track Progress', href: '/journey/reports' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'Login → /projects (view only)',
        howToAccess: [
          'Sign in with Team Member credentials',
          'Navigate to Projects from sidebar',
          'View projects you are a member of (read-only)',
        ],
        keyComponents: [
          { name: 'Project List', description: 'Cards showing projects you can contribute to.' },
          { name: 'Task Counts', description: 'Quick view of project activity.' },
          { name: 'Project Links', description: 'Click to view project tasks and details.' },
        ],
        interactions: [
          'Click project to view tasks',
          'See project context for your assigned work',
          'Navigate to tasks from project view',
        ],
        tips: [
          'Check projects regularly for new assignments',
          'Use project descriptions for context',
          'Navigate to tasks to update your work',
        ],
        nextSteps: [
          { title: 'View Your Tasks', href: '/journey/tasks' },
          { title: 'Check Dashboard', href: '/journey/dashboard' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'Login → /projects',
        howToAccess: [
          'Sign in with your personal account',
          'Navigate to Projects from sidebar',
          'View and manage your personal projects',
        ],
        keyComponents: [
          { name: 'Personal Projects', description: 'Cards showing your private projects.' },
          { name: 'New Project Button', description: 'Create additional personal projects.' },
          { name: 'Task Counts', description: 'See how many tasks in each project.' },
        ],
        interactions: [
          'Click project to view tasks',
          'Create new personal projects',
          'Use the default "Personal Tasks" project or create custom ones',
        ],
        tips: [
          'Use projects to organize different areas of your life',
          'Create separate projects for work, personal, and learning goals',
          'Keep projects focused and actionable',
        ],
        nextSteps: [
          { title: 'Create a Task', href: '/journey/tasks' },
          { title: 'View Dashboard', href: '/journey/dashboard' },
        ],
      },
    },
  },
  teams: {
    title: 'Teams',
    description: 'Build and manage teams. Add members, distribute work, and maintain team-level visibility.',
    icon: <Users className="h-6 w-6" />,
    color: 'from-accent-amber to-accent-orange',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /teams',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Teams from sidebar',
          'View all teams across the organization',
        ],
        keyComponents: [
          { name: 'Team Grid', description: 'Cards showing team members, descriptions, and activity.' },
          { name: 'Member Avatars', description: 'Visual display of team composition.' },
          { name: 'Team Actions', description: 'Create, edit, and manage team memberships.' },
        ],
        interactions: [
          'Click team card to view details',
          'Add/remove members from team detail',
          'Create new teams for different departments',
        ],
        tips: [
          'Create teams aligned with organizational structure',
          'Keep teams small enough to be manageable',
          'Review team memberships regularly',
        ],
        nextSteps: [
          { title: 'View Projects', href: '/journey/projects' },
          { title: 'Assign Tasks', href: '/journey/tasks' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /teams',
        howToAccess: [
          'Sign in with Manager credentials',
          'Navigate to Teams from sidebar',
          'View and manage your teams',
        ],
        keyComponents: [
          { name: 'Team Cards', description: 'Overview of your teams with member counts.' },
          { name: 'Member List', description: 'Detailed view of team members with roles.' },
          { name: 'Add Member', description: 'Form to add existing users to teams.' },
        ],
        interactions: [
          'Click team to view members',
          'Add members from organization users',
          'Remove members when needed',
          'Create teams for different initiatives',
        ],
        tips: [
          'Create teams before assigning tasks',
          'Balance team sizes for effective collaboration',
          'Use teams to organize by function or project',
        ],
        nextSteps: [
          { title: 'Create Tasks', href: '/journey/tasks' },
          { title: 'View Reports', href: '/journey/reports' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'N/A (redirects to dashboard)',
        howToAccess: [
          'Team members do not have direct access to Teams page',
          'You are automatically part of teams assigned to your projects',
          'View team context through project pages',
        ],
        keyComponents: [],
        interactions: [],
        tips: [],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Check Tasks', href: '/journey/tasks' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'N/A (not available in personal mode)',
        howToAccess: [
          'Teams are not available in personal mode',
          'Focus on individual task management',
          'Consider upgrading to organization mode for team features',
        ],
        keyComponents: [],
        interactions: [],
        tips: [],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Create Tasks', href: '/journey/tasks' },
        ],
      },
    },
  },
  reports: {
    title: 'Reports',
    description: 'Analyze team performance, track completion rates, and export insights for stakeholders.',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'from-accent-cyan to-accent-blue',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /reports',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Reports from sidebar',
          'View organization-wide analytics and metrics',
        ],
        keyComponents: [
          { name: 'KPI Cards', description: 'Total tasks, completed, overdue, and active member counts.' },
          { name: 'Heatmap', description: 'Daily task completion intensity over the last 8 weeks.' },
          { name: 'Status Chart', description: 'Pie chart showing task distribution by status.' },
          { name: 'Priority Chart', description: 'Donut chart showing tasks by priority level.' },
          { name: 'Trend Line', description: 'Weekly completion trends showing velocity.' },
          { name: 'Export Button', description: 'Download reports as CSV for external analysis.' },
        ],
        interactions: [
          'Hover over charts for detailed metrics',
          'Use export to download data',
          'Filter by date range using the date picker',
          'Click through to individual tasks from reports',
        ],
        tips: [
          'Review reports weekly with leadership',
          'Use heatmaps to identify productivity patterns',
          'Export data for quarterly reviews',
        ],
        nextSteps: [
          { title: 'Manage Users', href: '/journey/users' },
          { title: 'View Dashboard', href: '/journey/dashboard' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /reports',
        howToAccess: [
          'Sign in with Manager credentials',
          'Navigate to Reports from sidebar',
          'View reports for projects you manage',
        ],
        keyComponents: [
          { name: 'Completion Rate', description: 'Percentage of tasks completed in your projects.' },
          { name: 'Overdue Analysis', description: 'List of overdue tasks with days overdue.' },
          { name: 'Team Performance', description: 'Metrics showing team velocity and throughput.' },
          { name: 'Priority Distribution', description: 'Breakdown of tasks by priority level.' },
        ],
        interactions: [
          'Click overdue tasks to view details',
          'Export reports for stakeholder updates',
          'Filter by project for focused analysis',
        ],
        tips: [
          'Share reports after major milestones',
          'Use overdue analysis to identify blockers',
          'Track completion rates over time',
        ],
        nextSteps: [
          { title: 'View Projects', href: '/journey/projects' },
          { title: 'Check Tasks', href: '/journey/tasks' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'Login → /reports (personal reports)',
        howToAccess: [
          'Sign in with Team Member credentials',
          'Navigate to Reports from sidebar',
          'View your personal task statistics',
        ],
        keyComponents: [
          { name: 'My Stats', description: 'Personal task counts, completion rate, and breakdown.' },
          { name: 'Task Breakdown', description: 'Visual breakdown of your tasks by status.' },
          { name: 'Open Tasks', description: 'List of your active and overdue tasks.' },
        ],
        interactions: [
          'View your personal productivity trends',
          'Export your task data if needed',
          'Identify areas for improvement',
        ],
        tips: [
          'Review your stats weekly',
          'Focus on reducing overdue tasks',
          'Use insights to improve your workflow',
        ],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Update Tasks', href: '/journey/tasks' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'N/A (use dashboard instead)',
        howToAccess: [
          'Reports are focused on organizational data',
          'Use your personal Dashboard for analytics',
          'View your productivity charts and task breakdowns there',
        ],
        keyComponents: [],
        interactions: [],
        tips: [],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Create Tasks', href: '/journey/tasks' },
        ],
      },
    },
  },
  notifications: {
    title: 'Notifications',
    description: 'Stay informed with real-time alerts on task updates, mentions, and project changes.',
    icon: <Bell className="h-6 w-6" />,
    color: 'from-accent-amber to-accent-yellow',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /notifications',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Notifications from sidebar',
          'Configure alert preferences for all org events',
        ],
        keyComponents: [
          { name: 'Notification List', description: 'Chronological list of all notifications with read/unread status.' },
          { name: 'Filter Tabs', description: 'Filter by unread, mentions, or all notifications.' },
          { name: 'Notification Settings', description: 'Configure email and in-app notification preferences.' },
          { name: 'Mark as Read', description: 'Individual or bulk mark notifications as read.' },
        ],
        interactions: [
          'Click notification to navigate to related item',
          'Use filters to focus on specific types',
          'Configure settings in Settings page',
          'Mark all as read to clear the list',
        ],
        tips: [
          'Enable critical alerts for immediate issues',
          'Use email digests to reduce noise',
          'Review notifications daily',
        ],
        nextSteps: [
          { title: 'Configure Settings', href: '/journey/settings' },
          { title: 'View Dashboard', href: '/journey/dashboard' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /notifications',
        howToAccess: [
          'Sign in with Manager credentials',
          'Navigate to Notifications from sidebar',
          'Receive alerts on project and task updates',
        ],
        keyComponents: [
          { name: 'Notification Feed', description: 'Updates on tasks, projects, and team activity.' },
          { name: 'Mentions', description: 'Notifications when you are mentioned in comments.' },
          { name: 'Task Alerts', description: 'Updates on tasks you created or are assigned to.' },
        ],
        interactions: [
          'Click notification to jump to the item',
          'Mark as read after reviewing',
          'Configure notification channels in settings',
        ],
        tips: [
          'Enable mentions for direct collaboration',
          'Use notifications to catch blockers early',
          'Review notifications between meetings',
        ],
        nextSteps: [
          { title: 'View Tasks', href: '/journey/tasks' },
          { title: 'Check Dashboard', href: '/journey/dashboard' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'Login → /notifications',
        howToAccess: [
          'Sign in with Team Member credentials',
          'Navigate to Notifications from sidebar',
          'Receive alerts on your assigned tasks',
        ],
        keyComponents: [
          { name: 'My Notifications', description: 'Updates relevant to your work.' },
          { name: 'Task Mentions', description: 'When someone mentions you in a task comment.' },
          { name: 'Status Changes', description: 'When a task you are involved with changes status.' },
        ],
        interactions: [
          'Click to navigate to the related task or project',
          'Mark as read to clear your queue',
          'Configure notification preferences',
        ],
        tips: [
          'Enable both in-app and email for critical updates',
          'Check notifications at the start of your day',
          'Respond to mentions promptly',
        ],
        nextSteps: [
          { title: 'View Tasks', href: '/journey/tasks' },
          { title: 'Update Profile', href: '/journey/profile' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'Login → /notifications',
        howToAccess: [
          'Sign in with your personal account',
          'Navigate to Notifications from sidebar',
          'Receive alerts on your personal tasks',
        ],
        keyComponents: [
          { name: 'Personal Notifications', description: 'Updates on your tasks and projects.' },
          { name: 'Task Updates', description: 'Alerts when task status changes.' },
        ],
        interactions: [
          'Click notification to view task',
          'Mark as read to clear',
          'Configure notification preferences',
        ],
        tips: [
          'Enable notifications for deadline reminders',
          'Check notifications daily',
        ],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Create Tasks', href: '/journey/tasks' },
        ],
      },
    },
  },
  settings: {
    title: 'Settings',
    description: 'Customize your experience with theme preferences, notification channels, and account settings.',
    icon: <Settings className="h-6 w-6" />,
    color: 'from-gray-500 to-gray-700',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /settings',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Settings from sidebar',
          'Access personal preferences and org-level settings',
        ],
        keyComponents: [
          { name: 'Profile Settings', description: 'Update your name, email, avatar, and contact info.' },
          { name: 'Theme Settings', description: 'Choose light, dark, or system theme.' },
          { name: 'Notification Settings', description: 'Configure email and in-app notification preferences.' },
          { name: 'Language & Timezone', description: 'Set your preferred language and timezone.' },
          { name: 'Security Settings', description: 'Update password and enable two-factor authentication.' },
          { name: 'Org Settings', description: 'Admin-only: Configure organization settings, Slack integration, and workflows.' },
        ],
        interactions: [
          'Toggle switches for immediate setting changes',
          'Save buttons for form submissions',
          'Tab navigation between setting categories',
          'Upload avatar image',
        ],
        tips: [
          'Enable dark mode for reduced eye strain',
          'Set your timezone for accurate date displays',
          'Enable 2FA for enhanced security',
        ],
        nextSteps: [
          { title: 'Manage Organization', href: '/journey/settings' },
          { title: 'View Dashboard', href: '/journey/dashboard' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /settings',
        howToAccess: [
          'Sign in with Manager credentials',
          'Navigate to Settings from sidebar',
          'Configure personal preferences',
        ],
        keyComponents: [
          { name: 'Profile Tab', description: 'Update personal information and avatar.' },
          { name: 'Notifications Tab', description: 'Configure email and in-app alerts.' },
          { name: 'Preferences Tab', description: 'Theme, language, and timezone settings.' },
        ],
        interactions: [
          'Toggle notification channels on/off',
          'Change theme with instant preview',
          'Update profile information',
        ],
        tips: [
          'Enable desktop notifications for faster response',
          'Set your working hours for accurate scheduling',
        ],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Manage Projects', href: '/journey/projects' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'Login → /settings',
        howToAccess: [
          'Sign in with Team Member credentials',
          'Navigate to Settings from sidebar',
          'Update your personal preferences',
        ],
        keyComponents: [
          { name: 'Profile', description: 'Update name, email, and avatar.' },
          { name: 'Notifications', description: 'Choose how you receive alerts.' },
          { name: 'Preferences', description: 'Theme and language settings.' },
        ],
        interactions: [
          'Toggle notification channels',
          'Change theme preference',
          'Update profile information',
        ],
        tips: [
          'Enable email notifications for important updates',
          'Use dark mode for long work sessions',
        ],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Check Tasks', href: '/journey/tasks' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'Login → /settings',
        howToAccess: [
          'Sign in with your personal account',
          'Navigate to Settings from sidebar',
          'Configure your personal preferences',
        ],
        keyComponents: [
          { name: 'Profile', description: 'Update your personal information.' },
          { name: 'Notifications', description: 'Configure task and project alerts.' },
          { name: 'Preferences', description: 'Theme and language settings.' },
          { name: 'Upgrade CTA', description: 'Option to create an organization for team features.' },
        ],
        interactions: [
          'Toggle notification preferences',
          'Change theme and language',
          'Click "Create Organization" to upgrade',
        ],
        tips: [
          'Set up notifications for deadline reminders',
          'Use the upgrade option when ready to collaborate',
        ],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Create Tasks', href: '/journey/tasks' },
        ],
      },
    },
  },
  profile: {
    title: 'Profile',
    description: 'Manage your personal information, avatar, and contact details for better collaboration.',
    icon: <Users className="h-6 w-6" />,
    color: 'from-accent-green to-accent-emerald',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /profile',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Profile from sidebar or user menu',
          'Update your public profile information',
        ],
        keyComponents: [
          { name: 'Avatar', description: 'Upload or change your profile picture.' },
          { name: 'Name Fields', description: 'Update first name, last name, and display name.' },
          { name: 'Contact Info', description: 'Add or update email and phone number.' },
          { name: 'Role Display', description: 'View your current role and permissions.' },
        ],
        interactions: [
          'Click avatar to upload new image',
          'Edit fields inline or via form',
          'Save changes to update profile',
        ],
        tips: [
          'Use a professional avatar for better recognition',
          'Keep contact info current for team communication',
        ],
        nextSteps: [
          { title: 'View Settings', href: '/journey/settings' },
          { title: 'Go to Dashboard', href: '/journey/dashboard' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'Login → /profile',
        howToAccess: [
          'Sign in with Manager credentials',
          'Navigate to Profile from sidebar',
          'Update your information for team visibility',
        ],
        keyComponents: [
          { name: 'Profile Picture', description: 'Upload an avatar for team recognition.' },
          { name: 'Contact Details', description: 'Update email and phone for collaboration.' },
          { name: 'Job Title', description: 'Add your role for context.' },
        ],
        interactions: [
          'Upload avatar image',
          'Edit contact information',
          'Save changes',
        ],
        tips: [
          'Add a clear profile photo',
          'Include your department for better context',
        ],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Manage Teams', href: '/journey/teams' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'Login → /profile',
        howToAccess: [
          'Sign in with Team Member credentials',
          'Navigate to Profile from sidebar',
          'Update your information for team collaboration',
        ],
        keyComponents: [
          { name: 'Avatar Upload', description: 'Add a profile picture.' },
          { name: 'Name & Email', description: 'Update your basic information.' },
          { name: 'Job Title', description: 'Add your role or title.' },
        ],
        interactions: [
          'Click to upload avatar',
          'Edit name and contact info',
          'Save changes',
        ],
        tips: [
          'Use a recognizable avatar',
          'Keep your info up to date',
        ],
        nextSteps: [
          { title: 'View Tasks', href: '/journey/tasks' },
          { title: 'Check Dashboard', href: '/journey/dashboard' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'Login → /profile',
        howToAccess: [
          'Sign in with your personal account',
          'Navigate to Profile from sidebar',
          'Update your personal information',
        ],
        keyComponents: [
          { name: 'Profile Picture', description: 'Upload an avatar.' },
          { name: 'Personal Info', description: 'Update name and email.' },
        ],
        interactions: [
          'Upload avatar',
          'Edit personal details',
          'Save changes',
        ],
        tips: [
          'Keep your profile current',
        ],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Create Tasks', href: '/journey/tasks' },
        ],
      },
    },
  },
  users: {
    title: 'User Management',
    description: 'Invite, manage, and organize team members. Assign roles and maintain security.',
    icon: <Users className="h-6 w-6" />,
    color: 'from-accent-blue to-accent-indigo',
    roles: {
      ADMINISTRATOR: {
        label: 'Administrator',
        entryPoint: 'Login → /admin/users',
        howToAccess: [
          'Sign in with Administrator credentials',
          'Navigate to Admin → Users from sidebar',
          'View and manage all organization members',
        ],
        keyComponents: [
          { name: 'User Table', description: 'List of all users with roles, status, and activity.' },
          { name: 'Search & Filter', description: 'Find users by name, email, or role.' },
          { name: 'Add User', description: 'Invite new members with email and role assignment.' },
          { name: 'Bulk Actions', description: 'Activate, deactivate, or change roles for multiple users.' },
          { name: 'User Detail', description: 'View detailed user information and activity.' },
        ],
        interactions: [
          'Click user row to view details',
          'Use search to find specific users',
          'Bulk select for mass actions',
          'Edit user roles and permissions',
        ],
        tips: [
          'Use roles to enforce least-privilege access',
          'Regularly review active users',
          'Deactivate rather than delete for audit trails',
        ],
        nextSteps: [
          { title: 'Create Projects', href: '/journey/projects' },
          { title: 'Configure Org Settings', href: '/journey/settings' },
        ],
      },
      MANAGER: {
        label: 'Manager',
        entryPoint: 'N/A (read-only or limited)',
        howToAccess: [
          'Managers typically view team members through project and task interfaces',
          'User management is primarily an Admin function',
          'View team composition through project pages',
        ],
        keyComponents: [],
        interactions: [],
        tips: [],
        nextSteps: [
          { title: 'View Projects', href: '/journey/projects' },
          { title: 'Assign Tasks', href: '/journey/tasks' },
        ],
      },
      TEAM_MEMBER: {
        label: 'Team Member',
        entryPoint: 'N/A (not accessible)',
        howToAccess: [
          'User management is not available to Team Members',
          'View team information through project pages',
        ],
        keyComponents: [],
        interactions: [],
        tips: [],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
        ],
      },
      PERSONAL: {
        label: 'Personal User',
        entryPoint: 'N/A (not available in personal mode)',
        howToAccess: [
          'User management requires organization mode',
          'Upgrade to organization mode to access team features',
        ],
        keyComponents: [],
        interactions: [],
        tips: [],
        nextSteps: [
          { title: 'View Dashboard', href: '/journey/dashboard' },
          { title: 'Create Tasks', href: '/journey/tasks' },
        ],
      },
    },
  },
};

export async function generateStaticParams() {
  return Object.keys(journeyPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = journeyPages[slug];
  if (!page) return { title: 'Journey Not Found' };
  return {
    title: `${page.title} Journey — ${APP_NAME}`,
    description: page.description,
  };
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = journeyPages[slug];

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="hero-mesh">
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
      </div>
      <div className="hero-noise" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white/80 mb-8 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Insights
        </Link>

        <div className="glass-card p-8 sm:p-10 mb-8">
          <div className="flex items-start gap-5">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${page.color} text-white shadow-lg`}>
              {page.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{page.title}</h1>
              <p className="text-white/70 leading-relaxed">{page.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {(Object.keys(page.roles) as RoleKey[]).map((role) => {
            const data = page.roles[role];
            if (!data || data.howToAccess.length === 0) return null;
            return (
              <div key={role} className="glass-card p-6 sm:p-8">
                <div className={`inline-flex items-center rounded-xl bg-gradient-to-br ${page.color} px-3 py-1 text-xs font-semibold text-white mb-4`}>
                  {data.label}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">How to access</h3>
                <p className="text-sm text-white/60 mb-4">{data.entryPoint}</p>
                <div className="space-y-3 mb-6">
                  {data.howToAccess.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <p className="text-sm text-white/70">{step}</p>
                    </div>
                  ))}
                </div>

                {data.keyComponents.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-3">Key Components</h3>
                    <div className="space-y-2 mb-6">
                      {data.keyComponents.map((comp) => (
                        <div key={comp.name} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-sm font-medium text-white">{comp.name}</div>
                          <div className="text-xs text-white/60 mt-1">{comp.description}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {data.interactions.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-3">How to Interact</h3>
                    <ul className="space-y-2 mb-6">
                      {data.interactions.map((interaction, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
                          {interaction}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {data.tips.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-3">Tips</h3>
                    <ul className="space-y-2 mb-6">
                      {data.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {data.nextSteps.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-3">Next Steps</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.nextSteps.map((step) => (
                         <Link
                           key={step.href}
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           href={step.href as any}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                        >
                          {step.title}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
