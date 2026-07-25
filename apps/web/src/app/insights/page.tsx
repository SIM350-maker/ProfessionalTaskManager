import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import {
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Target,
  Zap,
  Activity,
  Lock,
  Globe,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: `${APP_NAME} — System Insights`,
  description: 'Understand what ProTask is, who uses it, and how every role moves from signup to successful project delivery.',
};

type RoleKey = 'ADMINISTRATOR' | 'MANAGER' | 'TEAM_MEMBER';

interface PageStep {
  title: string;
  description: string;
  href: string;
  outcome: string;
}

interface RoleJourney {
  title: string;
  description: string;
  objective: string;
  color: string;
  pages: PageStep[];
}

const journeys: Record<RoleKey, RoleJourney> = {
  ADMINISTRATOR: {
    title: 'Administrator',
    description: 'You own the platform, users, and organization-wide settings. Your job is to keep the system healthy, secure, and aligned with how teams work.',
    objective: 'Enable the organization to work safely and efficiently at scale.',
    color: 'from-accent-blue to-accent-purple',
    pages: [
      {
        title: 'Admin Dashboard',
        description: 'Start here every day. This is your command center for system health, user activity, recent signups, critical alerts, and platform metrics.',
        href: '/journey/dashboard',
        outcome: 'Spot issues early and make informed decisions about platform usage.',
      },
      {
        title: 'Organization Settings',
        description: 'Configure the org profile, integrations like Slack, verification status, and calendar tokens. This is where you define how the workspace operates.',
        href: '/journey/settings',
        outcome: 'Ensure the organization is properly set up for collaboration and external tooling.',
      },
      {
        title: 'User Management',
        description: 'Invite members, assign roles, verify emails, and deactivate accounts when needed. Access is the backbone of security.',
        href: '/journey/users',
        outcome: 'Maintain security and ensure people have access to the right areas.',
      },
      {
        title: 'Projects',
        description: 'Create projects, set visibility, attach workflows, and define reporting so managers have clear execution lanes.',
        href: '/journey/projects',
        outcome: 'Provide a structured environment where teams can deliver work.',
      },
      {
        title: 'Tasks',
        description: 'Monitor task boards, re-balance workload, resolve blockers, and ensure deadlines are met at scale.',
        href: '/journey/tasks',
        outcome: 'Keep delivery on track across all projects.',
      },
      {
        title: 'Reports',
        description: 'Review completion rates, team velocity, overdue analysis, and export insights for stakeholders and leadership.',
        href: '/journey/reports',
        outcome: 'Prove value and guide improvements with data.',
      },
      {
        title: 'Notifications',
        description: 'Configure in-app and email alerts to stay ahead of critical escalations without noise.',
        href: '/journey/notifications',
        outcome: 'Never miss a critical alert while avoiding notification fatigue.',
      },
      {
        title: 'Settings',
        description: 'Finalize your personal preferences for theme, language, timezone, and security.',
        href: '/journey/settings',
        outcome: 'A comfortable, personalized environment for long sessions.',
      },
    ],
  },
  MANAGER: {
    title: 'Manager',
    description: 'You turn strategy into execution. You create projects, assign tasks, build teams, and make sure everyone is moving in the same direction.',
    objective: 'Deliver projects on time by aligning people, priorities, and progress.',
    color: 'from-accent-green to-accent-cyan',
    pages: [
      {
        title: 'Dashboard',
        description: 'Your daily starting point. See project health, upcoming deadlines, assigned tasks, and quick actions in one view.',
        href: '/journey/dashboard',
        outcome: 'Know exactly what needs your attention today.',
      },
      {
        title: 'Projects',
        description: 'Create or join projects, set milestones, define scope, assign leads, and configure reporting preferences.',
        href: '/journey/projects',
        outcome: 'Give work a clear home with defined boundaries and success criteria.',
      },
      {
        title: 'Tasks',
        description: 'Break work into actionable tasks, set priorities and due dates, label for context, and assign to team members.',
        href: '/journey/tasks',
        outcome: 'Turn project goals into concrete, trackable work items.',
      },
      {
        title: 'Teams',
        description: 'Add members, view workloads, and keep communication aligned through team-level visibility and distribution.',
        href: '/journey/teams',
        outcome: 'Balance work across people so no one is overloaded or underused.',
      },
      {
        title: 'Reports',
        description: 'Track completion rates, overdue items, and team performance. Export reports for stakeholders and retrospectives.',
        href: '/journey/reports',
        outcome: 'Understand trends and demonstrate progress with evidence.',
      },
      {
        title: 'Notifications',
        description: 'Receive real-time alerts on task updates, mentions, and project changes to stay in sync without constant checking.',
        href: '/journey/notifications',
        outcome: 'Respond quickly to changes and keep momentum.',
      },
      {
        title: 'Settings',
        description: 'Adjust themes, notification channels, languages, and timezone to match how you work best.',
        href: '/journey/settings',
        outcome: 'Reduce friction by working in your preferred environment.',
      },
      {
        title: 'Profile',
        description: 'Keep contact details, role info, and preferences current so collaborators can reach you easily.',
        href: '/journey/profile',
        outcome: 'Build trust and accessibility across the team.',
      },
    ],
  },
  TEAM_MEMBER: {
    title: 'Team Member',
    description: 'You execute the work. In organization mode, you see assigned tasks, update progress, and collaborate. In personal mode, you manage your own tasks in a private workspace with templates.',
    objective: 'Complete assigned work clearly, on time, and with good communication — whether in a team or solo.',
    color: 'from-accent-amber to-accent-rose',
    pages: [
      {
        title: 'Dashboard',
        description: 'Your personal command center. See assigned tasks, upcoming deadlines, and quick links to the work that matters most to you.',
        href: '/journey/dashboard',
        outcome: 'Start every day with clarity on what to do.',
      },
      {
        title: 'Tasks',
        description: 'Open assigned tasks, update status, log time, add comments, ask questions, and attach files.',
        href: '/journey/tasks',
        outcome: 'Make progress visible and keep everyone informed.',
      },
      {
        title: 'Projects',
        description: 'View projects you are part of. In personal mode, manage your own private projects.',
        href: '/journey/projects',
        outcome: 'Organize work across multiple contexts.',
      },
      {
        title: 'Notifications',
        description: 'Stay aware of mentions, task changes, and reminders so nothing slips through the cracks.',
        href: '/journey/notifications',
        outcome: 'Never miss an update that affects your work.',
      },
      {
        title: 'Settings',
        description: 'Pick your preferred theme, language, and notification channels.',
        href: '/journey/settings',
        outcome: 'Work comfortably during long sessions.',
      },
      {
        title: 'Profile',
        description: 'Keep your name, contact info, and avatar up to date for smoother collaboration.',
        href: '/journey/profile',
        outcome: 'Help teammates know who you are and how to reach you.',
      },
    ],
  },
};

