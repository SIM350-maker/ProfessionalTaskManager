# Professional Task Manager - AI Agent System

## Overview

The `ai` folder contains the specialized AI backbone for the Professional Task Manager. Each AI agent is designed to operate autonomously while collaborating with system agents (in `agents/`) and other AI agents through well-defined communication protocols.

The AI system serves two purposes:
1. **AI-Assisted Development**: Supporting the engineering team throughout SDLC (planning, coding, testing, deployment)
2. **Future AI Features**: Providing the foundation for V4 AI-powered features (task prioritization, deadline prediction, workload balancing, natural language task creation)

## AI Directory Structure

```
ai/
├── README.md
├── decisions/
├── prompts/
│   └── PROJECT_ENGINEERING_AUDITOR.md
├── reviews/
├── decision/
│   └── decision-agent.md
├── prompt-engineering/
│   └── prompt-engineering-agent.md
├── context/
│   └── context-agent.md
├── loop-engineering/
│   └── loop-engineering-agent.md
├── review/
│   └── review-agent.md
├── knowledge/
│   └── knowledge-agent.md
├── learning/
│   └── learning-agent.md
├── ethics/
│   └── ethics-agent.md
├── simulation/
│   └── simulation-agent.md
├── optimization/
│   └── optimization-agent.md
├── collaboration/
│   └── collaboration-agent.md
├── analytics/
│   └── analytics-agent.md
├── recommendation/
│   └── recommendation-agent.md
├── audit/
│   └── audit-agent.md
├── knowledge-graph/
│   └── knowledge-graph-agent.md
└── policy/
    └── policy-agent.md
```

## AI Agent Catalog

### Core Intelligence Agents (5)
These agents provide foundational AI capabilities.

| Agent | Primary Responsibility |
|-------|------------------------|
| **Decision Agent** | Strategic choices, prioritization, trade-off analysis |
| **Prompt Engineering Agent** | Designs and optimizes AI prompts for project workflows |
| **Context Agent** | Maintains project context, knowledge sharing, cross-agent communication |
| **Loop Engineering Agent** | Optimizes development feedback loops and engineering velocity |
| **Review Agent** | Evaluates outputs, ensures compliance with project standards |

### Knowledge and Learning Agents (4)
These agents manage knowledge and adapt over time.

| Agent | Primary Responsibility |
|-------|------------------------|
| **Knowledge Agent** | Stores and retrieves organizational knowledge from project docs |
| **Learning Agent** | Adapts AI behavior based on usage patterns and feedback |
| **Knowledge Graph Agent** | Maps relationships between tasks, users, and resources |
| **Analytics Agent** | Generates task insights, productivity metrics, predictive analysis |

### Governance and Ethics Agents (3)
These agents ensure responsible AI use.

| Agent | Primary Responsibility |
|-------|------------------------|
| **Ethics Agent** | Ensures fairness, transparency, and ethical compliance |
| **Audit Agent** | Tracks AI decisions, logs reasoning, ensures accountability |
| **Policy Agent** | Applies organizational rules and compliance constraints |

### Feature Support Agents (4)
These agents support specific product features.

| Agent | Primary Responsibility |
|-------|------------------------|
| **Recommendation Agent** | Suggests task assignments, workload balancing, resource allocation |
| **Collaboration Agent** | AI-driven communication across teams and integrated tools |
| **Simulation Agent** | Tests workflows and predicts outcomes before deployment |
| **Optimization Agent** | Performance tuning, resource efficiency, system optimization |

## V1 vs. Post-V1 Activation

### V1 Scope (Current)
The Professional Task Manager V1 explicitly excludes AI Assistant features per the Business Requirements (docs/02_Business_Requirements.md). During V1, AI agents operate in **engineering assistance mode**:

- **Decision Agent**: Supports architecture and prioritization decisions
- **Prompt Engineering Agent**: Optimizes prompts for AI-assisted development
- **Context Agent**: Maintains project context for AI-assisted coding and review
- **Loop Engineering Agent**: Optimizes development workflows and CI/CD
- **Review Agent**: AI-assisted code and documentation review
- **Audit Agent**: Logs AI-assisted development decisions
- **Policy Agent**: Enforces role-based access to AI development tools

### Post-V1 Activation (V4)
Per the project roadmap (docs/02_Business_Requirements.md Section 14), V4 will introduce:
- AI task prioritization
- AI deadline prediction
- AI workload balancing
- AI-assisted natural language task creation

These AI agents are fully designed and ready for V4 activation:
- **Recommendation Agent**: Task assignment and workload balancing
- **Collaboration Agent**: AI-enhanced team communication
- **Analytics Agent**: Predictive insights and business intelligence
- **Learning Agent**: Continuous improvement of AI features
- **Ethics Agent**: Fairness and transparency in user-facing AI
- **Knowledge Graph Agent**: Relationship mapping for intelligent recommendations
- **Simulation Agent**: Workflow testing and outcome prediction
- **Optimization Agent**: Performance tuning for AI features

## Collaboration Patterns

### AI-Assisted Development Flow
```
Developer Request
    ↓
Context Agent (project context)
    ↓
Prompt Engineering Agent (optimized prompt)
    ↓
AI Model (code generation, review, etc.)
    ↓
Review Agent (quality and compliance check)
    ↓
Audit Agent (decision logging)
    ↓
Developer (implementation)
```

