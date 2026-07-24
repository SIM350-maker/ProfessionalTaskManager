// Kenyan Context Seed Data — Projects
// Research-based: Realistic Kenyan projects by sector

export interface SeedProject {
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  visibility: 'PRIVATE' | 'INTERNAL' | 'PUBLIC';
  color: string;
  organizationSlug: string;
  teamMemberIndex: number; // index into the org's team members for owner
}

export const projects: SeedProject[] = [
  // Safaricom PLC (slugs: safaricom-plc)
  {
    name: 'M-Pesa Digital Upgrade v3',
    description: 'Phase 3 of the M-Pesa platform modernization including API gateway migration, new microservices for merchant payments, and enhanced fraud detection using machine learning.',
    status: 'ACTIVE',
    visibility: 'INTERNAL',
    color: '#00A94F', // Safaricom green
    organizationSlug: 'safaricom-plc',
    teamMemberIndex: 0,
  },
  {
    name: '5G Network Expansion — Nairobi Metro',
    description: 'Rollout of 5G infrastructure across Nairobi metropolitan area targeting 200 new base stations in industrial areas, business districts, and selected residential zones.',
    status: 'ACTIVE',
    visibility: 'INTERNAL',
    color: '#E60000', // Safaricom red
    organizationSlug: 'safaricom-plc',
    teamMemberIndex: 1,
  },
  {
    name: 'Customer Experience Transformation',
    description: 'Unified customer platform integrating voice, chat, social media, and USSD channels with AI-powered chatbot for first-contact resolution.',
    status: 'PLANNING',
    visibility: 'INTERNAL',
    color: '#0077C8',
    organizationSlug: 'safaricom-plc',
    teamMemberIndex: 2,
  },
  // Equity Bank Kenya
  {
    name: 'Equitel Mobile Banking v3',
    description: 'Next-generation mobile banking platform with enhanced micro-loan features, savings groups integration (chamas), and M-Pesa interoperability.',
    status: 'ACTIVE',
    visibility: 'INTERNAL',
    color: '#7F1734', // Equity red
    organizationSlug: 'equity-bank-kenya',
    teamMemberIndex: 0,
  },
  {
    name: 'Agency Banking Expansion — Rural Kenya',
    description: 'Expand Equitel agency network to 500 new agents in underserved rural counties including Turkana, Marsabit, Mandera, and Wajir.',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#E8B800', // Equity gold
    organizationSlug: 'equity-bank-kenya',
    teamMemberIndex: 1,
  },
  // KCB Group
  {
    name: 'Core Banking System Modernization',
    description: 'Migration from legacy core banking system to cloud-native microservices architecture. Includes customer data migration, regulatory reporting upgrade, and disaster recovery.',
    status: 'ACTIVE',
    visibility: 'INTERNAL',
    color: '#003F87', // KCB blue
    organizationSlug: 'kcb-group',
    teamMemberIndex: 0,
  },
  {
    name: 'KCB M-Pesa Integration Platform',
    description: 'Deep integration between KCB banking systems and Safaricom M-Pesa APIs enabling real-time account-to-wallet transfers, loan disbursements, and repayment collection.',
    status: 'ACTIVE',
    visibility: 'INTERNAL',
    color: '#00A94F',
    organizationSlug: 'kcb-group',
    teamMemberIndex: 1,
  },
  // KenGen
  {
    name: 'Olkaria Geothermal Plant — Unit 7 Expansion',
    description: 'Design and construction of an additional 70 MW geothermal unit at Olkaria, including well drilling, turbine installation, and grid connection infrastructure.',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#FF6B00', // Energy orange
    organizationSlug: 'kengen',
    teamMemberIndex: 0,
  },
  {
    name: 'Lake Turkana Wind Power — Feasibility Study',
    description: 'Comprehensive feasibility study for a new 200 MW wind farm in Turkana County including environmental impact assessment, geotechnical surveys, and community stakeholder engagement.',
    status: 'PLANNING',
    visibility: 'INTERNAL',
    color: '#2E8B57',
    organizationSlug: 'kengen',
    teamMemberIndex: 1,
  },
  {
    name: 'National Grid Modernization Program',
    description: 'Upgrade of transmission and distribution infrastructure including smart grid sensors, SCADA system upgrade, and integration of distributed renewable energy sources.',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#4169E1',
    organizationSlug: 'kengen',
    teamMemberIndex: 2,
  },
  // Ministry of ICT
  {
    name: 'Huduma Centre Digital Transformation',
    description: 'Digitization of 58 Huduma Centres nationwide with integrated service portal, queue management system, and real-time service analytics dashboard.',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#0033A0', // Kenya government blue
    organizationSlug: 'ministry-of-ict',
    teamMemberIndex: 0,
  },
  {
    name: 'National Fiber Optic Backbone — Phase IV',
    description: 'Extension of the national fiber optic infrastructure to connect 15 county headquarters currently underserved, including Lamu, Mandera, and Marsabit.',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#1A5276',
    organizationSlug: 'ministry-of-ict',
    teamMemberIndex: 1,
  },
  {
    name: 'Kenya Digital ID System (Maisha Namba)',
    description: 'Implementation of the digital national ID system including biometric registration, backend infrastructure, privacy framework, and integration with government services.',
    status: 'PLANNING',
    visibility: 'INTERNAL',
    color: '#8E44AD',
    organizationSlug: 'ministry-of-ict',
    teamMemberIndex: 2,
  },
  {
    name: 'Ajira Digital Program 2.0',
    description: 'Scale-up of the Ajira Digital Program to train 500,000 youth in digital skills including software development, data entry, graphic design, and online marketing.',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#27AE60',
    organizationSlug: 'ministry-of-ict',
    teamMemberIndex: 0,
  },
  {
    name: 'County Connectivity Project — Last Mile',
    description: 'Connect all 290 constituency-level ICT hubs to the national fiber backbone with community Wi-Fi hotspots and digital literacy training centers.',
    status: 'PLANNING',
    visibility: 'PUBLIC',
    color: '#2980B9',
    organizationSlug: 'ministry-of-ict',
    teamMemberIndex: 1,
  },
];