const organizationalOutcomes = [
  {
    title: 'Faster Delivery',
    description: 'Clear projects, tasks, and deadlines reduce delays and keep teams shipping.',
    icon: Zap,
    metric: '30%',
    metricLabel: 'faster delivery',
  },
  {
    title: 'Better Visibility',
    description: 'Managers and admins see progress in real time, not after the fact.',
    icon: Activity,
    metric: 'Live',
    metricLabel: 'status tracking',
  },
  {
    title: 'Secure Collaboration',
    description: 'Role-based access and audit logs keep sensitive data protected and accountable.',
    icon: Lock,
    metric: '100%',
    metricLabel: 'traceable actions',
  },
  {
    title: 'Scalable Structure',
    description: 'From 5 to 500 users, the same system adapts to your organization’s growth.',
    icon: Globe,
    metric: '500+',
    metricLabel: 'organizations',
  },
];

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="hero-mesh">
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
      </div>
      <div className="hero-noise" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/60 to-[#030712]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white/80 mb-6">
            <BarChart3 className="h-4 w-4 text-accent-blue" />
            System Insights
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            How ProTask works — and how it works for you
          </h1>
          <p className="text-white/60 max-w-3xl mx-auto text-lg leading-relaxed">
            {APP_NAME} is a project management platform built for Kenyan organizations. It connects people, work, and outcomes in one place — from infrastructure projects to digital transformation.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-6 text-center">What you can achieve</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {organizationalOutcomes.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{item.metric}</div>
                      <div className="text-xs text-white/50">{item.metricLabel}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                </div>
              );
            }            )}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-4 text-center">Two ways to use ProTask</h2>
          <p className="text-white/60 max-w-2xl mx-auto text-center mb-12">
            ProTask adapts to how you work. Choose personal mode for solo productivity, or organization mode for team collaboration.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="glass-card p-8">
              <div className="inline-flex items-center rounded-xl bg-gradient-to-br from-accent-amber to-accent-rose px-3 py-1 text-xs font-semibold text-white mb-4">
                Personal Mode
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Private Workspace</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Perfect for individual contributors, freelancers, or anyone managing their own tasks. Get a personal project, task templates, and a distraction-free environment — no organization required.
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> Auto-created Personal Tasks project</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> Default task templates (Daily Standup, Bug Fix, etc.)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> Personal dashboard with charts and analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> No collaboration overhead — pure focus</li>
              </ul>
            </div>
            <div className="glass-card p-8">
              <div className="inline-flex items-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple px-3 py-1 text-xs font-semibold text-white mb-4">
                Organization Mode
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Team Collaboration Hub</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Built for teams that need structure, visibility, and accountability. Invite members, assign roles, manage projects, and track progress across the organization.
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> Projects with leads and team members</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> Role-based access (Admin, Manager, Team Member)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> Teams, reports, and organization-wide analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" /> Workflows, automation, and custom fields</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-4 text-center">Who uses this system</h2>
          <p className="text-white/60 max-w-2xl mx-auto text-center mb-12">
            Three roles, one shared workspace. Each role sees only what matters to them and contributes to the same goals.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(Object.keys(journeys) as RoleKey[]).map((role) => {
              const data = journeys[role];
              return (
                <div key={role} className="glass-card p-8">
                  <div className={`inline-flex items-center rounded-xl bg-gradient-to-br ${data.color} px-3 py-1 text-xs font-semibold text-white mb-4`}>
                    {data.title}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{data.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{data.description}</p>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80">
                    <Target className="h-4 w-4 text-accent-green shrink-0" />
                    {data.objective}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {(Object.keys(journeys) as RoleKey[]).map((role) => {
          const data = journeys[role];
          return (
            <div key={role} className="mb-20">
              <div className="mb-8">
                <div className={`inline-flex items-center rounded-xl bg-gradient-to-br ${data.color} px-3 py-1 text-xs font-semibold text-white mb-4`}>
                  {data.title}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">How the {data.title} uses ProTask</h2>
                <p className="text-white/60 max-w-3xl leading-relaxed">{data.description}</p>
              </div>

                <div className="grid grid-cols-1 gap-5">
                  {data.pages.map((page, index) => (
                    <div key={`${role}-${index}-${page.title}`} className="glass-card p-6 sm:p-8">
                    <div className="flex items-start gap-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${data.color} text-white font-bold text-sm shadow-lg`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{page.title}</h3>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <Link href={page.href as any} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/15">
                            Visit page
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed mb-3">{page.description}</p>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green-light/10 px-4 py-2.5 text-sm text-white/80">
                          <CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" />
                          <span>
                            <span className="font-semibold text-white">Outcome: </span>
                            {page.outcome}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="glass-card p-8 sm:p-10">
          <div className="flex items-start gap-5 mb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-lg">
              <Layers className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">How goals become outcomes</h3>
              <p className="text-white/70 leading-relaxed max-w-3xl">
                Every role in ProTask follows a simple loop: <span className="text-white font-semibold">define</span> the work, <span className="text-white font-semibold">execute</span> the tasks, <span className="text-white font-semibold">track</span> progress, and <span className="text-white font-semibold">improve</span> through data.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white mb-2">1. Organize</div>
              <p className="text-sm text-white/60">Admins set up the org. Managers create projects. Teams are built with the right people.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white mb-2">2. Assign</div>
              <p className="text-sm text-white/60">Managers break work into tasks, set priorities, due dates, and assign to team members.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white mb-2">3. Execute</div>
              <p className="text-sm text-white/60">Team members update status, log time, comment, and keep work moving forward.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white mb-2">4. Improve</div>
              <p className="text-sm text-white/60">Reports, dashboards, and notifications turn activity into better decisions.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/auth/register" className="btn-primary-modern group">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/auth/login" className="btn-secondary-modern">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