### Decision Support Flow
```
Requirements Change
    ↓
Decision Agent (analysis and prioritization)
    ↓
Context Agent (impact assessment)
    ↓
Simulation Agent (outcome prediction)
    ↓
Governance Agent (approval)
    ↓
Implementation
```

### Future AI Feature Flow (V4)
```
User Action (e.g., create task)
    ↓
Context Agent (user context, task history)
    ↓
Recommendation Agent (suggestions)
    ↓
Policy Agent (access and compliance check)
    ↓
Ethics Agent (fairness validation)
    ↓
Audit Agent (decision logging)
    ↓
User (accept/reject/modify)
    ↓
Learning Agent (feedback capture)
```

## Integration with System Agents

The AI agents integrate seamlessly with the system agents in `agents/`:

| AI Agent | Primary System Agent Partners |
|----------|-------------------------------|
| Decision Agent | requirements-agent, architecture-agent, risk-management-agent, governance-agent |
| Prompt Engineering Agent | context-agent, loop-engineering-agent, review-agent, requirements-agent |
| Context Agent | All system agents (bidirectional context flow) |
| Loop Engineering Agent | devops-agent, testing-agent, backend-agent, monitoring-agent |
| Review Agent | backend-agent, frontend-agent, testing-agent, security-agent |
| Knowledge Agent | requirements-agent, architecture-agent, review-agent, development agents |
| Learning Agent | ai-automation-agent, recommendation-agent, notification-agent, prompt-engineering-agent |
| Ethics Agent | ai-automation-agent, recommendation-agent, compliance-agent, governance-agent |
| Simulation Agent | architecture-agent, database-agent, backend-agent, devops-agent |
| Optimization Agent | monitoring-agent, backend-agent, frontend-agent, database-agent |
| Collaboration Agent | notification-agent, workflow-agent, recommendation-agent, integration-agent |
| Analytics Agent | reporting-agent, notification-agent, recommendation-agent, monitoring-agent |
| Recommendation Agent | backend-agent, frontend-agent, workflow-agent, analytics-agent |
| Audit Agent | ai-automation-agent, recommendation-agent, workflow-agent, compliance-agent |
| Knowledge Graph Agent | database-agent, recommendation-agent, analytics-agent, workflow-agent |
| Policy Agent | compliance-agent, governance-agent, ai-automation-agent, security-agent |

## Key Project Constraints Embedded in AI Agents

All AI agents are tailored to the Professional Task Manager's specific context:

### Technology Stack
- Next.js, React, TypeScript, Tailwind CSS
- PostgreSQL, Prisma ORM
- Clerk (authentication)
- Zod (validation)
- Vitest (testing)
- Vercel (deployment)

### Architecture
- Modular monolith with domain, application, presentation, and data access layers
- Row-level security (RLS) for multi-tenancy
- Optimistic locking for concurrency
- Event-driven notification module
- Background job processing for async operations

### Business Rules
- BR-001: Every task belongs to one project
- BR-002: Every task has exactly one creator
- BR-003: Tasks may be assigned to one or more users
- BR-004: Completed tasks cannot be edited unless reopened
- BR-005: Only managers and administrators may assign tasks
- BR-006: Valid status values (TODO, IN_PROGRESS, IN_REVIEW, DONE, ARCHIVED)
- BR-007: Valid priority values (LOW, MEDIUM, HIGH, URGENT)
- BR-008: Task status transition constraints
- BR-009: Only creator/Manager/Administrator may reopen completed tasks

### User Roles
- **Team Member**: View assigned tasks, update status, add comments, upload attachments
- **Manager**: Create tasks, assign tasks, set priorities, monitor progress, generate reports
- **Administrator**: Manage organizations, users, system settings, view all reports

### V1 Scope
- **Included**: Auth, task CRUD, assignments, priorities, due dates, notifications (in-app + email), basic reporting, search, filters, activity timeline, team management
- **Excluded**: AI Assistant, Mobile App, Calendar Integration, Time Tracking UI, Workflow Automation, Third-party Integrations
- **Post-V1**: V2 (mobile, calendar, time tracking), V3 (workflow, integrations), V4 (AI features)

### Performance Targets
- Page load: ≤ 2 seconds at p95
- Uptime: ≥ 99.5% monthly
- Search results: ≤ 2 seconds
- Notification delivery: ≤ 60 seconds
- Test coverage: ≥ 70%
- Cyclomatic complexity: ≤ 10 per function

## Modularity and Extensibility

Each AI agent is designed to be:
- **Autonomous**: Can operate independently on its domain
- **Replaceable**: Can be swapped without breaking the system
- **Extensible**: Can be enhanced without affecting other agents
- **Communicative**: Clearly defines inputs and outputs

New AI agents can be added by:
1. Creating a new subfolder under `ai/`
2. Defining the agent's role, purpose, responsibilities, and communication protocols
3. Updating this README with the new agent
4. Establishing integration points with existing agents

## Getting Started

1. Review the project documentation in `docs/`
2. Understand each AI agent's responsibilities in their respective files
3. Follow the collaboration patterns when working across agents
4. Use the Context Agent for cross-cutting concerns and knowledge sharing
5. Maintain clear boundaries between agent responsibilities

## Maintenance

- Update agent definitions when responsibilities change
- Document new collaboration patterns
- Review and optimize communication protocols regularly
- Ensure context consistency across all agents
- Align AI agent designs with evolving project requirements
