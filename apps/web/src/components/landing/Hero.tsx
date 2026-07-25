'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, CheckCircle2, Briefcase, TrendingUp, Users, Star, BarChart3 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const stats = [
  { label: 'Organizations', value: '500+', icon: Briefcase },
  { label: 'Projects Delivered', value: '12K+', icon: TrendingUp },
  { label: 'Active Users', value: '8K+', icon: Users },
  { label: 'Satisfaction', value: '98%', icon: Star },
];

const highlights = [
  'Role-based access control',
  'Real-time collaboration',
  'Advanced reporting & analytics',
];

export function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVideoLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#030712]">
      <div className="hero-mesh">
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
        <div className="hero-mesh-orb" />
      </div>
      <div className="hero-noise" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/60 to-[#030712]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white/80 mb-8">
              <Shield className="h-4 w-4 text-accent-blue" />
              Trusted by leading Kenyan organizations
            </div>

            <h1 className="text-display font-extrabold text-white mb-6 tracking-tight">
              Organize your <span className="text-gradient-mesh">team&apos;s work</span>
            </h1>

            <p className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
              {APP_NAME} helps Kenyan organizations plan, assign, monitor, and complete projects efficiently. From infrastructure to digital transformation — manage every deliverable in one place.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <Link href="/auth/register" className="btn-primary-modern group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/insights" className="btn-secondary-modern group">
                <BarChart3 className="mr-2 h-4 w-4" />
                System Insights
              </Link>
              <Link href="/auth/login" className="btn-secondary-modern">
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {highlights.map((feature) => (
                <div key={feature} className="inline-flex items-center gap-2 rounded-full glass-subtle px-3 py-1.5 text-xs font-medium text-white/70">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-green" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <div ref={containerRef} className="floating-mockup">
              {videoLoaded ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                >
                  <source src="/landing%20page.mp4" type="video/mp4" />
                </video>
              ) : (
                <div className="w-full aspect-video rounded-3xl bg-white/5" />
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card text-center py-6">
                <Icon className="h-6 w-6 text-accent-blue mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
