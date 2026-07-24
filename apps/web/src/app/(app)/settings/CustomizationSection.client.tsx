'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { WorkflowForm } from '@/features/workflows';
import { CustomFieldForm } from '@/features/custom-fields';
import { AutomationRuleForm } from '@/features/automation-rules';
import { TaskTemplateForm } from '@/features/task-templates';
import type { Workflow, WorkflowState, CustomFieldDefinition, AutomationRule, TaskTemplate } from '@/types';

interface CustomizationSectionProps {
  workflows: (Workflow & { states: WorkflowState[] })[];
  customFields: CustomFieldDefinition[];
  automationRules: AutomationRule[];
  taskTemplates: TaskTemplate[];
  canManageWorkflow: boolean;
  canManageCustomField: boolean;
  canManageAutomation: boolean;
  canManageTemplate: boolean;
}

export function CustomizationSection({ workflows, customFields, automationRules, taskTemplates, canManageWorkflow, canManageCustomField, canManageAutomation, canManageTemplate }: CustomizationSectionProps) {
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [customFieldModalOpen, setCustomFieldModalOpen] = useState(false);
  const [automationRuleModalOpen, setAutomationRuleModalOpen] = useState(false);
  const [taskTemplateModalOpen, setTaskTemplateModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<(Workflow & { states: WorkflowState[] }) | undefined>(undefined);
  const [editingCustomField, setEditingCustomField] = useState<CustomFieldDefinition | undefined>(undefined);
  const [editingAutomationRule, setEditingAutomationRule] = useState<AutomationRule | undefined>(undefined);
  const [editingTaskTemplate, setEditingTaskTemplate] = useState<TaskTemplate | undefined>(undefined);

  function handleEditWorkflow(workflow: Workflow & { states: WorkflowState[] }) {
    setEditingWorkflow(workflow);
    setWorkflowModalOpen(true);
  }

  function handleCreateWorkflow() {
    setEditingWorkflow(undefined);
    setWorkflowModalOpen(true);
  }

  function handleEditCustomField(field: CustomFieldDefinition) {
    setEditingCustomField(field);
    setCustomFieldModalOpen(true);
  }

  function handleCreateCustomField() {
    setEditingCustomField(undefined);
    setCustomFieldModalOpen(true);
  }

  function handleEditAutomationRule(rule: AutomationRule) {
    setEditingAutomationRule(rule);
    setAutomationRuleModalOpen(true);
  }

  function handleCreateAutomationRule() {
    setEditingAutomationRule(undefined);
    setAutomationRuleModalOpen(true);
  }

  function handleEditTaskTemplate(template: TaskTemplate) {
    setEditingTaskTemplate(template);
    setTaskTemplateModalOpen(true);
  }

  function handleCreateTaskTemplate() {
    setEditingTaskTemplate(undefined);
    setTaskTemplateModalOpen(true);
  }

  function handleModalClose() {
    setWorkflowModalOpen(false);
    setCustomFieldModalOpen(false);
    setAutomationRuleModalOpen(false);
    setTaskTemplateModalOpen(false);
    setEditingWorkflow(undefined);
    setEditingCustomField(undefined);
    setEditingAutomationRule(undefined);
    setEditingTaskTemplate(undefined);
  }

  return (
    <div className="space-y-6">
      {canManageWorkflow && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Workflows</h2>
                <p className="text-sm text-text-secondary">Manage task status workflows for your organization</p>
              </div>
              <Button size="sm" onClick={handleCreateWorkflow}>New Workflow</Button>
            </div>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <p className="text-sm text-text-tertiary">No workflows found.</p>
            ) : (
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <div key={wf.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{wf.name}</p>
                      <p className="text-xs text-text-secondary">
                        {(wf as Workflow & { states?: Array<{ id: string }> }).states?.length ?? 0} states
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditWorkflow(wf)}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {canManageCustomField && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Custom Fields</h2>
                <p className="text-sm text-text-secondary">Define additional fields for tasks</p>
              </div>
              <Button size="sm" onClick={handleCreateCustomField}>New Field</Button>
            </div>
          </CardHeader>
          <CardContent>
            {customFields.length === 0 ? (
              <p className="text-sm text-text-tertiary">No custom fields found.</p>
            ) : (
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{field.name}</p>
                      <p className="text-xs text-text-secondary">{field.type} · Key: {field.key}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCustomField(field)}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {canManageAutomation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Automation Rules</h2>
                <p className="text-sm text-text-secondary">Automate repetitive task actions</p>
              </div>
              <Button size="sm" onClick={handleCreateAutomationRule}>New Rule</Button>
            </div>
          </CardHeader>
          <CardContent>
            {automationRules.length === 0 ? (
              <p className="text-sm text-text-tertiary">No automation rules found.</p>
            ) : (
              <div className="space-y-2">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{rule.name}</p>
                      <p className="text-xs text-text-secondary">
                        {rule.trigger} · {rule.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditAutomationRule(rule)}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {canManageTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Task Templates</h2>
                <p className="text-sm text-text-secondary">Predefined task structures to speed up creation</p>
              </div>
              <Button size="sm" onClick={handleCreateTaskTemplate}>New Template</Button>
            </div>
          </CardHeader>
          <CardContent>
            {taskTemplates.length === 0 ? (
              <p className="text-sm text-text-tertiary">No task templates found.</p>
            ) : (
              <div className="space-y-2">
                {taskTemplates.map((tpl) => (
                  <div key={tpl.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{tpl.name}</p>
                      <p className="text-xs text-text-secondary">
                        {tpl.defaultPriority} · {tpl.isRecurring ? 'Recurring' : 'One-time'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTaskTemplate(tpl)}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal open={workflowModalOpen} onClose={handleModalClose} title={editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}>
        <WorkflowForm
          workflow={editingWorkflow}
          onSuccess={handleModalClose}
          onClose={handleModalClose}
        />
      </Modal>

      <Modal open={customFieldModalOpen} onClose={handleModalClose} title={editingCustomField ? 'Edit Custom Field' : 'Create Custom Field'}>
        <CustomFieldForm
          field={editingCustomField}
          onSuccess={handleModalClose}
          onClose={handleModalClose}
        />
      </Modal>

      <Modal open={automationRuleModalOpen} onClose={handleModalClose} title={editingAutomationRule ? 'Edit Automation Rule' : 'Create Automation Rule'}>
        <AutomationRuleForm
          rule={editingAutomationRule}
          onSuccess={handleModalClose}
          onClose={handleModalClose}
        />
      </Modal>

      <Modal open={taskTemplateModalOpen} onClose={handleModalClose} title={editingTaskTemplate ? 'Edit Task Template' : 'Create Task Template'}>
        <TaskTemplateForm
          template={editingTaskTemplate}
          onSuccess={handleModalClose}
          onClose={handleModalClose}
        />
      </Modal>
    </div>
  );
}