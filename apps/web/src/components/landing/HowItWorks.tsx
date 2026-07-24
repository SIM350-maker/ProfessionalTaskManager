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
          <h2 className="landing-section-title">Get started in 3 simple steps</h2>
          <p className="landing-section-subtitle">
            From sign-up to full productivity — no training required.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-12 md:grid-cols-3"
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
                className="relative text-center group"
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    className="landing-step-circle"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Icon className="h-8 w-8" />
                  </motion.div>
                </div>
                <h3 className="landing-card-title text-xl mb-3 group-hover:text-accent-blue transition-colors">
                  {step.title}
                </h3>
                <p className="landing-card-text max-w-sm mx-auto">{step.description}</p>

                {step.step !== '3' && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent-blue/40 to-accent-purple/40 -z-10" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
