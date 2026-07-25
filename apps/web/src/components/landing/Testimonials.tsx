'use client';

import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';

const testimonials = [
  {
    quote: 'ProTask transformed how we deliver county infrastructure projects. Stakeholder reporting used to take days — now it takes minutes.',
    name: 'James Mwangi',
    role: 'Project Director',
    organization: 'Ministry of Infrastructure',
    avatarUrl: '',
    initials: 'JM',
  },
  {
    quote: 'The role-based access and audit logs gave our compliance team confidence. We finally have visibility into who changed what and when.',
    name: 'Sarah Kimani',
    role: 'CTO',
    organization: 'Digital Services Agency',
    avatarUrl: '',
    initials: 'SK',
  },
  {
    quote: 'We migrated from spreadsheets to ProTask in a week. Time tracking and workload balancing improved our team velocity by 30% inside the first month.',
    name: 'David Ochieng',
    role: 'Program Manager',
    organization: 'Kenya Power',
    avatarUrl: '',
    initials: 'DO',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export function Testimonials() {
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
            Trusted by leading teams
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            See how organizations across Kenya use ProTask to deliver with confidence.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={item}>
              <div className="testimonial-card h-full">
                <p className="text-sm text-white/80 leading-relaxed mb-6 relative z-10">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={testimonial.avatarUrl}
                    firstName={testimonial.name.split(' ')[0]}
                    lastName={testimonial.name.split(' ').slice(1).join(' ')}
                    size="md"
                    className="ring-2 ring-white/10"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                    <div className="text-xs text-white/60">{testimonial.role}</div>
                    <div className="text-xs text-white/40">{testimonial.organization}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
