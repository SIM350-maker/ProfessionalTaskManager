'use client';

import { motion } from 'framer-motion';
import { UserPlus, Settings, Rocket } from 'lucide-react';

const steps = [
  {
    step: '1',
    title: 'Create your account',
    description: 'Sign up your organization in under 2 minutes. Invite your team members via email.',
    icon: UserPlus,
  },
  {
    step: '2',
    title: 'Set up your workspace',
    description: 'Create projects, define teams, configure roles, and customize workflows to match your processes.',
    icon: Settings,
  },
  {
    step: '3',
    title: 'Start collaborating',
    description: 'Assign tasks, track progress, discuss in comments, and deliver projects on time and budget.',
    icon: Rocket,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export function HowItWorks() {
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
            Get started in 3 simple steps
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From sign-up to full productivity — no training required.
          </p>
        </motion.div>

        <motion.div
          className="timeline-track px-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                variants={item}
                className="timeline-step"
              >
                <div className="timeline-dot">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
