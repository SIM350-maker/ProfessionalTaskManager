'use client';

import { motion } from 'framer-motion';
import { ClipboardList, MessageSquare, BarChart3, Clock, PieChart, Shield } from 'lucide-react';

type FeatureItem = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  span: string;
  color: ColorKey;
};

const features: FeatureItem[] = [
  {
    title: 'Task Management',
    description: 'Create, assign, and track tasks with priorities, due dates, and custom statuses. Kanban-style boards for visual workflow management.',
    icon: ClipboardList,
    span: 'bento-span-4',
    color: 'blue',
  },
  {
    title: 'Team Collaboration',
    description: 'Comment on tasks, mention teammates, and maintain threaded discussions. Keep everyone aligned without endless email chains.',
    icon: MessageSquare,
    span: 'bento-span-4',
    color: 'purple',
  },
  {
    title: 'Project Tracking',
    description: 'Monitor project health with status indicators, milestone tracking, and real-time progress reports across all your initiatives.',
    icon: BarChart3,
    span: 'bento-span-4',
    color: 'green',
  },
  {
    title: 'Time Tracking',
    description: 'Log hours against tasks, monitor estimated vs actual effort, and generate productivity insights for your team.',
    icon: Clock,
    span: 'bento-span-4',
    color: 'amber',
  },
  {
    title: 'Reports & Analytics',
    description: 'Visual dashboards with task completion rates, team velocity, overdue analysis, and exportable reports for stakeholders.',
    icon: PieChart,
    span: 'bento-span-4',
    color: 'rose',
  },
  {
    title: 'Role-Based Access',
    description: 'Granular permissions with Administrator, Manager, and Team Member roles. Keep sensitive data accessible only to authorized users.',
    icon: Shield,
    span: 'bento-span-4',
    color: 'cyan',
  },
];

type ColorKey = 'blue' | 'purple' | 'green' | 'amber' | 'rose' | 'cyan';

const colorMap: Record<ColorKey, { bg: string; text: string; border: string; glow: string }> = {
  blue: { bg: 'bg-accent-blue-light', text: 'text-accent-blue', border: 'border-accent-blue/20', glow: 'glow-blue' },
  purple: { bg: 'bg-accent-purple-light', text: 'text-accent-purple', border: 'border-accent-purple/20', glow: 'glow-purple' },
  green: { bg: 'bg-accent-green-light', text: 'text-accent-green', border: 'border-accent-green/20', glow: 'glow-blue' },
  amber: { bg: 'bg-accent-amber-light', text: 'text-accent-amber', border: 'border-accent-amber/20', glow: 'glow-purple' },
  rose: { bg: 'bg-accent-rose-light', text: 'text-accent-rose', border: 'border-accent-rose/20', glow: 'glow-blue' },
  cyan: { bg: 'bg-accent-cyan-light', text: 'text-accent-cyan', border: 'border-accent-cyan/20', glow: 'glow-cyan' },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function FeaturesGrid() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#030712]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-subtle/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Everything you need to manage projects
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Built for Kenyan teams managing infrastructure, digital transformation, and everyday work.
          </p>
        </motion.div>

        <motion.div
          className="bento-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className={`${feature.span}`}
              >
                <div className={`glass-card h-full p-6 ${colors.glow}`}>
                  <div className={`inline-flex items-center justify-center rounded-xl ${colors.bg} ${colors.text} p-3 mb-5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
