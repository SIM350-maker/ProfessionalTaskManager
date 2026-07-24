import { PrismaClient, Prisma } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

import { organizations } from './seed-data/organizations';
import { users as rawUsers } from './seed-data/users';
import { projects as seedProjects } from './seed-data/projects';
import { tasks as seedTasks } from './seed-data/tasks';
import { comments as seedComments } from './seed-data/comments';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function pick<T>(arr: T[], index: number): T {
  const item = arr[index % arr.length];
  if (item === undefined) throw new Error(`Index ${index} out of bounds for array length ${arr.length}`);
  return item;
}

const PINNED_CREDENTIALS: { email: string; password: string }[] = [
  { email: 'james.kariuki@safaricom-plc.com', password: 'Pinned123!' },
  { email: 'faith.akinyi@equity-bank-kenya.com', password: 'Pinned123!' },
  { email: 'daniel.kiprono@kengen.com', password: 'Pinned123!' },
];

const pinnedEmails = new Set(PINNED_CREDENTIALS.map((c) => c.email));

async function main() {
  console.log('=== CORRECTED KENYAN CONTEXT SEED ===\n');

  // ── CLEAR: dependency order (children before parents) ──
  console.log('Clearing existing data...');
  await prisma.timeEntry.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userTeam.deleteMany();
  await prisma.team.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.label.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workflowTransition.deleteMany();
  await prisma.workflowState.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.customFieldDefinition.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.taskTemplate.deleteMany();
  await prisma.recurringTaskInstance.deleteMany();
  await prisma.organization.deleteMany();
  console.log('  ✓ Data cleared\n');

  // ── 1. ORGANIZATIONS ──
  console.log('1/10 Creating organizations...');
  const createdOrgs = await Promise.all(
    organizations.map((o) =>
      prisma.organization.create({
        data: { name: o.name, slug: o.slug, subscriptionTier: o.subscriptionTier, website: o.website, defaultTimezone: o.defaultTimezone },
      }),
    ),
  );
  const orgMap = new Map(createdOrgs.map((o) => [o.slug, o]));
  console.log(`  ✓ ${createdOrgs.length} organizations\n`);

  // ── 2. USERS (with pinned credentials) ──
  console.log('2/10 Creating users...');
  const defaultHash = await bcrypt.hash('Password123', 12);
  const pinnedHashes = await Promise.all(PINNED_CREDENTIALS.map((c) => bcrypt.hash(c.password, 12)));

  const createdUsers = await Promise.all(
    rawUsers.map((user) => {
      const org = orgMap.get(user.organizationSlug);
      if (!org) throw new Error(`Missing org: ${user.organizationSlug}`);
      const isPinned = pinnedEmails.has(user.email);
      const pinIdx = PINNED_CREDENTIALS.findIndex((c) => c.email === user.email);
      return prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          passwordHash: isPinned ? pinnedHashes[pinIdx]! : defaultHash,
          organizationId: org.id,
          isActive: true,
          jobTitle: user.jobTitle,
          department: user.department,
          timezone: user.timezone,
          role: user.role,
          emailVerifiedAt: new Date(),
        },
      });
    }),
  );
  const userMap = new Map(createdUsers.map((u) => [u.email, u]));
  const usersByOrg = new Map<string, typeof createdUsers>();
  for (const u of createdUsers) {
    const list = usersByOrg.get(u.organizationId) ?? [];
    list.push(u);
    usersByOrg.set(u.organizationId, list);
  }
  console.log(`  ✓ ${createdUsers.length} users (${PINNED_CREDENTIALS.length} pinned)\n`);

  // ── 3. ROLES + PERMISSIONS ──
  console.log('3/10 Creating roles & permissions...');
  const permDefs = [
    { name: 'Task Create', resource: 'task', action: 'create' },
    { name: 'Task Update', resource: 'task', action: 'update' },
    { name: 'Task Delete', resource: 'task', action: 'delete' },
    { name: 'Project Create', resource: 'project', action: 'create' },
    { name: 'Project Update', resource: 'project', action: 'update' },
    { name: 'Project Delete', resource: 'project', action: 'delete' },
    { name: 'User Read', resource: 'user', action: 'read' },
    { name: 'User Create', resource: 'user', action: 'create' },
    { name: 'User Deactivate', resource: 'user', action: 'deactivate' },
    { name: 'Report View', resource: 'report', action: 'view' },
    { name: 'Team Create', resource: 'team', action: 'create' },
    { name: 'Team Update', resource: 'team', action: 'update' },
    { name: 'Team Delete', resource: 'team', action: 'delete' },
    { name: 'Organization Read', resource: 'organization', action: 'read' },
    { name: 'Organization Update', resource: 'organization', action: 'update' },
    { name: 'Label Create', resource: 'label', action: 'create' },
    { name: 'Label Delete', resource: 'label', action: 'delete' },
    { name: 'Workflow Manage', resource: 'workflow', action: 'manage' },
    { name: 'Custom Field Manage', resource: 'customField', action: 'manage' },
    { name: 'Automation Manage', resource: 'automation', action: 'manage' },
    { name: 'Template Manage', resource: 'template', action: 'manage' },
  ];

  const roleMap = new Map<string, { admin: Prisma.RoleGetPayload<object>; manager: Prisma.RoleGetPayload<object>; member: Prisma.RoleGetPayload<object> }>();

  for (const org of createdOrgs) {
    const perms = await Promise.all(permDefs.map((p) => prisma.permission.create({ data: { ...p, createdAt: new Date(), updatedAt: new Date() } })));
    const permById = new Map(perms.map((p) => [`${p.resource}:${p.action}`, p]));

    const adminRole = await prisma.role.create({ data: { name: 'Administrator', description: 'Full system access', organizationId: org.id, isSystem: true } });
    const managerRole = await prisma.role.create({ data: { name: 'Manager', description: 'Project and team management', organizationId: org.id, isSystem: true } });
    const memberRole = await prisma.role.create({ data: { name: 'Team Member', description: 'Task execution and collaboration', organizationId: org.id, isSystem: true } });

    const adminPermKeys = permDefs.map((p) => `${p.resource}:${p.action}`);
    const managerPermKeys = ['task:create', 'task:update', 'project:create', 'project:update', 'report:view', 'team:update', 'label:create'];

    await Promise.all(adminPermKeys.map((k) => prisma.rolePermission.create({ data: { roleId: adminRole.id, permissionId: permById.get(k)!.id } })));
    await Promise.all(managerPermKeys.map((k) => prisma.rolePermission.create({ data: { roleId: managerRole.id, permissionId: permById.get(k)!.id } })));

    roleMap.set(org.id, { admin: adminRole, manager: managerRole, member: memberRole });
  }
  console.log('  ✓ Roles & permissions created\n');

  // ── 3b. WORKFLOWS + STATES + TRANSITIONS ──
  console.log('3b/10 Creating workflows...');
  const workflowDefs = [
    {
      name: 'Standard Task Workflow',
      entityType: 'TASK',
      isDefault: true,
      states: [
        { name: 'Backlog', color: '#6B7280', isInitial: true, orderIndex: 0 },
        { name: 'In Progress', color: '#3B82F6', isInitial: false, orderIndex: 1 },
        { name: 'In Review', color: '#F59E0B', isInitial: false, orderIndex: 2 },
        { name: 'Done', color: '#10B981', isFinal: true, orderIndex: 3 },
        { name: 'Archived', color: '#9CA3AF', isFinal: true, orderIndex: 4 },
      ],
      transitions: [
        { from: 'Backlog', to: 'In Progress' },
        { from: 'In Progress', to: 'In Review' },
        { from: 'In Review', to: 'In Progress' },
        { from: 'In Review', to: 'Done' },
        { from: 'Done', to: 'Archived' },
        { from: 'Archived', to: 'Done' },
      ],
    },
    {
      name: 'Bug Triage Workflow',
      entityType: 'TASK',
      isDefault: false,
      states: [
        { name: 'Open', color: '#EF4444', isInitial: true, orderIndex: 0 },
        { name: 'Investigating', color: '#F59E0B', isInitial: false, orderIndex: 1 },
        { name: 'Fixed', color: '#10B981', isFinal: true, orderIndex: 2 },
        { name: 'Won\'t Fix', color: '#6B7280', isFinal: true, orderIndex: 3 },
      ],
      transitions: [
        { from: 'Open', to: 'Investigating' },
        { from: 'Investigating', to: 'Fixed' },
        { from: 'Investigating', to: 'Won\'t Fix' },
      ],
    },
    {
      name: 'Content Approval Workflow',
      entityType: 'TASK',
      isDefault: false,
      states: [
        { name: 'Draft', color: '#6B7280', isInitial: true, orderIndex: 0 },
        { name: 'Editorial Review', color: '#3B82F6', isInitial: false, orderIndex: 1 },
        { name: 'Legal Review', color: '#F59E0B', isInitial: false, orderIndex: 2 },
        { name: 'Published', color: '#10B981', isFinal: true, orderIndex: 3 },
      ],
      transitions: [
        { from: 'Draft', to: 'Editorial Review' },
        { from: 'Editorial Review', to: 'Draft' },
        { from: 'Editorial Review', to: 'Legal Review' },
        { from: 'Legal Review', to: 'Editorial Review' },
        { from: 'Legal Review', to: 'Published' },
      ],
    },
  ];

  const workflowMap = new Map<string, Prisma.WorkflowGetPayload<object>>();

  for (const org of createdOrgs) {
    const orgWorkflows: Prisma.WorkflowGetPayload<object>[] = [];

    for (const wfDef of workflowDefs) {
      const workflow = await prisma.workflow.create({
        data: {
          name: wfDef.name,
          entityType: wfDef.entityType,
          isDefault: wfDef.isDefault,
          organizationId: org.id,
          states: {
            create: wfDef.states.map((s) => ({
              name: s.name,
              color: s.color,
              isInitial: s.isInitial,
              isFinal: s.isFinal,
              orderIndex: s.orderIndex,
            })),
          },
        },
        include: { states: true },
      });

      const stateByName = new Map(workflow.states.map((s) => [s.name, s]));

      for (const trans of wfDef.transitions) {
        const fromState = stateByName.get(trans.from);
        const toState = stateByName.get(trans.to);
        if (fromState && toState) {
          await prisma.workflowTransition.create({
            data: {
              fromStateId: fromState.id,
              toStateId: toState.id,
              condition: {},
            },
          });
        }
      }

      orgWorkflows.push(workflow);
    }

    const defaultWf = orgWorkflows.find((w) => w.isDefault);
    if (defaultWf) {
      workflowMap.set(org.id, defaultWf);
    }
  }
  console.log('  ✓ Workflows, states, and transitions created\n');

  // ── 3c. CUSTOM FIELD DEFINITIONS ──
  console.log('3c/10 Creating custom field definitions...');
  const customFieldDefs = [
    { name: 'Severity', key: 'severity', type: 'SELECT', options: ['Low', 'Medium', 'High', 'Critical'], isRequired: false, entityType: 'TASK' },
    { name: 'Effort Estimate', key: 'effort_estimate', type: 'NUMBER', options: [], isRequired: false, entityType: 'TASK' },
    { name: 'Target Launch Date', key: 'target_launch_date', type: 'DATE', options: [], isRequired: false, entityType: 'TASK' },
    { name: 'Client Name', key: 'client_name', type: 'TEXT', options: [], isRequired: true, entityType: 'TASK' },
    { name: 'Is Billable', key: 'is_billable', type: 'BOOLEAN', options: [], isRequired: false, entityType: 'TASK' },
    { name: 'Tags', key: 'tags', type: 'MULTI_SELECT', options: ['Finance', 'HR', 'Engineering', 'Marketing'], isRequired: false, entityType: 'TASK' },
  ];

  const customFieldEnumToPrismaType: Record<string, string> = {
    'TEXT': 'TEXT',
    'NUMBER': 'NUMBER',
    'DATE': 'DATE',
    'SELECT': 'SELECT',
    'MULTI_SELECT': 'MULTI_SELECT',
    'USER': 'USER',
    'BOOLEAN': 'BOOLEAN',
  };

  const customFieldMap = new Map<string, Prisma.CustomFieldDefinitionGetPayload<object>[]>();

  for (const org of createdOrgs) {
    const orgFields: Prisma.CustomFieldDefinitionGetPayload<object>[] = [];

    for (const fieldDef of customFieldDefs) {
      const field = await prisma.customFieldDefinition.create({
        data: {
          ...fieldDef,
          type: fieldDef.type as 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'USER' | 'BOOLEAN',
          organizationId: org.id,
          options: fieldDef.options as Prisma.JsonArray,
        },
      });
      orgFields.push(field);
    }

    customFieldMap.set(org.id, orgFields);
  }
  console.log('  ✓ Custom field definitions created\n');

  // ── 3d. AUTOMATION RULES ──
  console.log('3d/10 Creating automation rules...');
  const automationRuleMap = new Map<string, Prisma.AutomationRuleGetPayload<object>[]>();
  for (const org of createdOrgs) {
    const orgRules: Prisma.AutomationRuleGetPayload<object>[] = [];
    const orgUsersList = usersByOrg.get(org.id)!;
    const orgAdminId = orgUsersList[0]!.id;
    const automationRuleDefs = [
      {
        name: 'Auto-assign high-priority tasks to org admin',
        description: 'When a high-priority task is created, automatically assign it to the organization admin.',
        trigger: 'TASK_CREATED' as const,
        conditions: { priority: 'HIGH' },
        actions: [{ type: 'ASSIGN_USER', userId: orgAdminId }],
      },
      {
        name: 'Move completed tasks to Done',
        description: 'When a task is marked completed, update its status to Done.',
        trigger: 'TASK_STATUS_CHANGED' as const,
        conditions: { status: 'COMPLETED' },
        actions: [{ type: 'SET_STATUS', value: 'DONE' }],
      },
      {
        name: 'Notify assignee when task is overdue',
        description: 'Send a notification to the task assignee when a task becomes overdue.',
        trigger: 'TASK_OVERDUE' as const,
        conditions: {},
        actions: [{ type: 'SEND_NOTIFICATION', title: 'Task Overdue', message: 'Your task is now overdue. Please take action.' }],
      },
    ];

    for (const ruleDef of automationRuleDefs) {
      const actions = JSON.parse(JSON.stringify(ruleDef.actions)) as Array<Record<string, unknown>>;
      const rule = await prisma.automationRule.create({
        data: {
          name: ruleDef.name,
          description: ruleDef.description,
          trigger: ruleDef.trigger,
          conditions: ruleDef.conditions as Prisma.InputJsonValue,
          actions: actions as Prisma.InputJsonValue,
          isActive: true,
          organizationId: org.id,
          createdBy: orgUsersList[0]!.id,
        },
      });
      orgRules.push(rule);
    }
    automationRuleMap.set(org.id, orgRules);
  }
  console.log('  ✓ Automation rules created\n');

  // ── 3e. TASK TEMPLATES ──
  console.log('3e/10 Creating task templates...');
  const taskTemplateDefs = [
    {
      name: 'Bug Fix Template',
      description: 'Standard template for bug fix tasks',
      defaultStatus: 'TODO' as const,
      defaultPriority: 'HIGH' as const,
      estimatedHours: 4,
      isRecurring: false,
      fields: { severity: 'High', type: 'bug' },
    },
    {
      name: 'Weekly Report',
      description: 'Recurring weekly status report task',
      defaultStatus: 'TODO' as const,
      defaultPriority: 'MEDIUM' as const,
      estimatedHours: 2,
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1',
      fields: { reportType: 'weekly' },
    },
    {
      name: 'Deployment Checklist',
      description: 'Checklist for production deployments',
      defaultStatus: 'TODO' as const,
      defaultPriority: 'HIGH' as const,
      estimatedHours: 1,
      isRecurring: false,
      fields: { environment: 'production', checklist: true },
    },
  ];

  const taskTemplateMap = new Map<string, Prisma.TaskTemplateGetPayload<object>[]>();
  for (const org of createdOrgs) {
    const orgTemplates: Prisma.TaskTemplateGetPayload<object>[] = [];
    const orgUsersList = usersByOrg.get(org.id)!;
    for (const tplDef of taskTemplateDefs) {
      const tpl = await prisma.taskTemplate.create({
        data: {
          ...tplDef,
          organizationId: org.id,
          createdBy: orgUsersList[0]!.id,
        },
      });
      orgTemplates.push(tpl);
    }
    taskTemplateMap.set(org.id, orgTemplates);
  }
  console.log('  ✓ Task templates created\n');

  // ── 4. TEAMS + USER TEAMS (every user in at least 1 team) ──
  console.log('4/10 Creating teams & memberships...');
  const teamNames = [
    'Engineering', 'Product Design', 'Quality Assurance', 'Infrastructure',
    'Digital Innovation', 'Customer Experience', 'Security & Compliance', 'Data Engineering',
  ];

  for (const org of createdOrgs) {
    const orgUsers = usersByOrg.get(org.id)!;
    const teamCount = Math.min(3, Math.ceil(orgUsers.length / 3));
    const teams: Prisma.TeamGetPayload<object>[] = [];

    for (let ti = 0; ti < teamCount; ti++) {
      const team = await prisma.team.create({
        data: { name: pick(teamNames, createdOrgs.indexOf(org) * 3 + ti), description: `${pick(teamNames, createdOrgs.indexOf(org) * 3 + ti)} team`, organizationId: org.id },
      });
      teams.push(team);
    }

    // Distribute all users across teams
    for (let ui = 0; ui < orgUsers.length; ui++) {
      await prisma.userTeam.create({
        data: { userId: orgUsers[ui]!.id, teamId: pick(teams, ui).id, organizationId: org.id },
      });
    }
  }
  console.log('  ✓ Teams & memberships created\n');

  // ── 5. PROJECTS ──
  console.log('5/10 Creating projects...');
  const projectRecords = await Promise.all(
    seedProjects.map((proj) => {
      const org = orgMap.get(proj.organizationSlug)!;
      const orgUsers = usersByOrg.get(org.id)!;
      const owner = orgUsers[proj.teamMemberIndex] ?? orgUsers[0]!;
      return prisma.project.create({
        data: {
          name: proj.name,
          description: proj.description,
          status: proj.status,
          visibility: proj.visibility,
          color: proj.color,
          ownerId: owner.id,
          organizationId: org.id,
          createdBy: owner.id,
        },
      });
    }),
  );
  const projectsByOrg = new Map<string, typeof projectRecords>();
  for (const p of projectRecords) {
    const list = projectsByOrg.get(p.organizationId) ?? [];
    list.push(p);
    projectsByOrg.set(p.organizationId, list);
  }
  console.log(`  ✓ ${projectRecords.length} projects\n`);

  // ── 6. PROJECT MEMBERS (FIXED: valid roleId) ──
  console.log('6/10 Adding project members...');
  for (const proj of projectRecords) {
    const orgUsers = usersByOrg.get(proj.organizationId)!;
    const roles = roleMap.get(proj.organizationId)!;
    for (const u of orgUsers) {
      let roleId: string;
      if (u.role === 'ADMINISTRATOR') roleId = roles.admin.id;
      else if (u.role === 'MANAGER') roleId = roles.manager.id;
      else roleId = roles.member.id;

      await prisma.projectMember.create({
        data: { userId: u.id, projectId: proj.id, roleId, organizationId: proj.organizationId },
      }).catch((err) => { if (err instanceof Error) console.warn(`  ⚠ Skipped (${err.message})`); });
    }
  }
  console.log('  ✓ Project members added\n');

  // ── 7. TASKS + ASSIGNEES ──
  console.log('7/10 Creating tasks & assignees...');
  const taskRecords: Array<{ id: string; projectId: string; organizationId: string; title: string; status: string }> = [];
  for (const taskDef of seedTasks) {
    const proj = projectRecords[taskDef.projectIndex];
    if (!proj) continue;
    const orgUsers = usersByOrg.get(proj.organizationId)!;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + taskDef.daysAhead);

    const defaultWf = workflowMap.get(proj.organizationId);
    const task = await prisma.task.create({
      data: {
        title: taskDef.title,
        description: taskDef.description,
        status: taskDef.status,
        priority: taskDef.priority,
        projectId: proj.id,
        workflowId: defaultWf?.id,
        createdBy: orgUsers[0]!.id,
        estimatedHours: taskDef.estimatedHours,
        dueDate,
        completedAt: taskDef.status === 'DONE' ? new Date() : null,
      },
    });
    taskRecords.push({ id: task.id, projectId: task.projectId, organizationId: proj.organizationId, title: task.title, status: task.status });

    const assigneeCount = Math.min(3, orgUsers.length);
    for (let ai = 0; ai < assigneeCount; ai++) {
      await prisma.taskAssignee.create({
        data: {
          userId: orgUsers[((taskRecords.length - 1) + ai) % orgUsers.length]!.id,
          taskId: task.id,
          assignedBy: orgUsers[0]!.id,
          organizationId: proj.organizationId,
        },
      }).catch((err) => { if (err instanceof Error) console.warn(`  ⚠ Skipped (${err.message})`); });
    }
  }
  console.log(`  ✓ ${taskRecords.length} tasks created\n`);

  // ── 8. LABELS + TASK LABELS ──
  console.log('8/10 Creating labels & task labels...');
  const labelDefs = [
    { name: 'Frontend', color: '#3B82F6' },
    { name: 'Backend', color: '#10B981' },
    { name: 'Infrastructure', color: '#8B5CF6' },
    { name: 'Security', color: '#EF4444' },
    { name: 'Documentation', color: '#F59E0B' },
    { name: 'Design', color: '#EC4899' },
    { name: 'Testing', color: '#14B8A6' },
    { name: 'DevOps', color: '#6366F1' },
    { name: 'Research', color: '#F97316' },
    { name: 'Training', color: '#84CC16' },
  ];

  for (const org of createdOrgs) {
    const orgLabels = await Promise.all(
      labelDefs.map((l) =>
        prisma.label.create({ data: { name: l.name, color: l.color, organizationId: org.id } }),
      ),
    );
    const orgTasks = taskRecords.filter((t) => t.organizationId === org.id);
    // Label 30% of tasks
    for (const task of orgTasks.slice(0, Math.ceil(orgTasks.length * 0.3))) {
      const labelCount = 1 + Math.floor(Math.random() * 2);
      for (let li = 0; li < labelCount; li++) {
        await prisma.taskLabel.create({
          data: { taskId: task.id, labelId: pick(orgLabels, li).id, organizationId: org.id },
        }).catch((err) => { if (err instanceof Error) console.warn(`  ⚠ Skipped (${err.message})`); });
      }
    }
  }
  console.log('  ✓ Labels & task labels created\n');

  // ── 9. TASK DEPENDENCIES ──
  console.log('9/10 Creating task dependencies...');
  for (const org of createdOrgs) {
    const orgTasks = taskRecords.filter((t) => t.organizationId === org.id);
    for (let ti = 1; ti < orgTasks.length; ti += 3) {
      const pred = orgTasks[ti - 1]!;
      const succ = orgTasks[ti]!;
      await prisma.taskDependency.create({
        data: { predecessorTaskId: pred.id, successorTaskId: succ.id, organizationId: org.id },
      }).catch((err) => { if (err instanceof Error) console.warn(`  ⚠ Skipped (${err.message})`); });
    }
  }
  console.log('  ✓ Task dependencies created\n');

  // ── 10. COMMENTS ──
  console.log('10/10 Creating comments...');
  const allTasks = await prisma.task.findMany({ orderBy: { createdAt: 'asc' }, include: { project: true } });
  for (const commentDef of seedComments) {
    const task = allTasks[commentDef.taskIndex];
    if (!task) continue;
    const orgUsers = usersByOrg.get(task.project.organizationId)!;
    const author = orgUsers[commentDef.authorUserIndex % orgUsers.length] ?? orgUsers[0]!;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - commentDef.daysAgo);
    await prisma.comment.create({
      data: { message: commentDef.content, taskId: task.id, authorId: author.id, createdAt },
    });
  }
  console.log(`  ✓ ${seedComments.length} comments created\n`);

  // ── REMAINING TABLES (Attachment, Notification, TimeEntry, ActivityLog, UserPreferences, Session) ──

  // ATTACHMENT
  console.log('  Creating attachments...');
  for (const task of allTasks.slice(0, 10)) {
    const orgUsers = usersByOrg.get(task.project.organizationId)!;
    const uploader = orgUsers[0]!;
    await prisma.attachment.create({
      data: {
        filename: `report-${task.id.slice(0, 8)}.pdf`,
        originalName: `Quarterly-Report-${task.title.slice(0, 10)}.pdf`,
        mimeType: 'application/pdf',
        size: 1024 * 50 + Math.floor(Math.random() * 500000),
        url: `/uploads/${task.id.slice(0, 8)}-report.pdf`,
        virusScanStatus: 'CLEAN',
        taskId: task.id,
        uploadedBy: uploader.id,
      },
    });
  }
  console.log('  ✓ Attachments created\n');

  // NOTIFICATION
  console.log('  Creating notifications...');
  for (const org of createdOrgs) {
    const orgUsers = usersByOrg.get(org.id)!;
    for (const u of orgUsers.slice(0, 3)) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'New task assigned',
          message: `You have been assigned to a task in ${org.name}`,
          entityType: 'task',
          entityId: 'seed',
          userId: u.id,
        },
      });
      await prisma.notification.create({
        data: {
          type: 'TASK_COMPLETED',
          title: 'Task completed',
          message: 'A task you were watching has been completed',
          entityType: 'task',
          entityId: 'seed',
          actorId: pick(orgUsers, 1).id,
          userId: u.id,
        },
      }).catch((err) => { if (err instanceof Error) console.warn(`  ⚠ Skipped (${err.message})`); });
    }
  }
  console.log('  ✓ Notifications created\n');

  // TIME ENTRY
  console.log('  Creating time entries...');
  for (const task of allTasks.slice(0, 15)) {
    const orgUsers = usersByOrg.get(task.project.organizationId)!;
    const user = orgUsers[0]!;
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 3);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2 + Math.floor(Math.random() * 4));
    await prisma.timeEntry.create({
      data: {
        taskId: task.id,
        userId: user.id,
        startTime,
        endTime,
        description: `Worked on ${task.title}`,
        organizationId: task.project.organizationId,
      },
    });
  }
  console.log('  ✓ Time entries created\n');

  // ACTIVITY LOG (comprehensive, with user attribution)
  console.log('  Creating activity logs...');
  for (const task of allTasks) {
    const orgUsers = usersByOrg.get(task.project.organizationId)!;
    const actor = orgUsers[0]!;
    await prisma.activityLog.create({
      data: {
        userId: actor.id,
        action: 'TASK_CREATED',
        entityType: 'task',
        entityId: task.id,
        organizationId: task.project.organizationId,
        changes: { title: task.title, status: task.status },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('  ✓ Activity logs created\n');

  // USER PREFERENCES
  console.log('  Creating user preferences...');
  await Promise.all(
    createdUsers.map((u) =>
      prisma.userPreferences.create({
        data: {
          userId: u.id,
          notificationEmailEnabled: true,
          notificationInAppEnabled: true,
          theme: Math.random() > 0.3 ? 'light' : 'dark',
          language: 'en',
        },
      }),
    ),
  );
  console.log('  ✓ User preferences created\n');

  // SESSIONS for pinned users
  console.log('  Creating sessions for pinned users...');
  const sessionData = Array.from(PINNED_CREDENTIALS)
    .map((cred) => {
      const user = userMap.get(cred.email);
      if (!user) return null;
      return {
        userId: user.id,
        token: `seed-session-${user.id}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
    })
    .filter((item): item is { userId: string; token: string; expiresAt: Date } => item !== null);
  await prisma.session.createMany({
    data: sessionData,
    skipDuplicates: true,
  });
  console.log('  ✓ Sessions created\n');

  // ── SUMMARY ──
  const counts = {
    organizations: await prisma.organization.count(),
    users: await prisma.user.count(),
    teams: await prisma.team.count(),
    teamships: await prisma.userTeam.count(),
    projects: await prisma.project.count(),
    members: await prisma.projectMember.count(),
    tasks: await prisma.task.count(),
    assignees: await prisma.taskAssignee.count(),
    labels: await prisma.label.count(),
    taskLabels: await prisma.taskLabel.count(),
    dependencies: await prisma.taskDependency.count(),
    comments: await prisma.comment.count(),
    attachments: await prisma.attachment.count(),
    notifications: await prisma.notification.count(),
    timeEntries: await prisma.timeEntry.count(),
    activityLogs: await prisma.activityLog.count(),
    preferences: await prisma.userPreferences.count(),
    sessions: await prisma.session.count(),
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
    rolePerms: await prisma.rolePermission.count(),
    automationRules: await prisma.automationRule.count(),
    taskTemplates: await prisma.taskTemplate.count(),
    recurringInstances: await prisma.recurringTaskInstance.count(),
  };

  console.log('=== SEED COMPLETE ===');
  console.table(counts);
  console.log('\n📋 PINNED LOGIN CREDENTIALS:');
  for (const cred of PINNED_CREDENTIALS) {
    const user = userMap.get(cred.email);
    console.log(`  ${cred.email}  /  ${cred.password}  (role: ${user?.role})`);
  }
  console.log('\n   All other users: Password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
