'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star, Users, Briefcase, TrendingUp, Shield } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const stats = [
  { label: 'Organizations', value: '500+', icon: Briefcase },
  { label: 'Projects Delivered', value: '12K+', icon: TrendingUp },
  { label: 'Active Users', value: '8K+', icon: Users },
  { label: 'Satisfaction', value: '98%', icon: Star },
];

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.18, duration: 0.8, ease: 'easeOut' as const },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Home%20image.png')" }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-slate-900/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/60" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Trusted badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur-md mb-8 shadow-lg"
          >
            <Shield className="h-4 w-4 text-accent-blue" />
            Trusted by leading Kenyan organizations
          </motion.div>

          {/* Main headline */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="landing-hero-title mb-6"
          >
            Organize your team&apos;s work
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="landing-hero-subtitle mx-auto mb-10"
          >
            {APP_NAME} helps Kenyan organizations plan, assign, monitor, and complete projects efficiently.
            From infrastructure to digital transformation — manage every deliverable in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-6"
          >
            <Link
              href="/auth/register"
              className="landing-hero-cta-primary group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/login"
              className="landing-hero-cta-secondary"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Footnote */}
          <motion.p
            custom={4}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="landing-hero-footnote mb-16"
          >
            No credit card required. Free plan includes up to 5 users.
          </motion.p>

          {/* Stats grid */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/25 hover:scale-105"
                >
                  <Icon className="h-6 w-6 text-accent-blue mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
