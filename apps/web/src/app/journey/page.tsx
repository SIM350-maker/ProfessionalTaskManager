import Link from 'next/link';
import { ArrowRight, BarChart3, FolderKanban, ClipboardList, Users, Bell, Settings } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const journeyEntries = [
  {
    slug: 'dashboard',
    title: 'Dashboard',
    description: 'Your command center for understanding what needs attention and tracking progress.',
    icon: BarChart3,
    color: 'from-accent-blue to-accent-purple',
  },
  {
    slug: 'tasks',
    title: 'Tasks',
    description: 'The central hub for creating, assigning, and tracking work items.',
    icon: ClipboardList,
    color: 'from-accent-green to-accent-cyan',
  },
  {
    slug: 'projects',
    title: 'Projects',
    description: 'Organize work into projects with scope, milestones, and progress tracking.',
    icon: FolderKanban,
    color: 'from-accent-purple to-accent-pink',
  },
  {
    slug: 'teams',
    title: 'Teams',
    description: 'Build and manage teams, add members, and distribute work effectively.',
    icon: Users,
    color: 'from-accent-amber to-accent-orange',
  },
  {
    slug: 'reports',
    title: 'Reports',
    description: 'Analyze performance, track completion rates, and export insights.',
    icon: BarChart3,
    color: 'from-accent-cyan to-accent-blue',
  },
  {
    slug: 'notifications',
    title: 'Notifications',
    description: 'Stay informed with real-time alerts on updates and mentions.',
    icon: Bell,
    color: 'from-accent-amber to-accent-yellow',
  },
  {
    slug: 'settings',
    title: 'Settings',
    description: 'Customize your experience with themes, notifications, and preferences.',
    icon: Settings,
    color: 'from-gray-500 to-gray-700',
  },
  {
    slug: 'profile',
    title: 'Profile',
    description: 'Manage your personal information and avatar for better collaboration.',
    icon: Users,
    color: 'from-accent-green to-accent-emerald',
  },
];

export default function JourneyIndexPage() {
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
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to Insights
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Page Journeys
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
            Learn how to navigate each part of {APP_NAME}. Select a page below to see a detailed walkthrough tailored to your role.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {journeyEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link
                key={entry.slug}
                href={`/journey/${entry.slug}`}
                className="glass-card p-6 transition hover:bg-white/10 group"
              >
                <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${entry.color} p-3 mb-4 text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white/90">{entry.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{entry.description}</p>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-blue">
                  View journey
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
