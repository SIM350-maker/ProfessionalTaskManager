'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Users, ClipboardList, FolderKanban, BarChart3, Bell, Settings, ShieldCheck, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/lib/constants';

type RoleKey = 'ADMINISTRATOR' | 'MANAGER' | 'TEAM_MEMBER';

type JourneyStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  tip?: string;
};

const roleData: Record<RoleKey, { label: string; color: string; steps: JourneyStep[] }> = {
  ADMINISTRATOR: {
    label: 'Administrator',
    color: 'from-accent-blue to-accent-purple',
    steps: [
      {
        id: 'admin-dashboard',
        title: 'Start at the Admin Dashboard',
        description: 'Get a high-level view of system health, user activity, recent signups, and critical alerts across the organization.',
        icon: <ShieldCheck className="h-5 w-5" />,
        href: '/admin',
        tip: 'Use this as your daily command center.',
      },
      {
        id: 'organization',
        title: 'Configure your Organization',
        description: 'Set org details, integrations like Slack, verification status, and calendar tokens so teams operate under one workspace.',
        icon: <Building2 className="h-5 w-5" />,
        href: '/admin/organization',
        tip: 'Keep integrations active to unlock real-time updates.',
      },
      {
        id: 'user-management',
        title: 'Invite and manage users',
        description: 'Add members, assign roles, verify emails, and keep access aligned with responsibilities.',
        icon: <Users className="h-5 w-5" />,
        href: '/admin/users',
        tip: 'Prefer role-based access over sharing credentials.',
      },
      {
        id: 'projects',
        title: 'Create Projects and workflows',
        description: 'Define projects, attach workflows, set visibility, and enable reporting so managers have clear execution lanes.',
        icon: <FolderKanban className="h-5 w-5" />,
        href: '/projects',
        tip: 'Start with a pilot project to validate workflows.',
      },
      {
        id: 'tasks',
        title: 'Oversee task execution',
        description: 'Monitor task boards, re-balance workload, and ensure deadlines are met through the Tasks center.',
        icon: <ClipboardList className="h-5 w-5" />,
        href: '/tasks',
        tip: 'Use filters and labels to spot bottlenecks fast.',
      },
      {
        id: 'reports',
        title: 'Review reports and analytics',
        description: 'Track completion rates, team velocity, overdue tasks, and export insights for stakeholders.',
        icon: <BarChart3 className="h-5 w-5" />,
        href: '/reports',
        tip: 'Schedule weekly exports to keep leadership informed.',
      },
      {
        id: 'notifications',
        title: 'Enable notifications and alerts',
        description: 'Configure in-app and email notifications to stay ahead of blockers and escalations.',
        icon: <Bell className="h-5 w-5" />,
        href: '/notifications',
        tip: 'Start with critical alerts only, then expand.',
      },
      {
        id: 'settings',
        title: 'Finalize your preferences',
        description: 'Set theme, language, timezone, and security preferences that apply across your account.',
        icon: <Settings className="h-5 w-5" />,
        href: '/settings',
        tip: 'Dark mode and accessibility settings can improve long sessions.',
      },
      {
        id: 'profile',
        title: 'Complete your profile',
        description: 'Update your personal information, avatar, and contact details so teams can reach you quickly.',
        icon: <Users className="h-5 w-5" />,
        href: '/profile',
        tip: 'A complete profile builds trust with your team.',
      },
    ],
  },
  MANAGER: {
    label: 'Manager',
    color: 'from-accent-green to-accent-cyan',
    steps: [
      {
        id: 'dashboard',
        title: 'Open your Dashboard',
        description: 'See project health, upcoming deadlines, assigned tasks, and quick actions in one view.',
        icon: <ClipboardList className="h-5 w-5" />,
        href: '/dashboard',
        tip: 'Spend 5 minutes here every morning.',
      },
      {
        id: 'projects',
        title: 'Create or join a Project',
        description: 'Set up project scope, define milestones, assign leads, and configure reporting preferences.',
        icon: <FolderKanban className="h-5 w-5" />,
        href: '/projects',
        tip: 'Name projects clearly so teams can identify them fast.',
      },
      {
        id: 'tasks',
        title: 'Create and assign Tasks',
        description: 'Break work into tasks, set priorities, due dates, labels, and assign to the right team members.',
        icon: <ClipboardList className="h-5 w-5" />,
        href: '/tasks',
        tip: 'Use priorities to signal what must ship first.',
      },
      {
        id: 'teams',
        title: 'Build your Team',
        description: 'Add members, view workloads, and keep communication aligned through team-level visibility.',
        icon: <Users className="h-5 w-5" />,
        href: '/teams',
        tip: 'Balance workloads before assigning extra tasks.',
      },
      {
        id: 'reports',
        title: 'Track progress in Reports',
        description: 'Monitor completion rates, overdue items, and team performance with exportable reports.',
        icon: <BarChart3 className="h-5 w-5" />,
        href: '/reports',
        tip: 'Share reports after major milestones.',
      },
      {
        id: 'notifications',
        title: 'Stay informed with Notifications',
        description: 'Receive real-time alerts on task updates, mentions, and project changes.',
        icon: <Bell className="h-5 w-5" />,
        href: '/notifications',
        tip: 'Enable email digests if you miss in-app updates.',
      },
      {
        id: 'settings',
        title: 'Customize your Settings',
        description: 'Adjust themes, notification channels, languages, and timezone to match how you work best.',
        icon: <Settings className="h-5 w-5" />,
        href: '/settings',
        tip: 'Enable desktop notifications for faster response.',
      },
      {
        id: 'profile',
        title: 'Update your Profile',
        description: 'Keep contact details, role info, and preferences current so collaborators know how to reach you.',
        icon: <Users className="h-5 w-5" />,
        href: '/profile',
        tip: 'Add a clear profile photo for better recognition.',
      },
    ],
  },
  TEAM_MEMBER: {
    label: 'Team Member',
    color: 'from-accent-amber to-accent-rose',
    steps: [
      {
        id: 'dashboard',
        title: 'Check your Dashboard',
        description: 'See assigned tasks, upcoming deadlines, and quick links to the work that matters most to you.',
        icon: <ClipboardList className="h-5 w-5" />,
        href: '/dashboard',
        tip: 'Start here every day to see what is due.',
      },
      {
        id: 'tasks',
        title: 'View and update your Tasks',
        description: 'Open assigned tasks, update status, log time, add comments, and attach files.',
        icon: <ClipboardList className="h-5 w-5" />,
        href: '/tasks',
        tip: 'Use comments to ask questions before blockers grow.',
      },
      {
        id: 'notifications',
        title: 'Monitor Notifications',
        description: 'Stay aware of mentions, task changes, and reminders so nothing slips through.',
        icon: <Bell className="h-5 w-5" />,
        href: '/notifications',
        tip: 'Enable both in-app and email notifications if possible.',
      },
      {
        id: 'settings',
        title: 'Adjust your Settings',
        description: 'Pick your preferred theme, language, and notification channels.',
        icon: <Settings className="h-5 w-5" />,
        href: '/settings',
        tip: 'Dark mode helps during long work sessions.',
      },
      {
        id: 'profile',
        title: 'Complete your Profile',
        description: 'Keep your name, contact info, and avatar up to date for smoother collaboration.',
        icon: <Users className="h-5 w-5" />,
        href: '/profile',
        tip: 'Update your status when taking breaks.',
      },
    ],
  },
};

