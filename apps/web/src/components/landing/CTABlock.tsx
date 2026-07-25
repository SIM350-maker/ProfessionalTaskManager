'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTABlock() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="cta-block px-8 py-16 sm:px-16 sm:py-20 text-center"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to transform how your team works?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Join hundreds of Kenyan organizations already using ProTask to plan, assign, and deliver projects with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register" className="btn-primary-modern group">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/auth/login" className="btn-secondary-modern">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
