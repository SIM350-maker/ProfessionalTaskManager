-- CreateIndex
CREATE INDEX "Attachment_taskId_deletedAt_idx" ON "Attachment"("taskId", "deletedAt");

-- CreateIndex
CREATE INDEX "Comment_taskId_deletedAt_createdAt_idx" ON "Comment"("taskId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Project_organizationId_deletedAt_createdAt_idx" ON "Project"("organizationId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Task_projectId_deletedAt_idx" ON "Task"("projectId", "deletedAt");

-- CreateIndex
CREATE INDEX "Task_status_deletedAt_idx" ON "Task"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Task_priority_deletedAt_idx" ON "Task"("priority", "deletedAt");

-- CreateIndex
CREATE INDEX "Task_dueDate_deletedAt_idx" ON "Task"("dueDate", "deletedAt");

-- CreateIndex
CREATE INDEX "Task_createdAt_deletedAt_idx" ON "Task"("createdAt", "deletedAt");

-- CreateIndex
CREATE INDEX "TaskAssignee_userId_idx" ON "TaskAssignee"("userId");

-- CreateIndex
CREATE INDEX "TaskAssignee_taskId_idx" ON "TaskAssignee"("taskId");
