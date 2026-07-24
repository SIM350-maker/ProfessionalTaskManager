import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Hero } from '@/components/landing/Hero';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { UseCases } from '@/components/landing/UseCases';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PricingCards } from '@/components/landing/PricingCards';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: `${APP_NAME} — Project Management for Kenyan Organizations`,
  description: 'Plan, assign, monitor, and complete projects efficiently. Built for Kenyan teams managing infrastructure, digital transformation, and everyday work.',
  openGraph: {
    title: `${APP_NAME} — Project Management for Kenyan Organizations`,
    description: 'Plan, assign, monitor, and complete projects efficiently.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="text-xl font-bold text-text-inverse">{APP_NAME}</div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="landing-nav-link text-sm font-medium">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-bg-card px-4 py-2 text-sm font-semibold text-accent-blue hover:bg-accent-blue-light transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <FeaturesGrid />
        <UseCases />
        <HowItWorks />
        <PricingCards />
      </main>

      <Footer />
    </div>
  );
}
