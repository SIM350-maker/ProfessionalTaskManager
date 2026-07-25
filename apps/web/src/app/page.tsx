import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Hero } from '@/components/landing/Hero';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { UseCases } from '@/components/landing/UseCases';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingCards } from '@/components/landing/PricingCards';
import { CTABlock } from '@/components/landing/CTABlock';
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
    <div className="flex min-h-screen flex-col landing-container">
      <header className="landing-nav-modern">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-logo-modern">
            <div className="landing-logo-mark">
              <span className="text-white text-sm font-bold">{APP_NAME.charAt(0)}</span>
            </div>
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="btn-primary-modern text-sm !py-2 !px-5"
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
        <Testimonials />
        <PricingCards />
        <CTABlock />
      </main>

      <Footer />
    </div>
  );
}
