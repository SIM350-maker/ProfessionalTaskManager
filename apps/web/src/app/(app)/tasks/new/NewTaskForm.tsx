'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { WorkflowSelector } from '@/components/tasks/WorkflowSelector.client';
import { CustomFieldsRenderer } from '@/components/tasks/CustomFieldsRenderer.client';
import { useCustomFields } from '@/features/custom-fields';
import { useWorkflows } from '@/features/workflows';
import { useTaskTemplates } from '@/features/task-templates';
import { getActionErrorMessage } from '@/lib/helpers';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import type { Workflow } from '@/types';

interface ProjectOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface NewTaskFormProps {
  projects: ProjectOption[];
  users: UserOption[];
  organizationId: string | null;
  projectId?: string;
}

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

function Form({ projects, users, organizationId, projectId: projectIdParam }: NewTaskFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState(urlProjectId || projectIdParam || '');
  const [selectedStatus, setSelectedStatus] = useState('TODO');
  const [selectedPriority, setSelectedPriority] = useState('MEDIUM');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const orgId = organizationId ?? undefined;
  const { workflows, loading: workflowsLoading } = useWorkflows(orgId, 'TASK');
  const { fields: customFields, loading: fieldsLoading } = useCustomFields(orgId, 'TASK', urlProjectId || projectIdParam);
  const { templates } = useTaskTemplates(orgId);

  useEffect(() => {
    if (urlProjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProject(urlProjectId);
    }
  }, [urlProjectId]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tpl.defaultStatus) setSelectedStatus(tpl.defaultStatus);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tpl.defaultPriority) setSelectedPriority(tpl.defaultPriority);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tpl.fields && typeof tpl.fields === 'object' && Object.keys(tpl.fields).length > 0) {
      setCustomFieldValues((prev) => ({ ...(tpl.fields as Record<string, unknown>), ...prev }));
    }
  }, [selectedTemplateId, templates]);

  const defaultWorkflow = useMemo(() => {
    if (!workflows.length) return null;
    return workflows.find((w: Workflow) => w.isDefault) || workflows[0] || null;
  }, [workflows]);

  useEffect(() => {
    if (!selectedWorkflowId && defaultWorkflow) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedWorkflowId(defaultWorkflow.id);
    }
  }, [defaultWorkflow, selectedWorkflowId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.set('assigneeIds', selectedAssignees.join(','));
    formData.set('customFields', JSON.stringify(customFieldValues));
    if (selectedWorkflowId) {
      formData.set('workflowId', selectedWorkflowId);
    }
    formData.set('projectId', selectedProject);
    formData.set('status', selectedStatus);
    formData.set('priority', selectedPriority);

    const { createTask } = await import('@/actions');
    const result = await createTask(formData);

    if (result.success && result.data) {
      router.push(`/tasks/${result.data.id}`);
    } else {
      setError(getActionErrorMessage(result.error));
    }
    setLoading(false);
  }

  function toggleAssignee(userId: string) {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Create Task</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>}
            <Input label="Title" name="title" required placeholder="Enter task title" />
            {templates.length > 0 && (
              <Select
                label="Use Template"
                value={selectedTemplateId}
                onChange={(val) => setSelectedTemplateId(val as string)}
                options={[
                  { value: '', label: 'None' },
                  ...templates.map((t) => ({ value: t.id, label: t.name })),
                ]}
                placeholder="Select a template"
              />
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary">Description</label>
              <textarea
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-border-default px-3 py-2 text-sm shadow-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                placeholder="Describe the task..."
              />
            </div>

            <Select
              label="Project"
              value={selectedProject}
              onChange={(val) => setSelectedProject(val as string)}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Select a project"
            />

            <WorkflowSelector
              workflows={workflows}
              selectedWorkflowId={selectedWorkflowId}
              onChange={setSelectedWorkflowId}
              disabled={workflowsLoading}
            />

            <Select
              label="Status"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as string)}
              options={statusOptions}
              placeholder="Select status"
            />
            <Select
              label="Priority"
              value={selectedPriority}
              onChange={(val) => setSelectedPriority(val as string)}
              options={priorityOptions}
              placeholder="Select priority"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Due Date" name="dueDate" type="datetime-local" />
              <Input label="Start Date" name="startDate" type="datetime-local" />
            </div>
            <Input label="Estimated Hours" name="estimatedHours" type="number" step="0.5" min="0" />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Assignees</label>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border-default p-2">
                {users.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-bg-subtle cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(u.id)}
                      onChange={() => toggleAssignee(u.id)}
                      className="h-4 w-4 rounded border-border-default text-accent-blue"
                    />
                    <span className="text-sm text-text-secondary">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-text-tertiary">{u.email}</span>
                  </label>
                ))}
                {users.length === 0 && <p className="text-sm text-text-tertiary text-center py-2">No users available</p>}
              </div>
            </div>

            {!fieldsLoading && customFields.length > 0 && (
              <CustomFieldsRenderer
                fields={customFields}
                values={customFieldValues}
                onChange={setCustomFieldValues}
              />
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>Create Task</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTaskForm({ projects, users, organizationId, projectId }: NewTaskFormProps) {
  return (
    <Suspense fallback={<FormSkeleton fields={6} />}>
      <Form projects={projects} users={users} organizationId={organizationId} projectId={projectId} />
    </Suspense>
  );
}
