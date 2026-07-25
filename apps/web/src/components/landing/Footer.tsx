'use client';

import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-footer-modern">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-bold text-white mb-3">{APP_NAME}</h3>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Professional project management for Kenyan organizations. Plan, assign, monitor, and deliver with confidence.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-accent-green">
              <span className="inline-flex h-2 w-2 rounded-full bg-accent-green animate-pulse-dot" />
              All systems operational
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/#features" className="footer-link">Features</Link></li>
              <li><Link href="/#pricing" className="footer-link">Pricing</Link></li>
              <li><Link href="/auth/register" className="footer-link">Get Started</Link></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/auth/login" className="footer-link">Sign In</Link></li>
              <li><Link href="/auth/register" className="footer-link">Create Account</Link></li>
              <li><Link href="/auth/reset-password" className="footer-link">Reset Password</Link></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-white/60">Nairobi, Kenya</li>
              <li><a href="mailto:support@professionaltaskmanager.com" className="footer-link">support@professionaltaskmanager.com</a></li>
              <li><a href="/docs/01_Project_Vision.md" className="footer-link">Documentation</a></li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-12 border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="inline-flex h-2 w-2 rounded-full bg-accent-green animate-pulse-dot" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
