// Kenyan Context Seed Data — Organizations
// Research-based: Real Kenyan companies with accurate sectors

export interface SeedOrganization {
  name: string;
  slug: string;
  subscriptionTier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  website?: string;
  defaultTimezone: string;
}

export const organizations: SeedOrganization[] = [
  {
    name: 'Safaricom PLC',
    slug: 'safaricom-plc',
    subscriptionTier: 'ENTERPRISE',
    website: 'https://www.safaricom.co.ke',
    defaultTimezone: 'Africa/Nairobi',
  },
  {
    name: 'Equity Bank Kenya',
    slug: 'equity-bank-kenya',
    subscriptionTier: 'PROFESSIONAL',
    website: 'https://equitybank.co.ke',
    defaultTimezone: 'Africa/Nairobi',
  },
  {
    name: 'KCB Group',
    slug: 'kcb-group',
    subscriptionTier: 'PROFESSIONAL',
    website: 'https://kcbgroup.com',
    defaultTimezone: 'Africa/Nairobi',
  },
  {
    name: 'Kenya Electricity Generating Company (KenGen)',
    slug: 'kengen',
    subscriptionTier: 'PROFESSIONAL',
    website: 'https://www.kengen.co.ke',
    defaultTimezone: 'Africa/Nairobi',
  },
  {
    name: 'Ministry of ICT & Digital Economy',
    slug: 'ministry-of-ict',
    subscriptionTier: 'ENTERPRISE',
    website: 'https://www.ict.go.ke',
    defaultTimezone: 'Africa/Nairobi',
  },
];
