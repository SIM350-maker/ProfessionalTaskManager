'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/helpers';

const tiers = [
  {
    name: 'Free',
    price: 'KES 0',
    period: '/month',
    description: 'For small teams getting started.',
    features: ['Up to 5 users', '10 projects', 'Basic task management', 'Email notifications', 'Community support'],
    cta: 'Get Started',
    href: '/auth/register',
    featured: false,
  },
  {
    name: 'Starter',
    price: 'KES 1,500',
    period: '/user/month',
    description: 'For growing teams and departments.',
    features: ['Up to 25 users', 'Unlimited projects', 'Advanced reporting', 'Time tracking', 'Priority email support', 'API access'],
    cta: 'Start Free Trial',
    href: '/auth/register',
    featured: true,
  },
  {
    name: 'Professional',
    price: 'KES 3,000',
    period: '/user/month',
    description: 'For organizations with advanced needs.',
    features: ['Unlimited users', 'Unlimited projects', 'Custom roles & permissions', 'Audit logs', 'SSO integration', 'Dedicated support', 'SLA guarantee'],
    cta: 'Contact Sales',
    href: '/auth/register',
    featured: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large institutions and government.',
    features: ['On-premise deployment', 'Custom integrations', 'Advanced security & compliance', 'Dedicated infrastructure', '24/7 support', 'Training & onboarding'],
    cta: 'Talk to Us',
    href: '/auth/register',
    featured: false,
  },
];

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

export function PricingCards() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="relative py-24 overflow-hidden">
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
            Simple, transparent pricing
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your organization. All prices in Kenyan Shillings.
          </p>

          <div className="pricing-toggle">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn('pricing-toggle-option', !isYearly && 'active')}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn('pricing-toggle-option', isYearly && 'active')}
            >
              Yearly
            </button>
            <div
              className="pricing-toggle-indicator"
              style={{
                width: '50%',
                left: isYearly ? '50%' : '0%',
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={item}
              className={cn(
                'relative rounded-2xl p-6 transition-all duration-300',
                tier.featured
                  ? 'landing-pricing-card-featured bg-white/5'
                  : 'glass-card hover:border-white/20'
              )}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent-blue px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-sm text-white/50 ml-1">{tier.period}</span>}
                </div>
                <p className="text-sm text-white/60 mt-2">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                    <Check className="h-4 w-4 text-accent-green shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href={tier.href}
                className={cn(
                  'block w-full rounded-full text-center font-semibold transition-all duration-300',
                  tier.featured ? 'btn-primary-modern' : 'btn-secondary-modern'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tier.cta}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
