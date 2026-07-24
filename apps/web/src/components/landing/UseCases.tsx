'use client';

import { motion } from 'framer-motion';
import { Briefcase, Cpu, Banknote, Building2 } from 'lucide-react';

const useCases = [
  {
    title: 'Infrastructure Projects',
    description: 'Track milestones for road construction, energy projects, and county development initiatives with Gantt-style timeline views and stakeholder reporting.',
    sectors: ['Energy', 'Construction', 'County Government'],
    tag: 'amber' as const,
    icon: Briefcase,
  },
  {
    title: 'Digital Transformation',
    description: 'Manage ICT modernization programs, system migrations, and digital service delivery projects with agile workflows and technical team coordination.',
    sectors: ['ICT', 'Fintech', 'Telecommunications'],
    tag: 'blue' as const,
    icon: Cpu,
  },
  {
    title: 'Financial Services',
    description: 'Coordinate mobile banking rollouts, agent network expansion, and regulatory compliance projects across banking and microfinance institutions.',
    sectors: ['Banking', 'Microfinance', 'Insurance'],
    tag: 'green' as const,
    icon: Banknote,
  },
  {
    title: 'Government Delivery',
    description: 'Support Huduma Centre services, national ID programs, and citizen-facing digital platforms with transparent progress tracking and public reporting.',
    sectors: ['Government', 'Public Sector', 'Development'],
    tag: 'purple' as const,
    icon: Building2,
  },
];

type TagKey = 'amber' | 'blue' | 'green' | 'purple';

const tagColorMap: Record<TagKey, { bg: string; text: string; border: string; icon: string }> = {
  amber: { bg: 'bg-accent-amber-light', text: 'text-accent-amber', border: 'border-accent-amber/30', icon: 'text-accent-amber' },
  blue: { bg: 'bg-accent-blue-light', text: 'text-accent-blue', border: 'border-accent-blue/30', icon: 'text-accent-blue' },
  green: { bg: 'bg-accent-green-light', text: 'text-accent-green', border: 'border-accent-green/30', icon: 'text-accent-green' },
  purple: { bg: 'bg-accent-purple-light', text: 'text-accent-purple', border: 'border-accent-purple/30', icon: 'text-accent-purple' },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export function UseCases() {
  return (
    <section className="landing-section-alt relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-subtle via-transparent to-bg-subtle" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="landing-section-title">Built for Kenyan organizations</h2>
          <p className="landing-section-subtitle">
            From government parastatals to startups — adapts to your industry.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {useCases.map((useCase) => {
            const colors = tagColorMap[useCase.tag];
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                variants={item}
                className="landing-card p-8 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.icon} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="landing-card-title text-xl">{useCase.title}</h3>
                    <p className="landing-card-text mt-2">{useCase.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {useCase.sectors.map((sector) => (
                    <span
                      key={sector}
                      className={`landing-use-case-tag ${colors.bg} ${colors.text} ${colors.border} border`}
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