const journeyTips = [
  'Use labels and priorities to make tasks scannable.',
  'Keep comments concise and action-oriented.',
  'Update task status regularly to reflect real progress.',
  'Enable notifications for mentions and deadline reminders.',
  'Check Reports weekly to catch trends early.',
  'Use the Dashboard as your single source of truth.',
];

export function JourneyClient() {
  const [activeRole, setActiveRole] = useState<RoleKey>('TEAM_MEMBER');
  const [currentStep, setCurrentStep] = useState(0);
  const [showTips, setShowTips] = useState(true);

  const roles: RoleKey[] = ['ADMINISTRATOR', 'MANAGER', 'TEAM_MEMBER'];
  const steps = roleData[activeRole].steps;

  const goTo = (index: number) => {
    setCurrentStep(index);
    setShowTips(false);
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      setShowTips(false);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const step = steps[currentStep]!;

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="hero-mesh">
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
      </div>
      <div className="hero-noise" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Your ProTask Journey
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            A guided walkthrough of how to go from first login to full productivity — tailored to your role.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {roles.map((role) => {
            const isActive = activeRole === role;
            const data = roleData[role];
            return (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  setCurrentStep(0);
                  setShowTips(true);
                }}
                className={`
                  relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300
                  ${isActive ? 'text-white shadow-lg' : 'glass-subtle text-white/70 hover:text-white'}
                `}
              >
                {isActive && (
                  <motion.span
                    layoutId="journey-role-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--color-accent-blue), var(--color-accent-purple))`,
                    }}
                  />
                )}
                <span className="relative z-10">{data.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeRole}-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="glass-card p-8"
              >
                <div className="flex items-start gap-5">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${roleData[activeRole].color} text-white shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                      Step {currentStep + 1} of {steps.length}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                    <p className="text-white/70 leading-relaxed mb-4">{step.description}</p>
                    {step.tip && (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80">
                        <CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" />
                        {step.tip}
                      </div>
                    )}
                    {step.href && (
                      <a
                        href={step.href}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 mt-6"
                      >
                        Open {step.title.replace(/^(Open|Configure|Manage|View|Check|Update|Adjust|Review|Monitor|Enable|Complete|Create|Build|Use|Start|Track)/, '').trim()}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                disabled={currentStep === 0}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goTo(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentStep ? 'w-8 bg-white' : 'w-2.5 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={currentStep === steps.length - 1}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick tips</h3>
              <ul className="space-y-3">
                {journeyTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Your role entry points</h3>
              <div className="space-y-3">
                {steps.slice(0, 5).map((step) => (
                  <a
                    key={step.id}
                    href={step.href}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                      {step.icon}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
