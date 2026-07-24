'use client';

import { motion } from 'framer-motion';
import { ClipboardList, MessageSquare, BarChart3, Clock, PieChart, Shield } from 'lucide-react';

const features = [
  { title: 'Task Management', description: 'Create, assign, and track tasks with priorities, due dates, and custom statuses. Kanban-style boards for visual workflow management.', icon: ClipboardList, color: 'blue' as const },
  { title: 'Team Collaboration', description: 'Comment on tasks, mention teammates, and maintain threaded discussions. Keep everyone aligned without endless email chains.', icon: MessageSquare, color: 'purple' as const },
  { title: 'Project Tracking', description: 'Monitor project health with status indicators, milestone tracking, and real-time progress reports across all your initiatives.', icon: BarChart3, color: 'green' as const },
  { title: 'Time Tracking', description: 'Log hours against tasks, monitor estimated vs actual effort, and generate productivity insights for your team.', icon: Clock, color: 'amber' as const },
  { title: 'Reports & Analytics', description: 'Visual dashboards with task completion rates, team velocity, overdue analysis, and exportable reports for stakeholders.', icon: PieChart, color: 'rose' as const },
  { title: 'Role-Based Access', description: 'Granular permissions with Administrator, Manager, and Team Member roles. Keep sensitive data accessible only to authorized users.', icon: Shield, color: 'cyan' as const },
];

type ColorKey = 'blue' | 'purple' | 'green' | 'amber' | 'rose' | 'cyan';

const colorMap: Record<ColorKey, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-accent-blue-light', text: 'text-accent-blue', border: 'border-accent-blue/20' },
  purple: { bg: 'bg-accent-purple-light', text: 'text-accent-purple', border: 'border-accent-purple/20' },
  green: { bg: 'bg-accent-green-light', text: 'text-accent-green', border: 'border-accent-green/20' },
  amber: { bg: 'bg-accent-amber-light', text: 'text-accent-amber', border: 'border-accent-amber/20' },
  rose: { bg: 'bg-accent-rose-light', text: 'text-accent-rose', border: 'border-accent-rose/20' },
  cyan: { bg: 'bg-accent-cyan-light', text: 'text-accent-cyan', border: 'border-accent-cyan/20' },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function FeaturesGrid() {
  return (
    <section className="landing-section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-subtle to-transparent opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="landing-section-title">Everything you need to manage projects</h2>
          <p className="landing-section-subtitle">
            Built for Kenyan teams managing infrastructure, digital transformation, and everyday work.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
                className="landing-card p-6 group cursor-default"
              >
                <div className={`landing-card-icon ${colors.bg} ${colors.text}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className={`landing-card-title mt-5 ${colors.text}`}>{feature.title}</h3>
                <p className="landing-card-text mt-2">{feature.description}</p>
                <div className={`mt-4 h-0.5 w-8 rounded-full bg-gradient-to-r ${colors.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
