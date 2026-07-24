// Kenyan Context Seed Data — Tasks
// Realistic tasks aligned to Kenyan projects

export interface SeedTask {
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectIndex: number; // index into projects array
  estimatedHours: number;
  daysAhead: number; // how many days from now for due date
}

export const tasks: SeedTask[] = [
  // M-Pesa Digital Upgrade v3 (project 0)
  { title: 'API Gateway migration — design phase', description: 'Design the new API gateway architecture including rate limiting, authentication, and service discovery for M-Pesa microservices.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 0, estimatedHours: 40, daysAhead: 14 },
  { title: 'Merchant payment microservice development', description: 'Build the merchant payment microservice with support for till numbers, paybill, and M-Pesa Express APIs.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 0, estimatedHours: 120, daysAhead: 45 },
  { title: 'Fraud detection ML model training', description: 'Train machine learning models on historical transaction data to detect anomalous patterns and flag potentially fraudulent transactions in real-time.', status: 'TODO', priority: 'MEDIUM', projectIndex: 0, estimatedHours: 80, daysAhead: 60 },
  { title: 'Database schema migration planning', description: 'Plan and document the database migration strategy from monolithic schema to service-per-team microservices pattern.', status: 'DONE', priority: 'HIGH', projectIndex: 0, estimatedHours: 24, daysAhead: -5 },
  { title: 'Security audit — penetration testing', description: 'Engage external security firm for comprehensive penetration testing of all new and modified API endpoints.', status: 'TODO', priority: 'URGENT', projectIndex: 0, estimatedHours: 40, daysAhead: 21 },
  // 5G Network Expansion — Nairobi Metro (project 1)
  { title: 'Site acquisition — 50 base station locations', description: 'Identify and negotiate leases for 50 new 5G base station sites across Nairobi industrial area, Westlands, and Upper Hill.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 1, estimatedHours: 160, daysAhead: 30 },
  { title: 'Fiber backhaul connectivity for new sites', description: 'Coordinate with fiber providers to ensure backhaul connectivity meets 10 Gbps minimum for all new 5G sites.', status: 'TODO', priority: 'MEDIUM', projectIndex: 1, estimatedHours: 80, daysAhead: 45 },
  { title: 'Community stakeholder engagement — residential zones', description: 'Conduct community meetings in Karen, Runda, and Muthaiga to address health concerns about 5G radiation and secure neighborhood approvals.', status: 'IN_REVIEW', priority: 'HIGH', projectIndex: 1, estimatedHours: 60, daysAhead: 7 },
  { title: 'Power infrastructure audit for new sites', description: 'Audit power availability and backup requirements for all 200 sites, including solar-battery feasibility for off-grid locations.', status: 'DONE', priority: 'MEDIUM', projectIndex: 1, estimatedHours: 40, daysAhead: -10 },
  // Customer Experience Transformation (project 2)
  { title: 'AI chatbot — intent classification model', description: 'Develop and train intent classification for Swahili, Sheng, and English customer queries across all service channels.', status: 'TODO', priority: 'HIGH', projectIndex: 2, estimatedHours: 100, daysAhead: 60 },
  { title: 'Unified customer profile data model', description: 'Design the unified customer data model that integrates data from voice, chat, USSD, and social media touchpoints.', status: 'TODO', priority: 'MEDIUM', projectIndex: 2, estimatedHours: 48, daysAhead: 30 },
  // Equitel Mobile Banking v3 (project 3)
  { title: 'Micro-loan engine — credit scoring upgrade', description: 'Enhance the micro-loan credit scoring algorithm to incorporate M-Pesa transaction history and mobile money behavior patterns.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 3, estimatedHours: 80, daysAhead: 21 },
  { title: 'Chama (savings group) integration feature', description: 'Build digital chama management features including group savings, member contributions tracking, and automated dividend calculation.', status: 'IN_REVIEW', priority: 'MEDIUM', projectIndex: 3, estimatedHours: 60, daysAhead: 14 },
  { title: 'M-Pesa interoperability API development', description: 'Develop APIs for real-time balance inquiry, funds transfer, and statement retrieval between Equitel and M-Pesa platforms.', status: 'TODO', priority: 'HIGH', projectIndex: 3, estimatedHours: 100, daysAhead: 45 },
  { title: 'User acceptance testing — phase 1', description: 'Coordinate UAT with 50 pilot users including Equitel agents, small business owners, and rural customers.', status: 'DONE', priority: 'URGENT', projectIndex: 3, estimatedHours: 60, daysAhead: -3 },
  // Agency Banking Expansion (project 4)
  { title: 'Agent recruitment drive — Turkana County', description: 'Launch agent recruitment campaign in Lodwar and Kakuma areas targeting 100 new Equitel agents.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 4, estimatedHours: 120, daysAhead: 30 },
  { title: 'Agent training materials — local languages', description: 'Develop training manuals in Turkana, Somali, and Borana languages for agents in northern Kenya.', status: 'IN_REVIEW', priority: 'MEDIUM', projectIndex: 4, estimatedHours: 40, daysAhead: 7 },
  { title: 'Solar-powered POS terminal deployment', description: 'Deploy 200 solar-powered POS terminals in off-grid areas with satellite connectivity for transaction processing.', status: 'TODO', priority: 'MEDIUM', projectIndex: 4, estimatedHours: 80, daysAhead: 45 },
  // Core Banking System Modernization (project 5)
  { title: 'Legacy system inventory and dependency mapping', description: 'Full inventory of existing core banking modules, databases, interfaces, and third-party integrations.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 5, estimatedHours: 60, daysAhead: 14 },
  { title: 'Customer data migration strategy', description: 'Design data migration strategy for 12 million customer records including deduplication, validation, and historical data archival.', status: 'TODO', priority: 'URGENT', projectIndex: 5, estimatedHours: 80, daysAhead: 21 },
  { title: 'Regulatory reporting module — CBK compliance', description: 'Build the regulatory reporting module ensuring compliance with Central Bank of Kenya (CBK) Prudential Reporting Guidelines 2025.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 5, estimatedHours: 120, daysAhead: 60 },
  { title: 'Disaster recovery infrastructure setup', description: 'Set up active-passive disaster recovery in a second AWS region with automated failover and data replication.', status: 'DONE', priority: 'HIGH', projectIndex: 5, estimatedHours: 100, daysAhead: -15 },
  // KCB M-Pesa Integration (project 6)
  { title: 'Real-time loan disbursement API', description: 'Build API for instant KCB loan disbursement to M-Pesa wallets with automatic reconciliation.', status: 'IN_REVIEW', priority: 'HIGH', projectIndex: 6, estimatedHours: 60, daysAhead: 7 },
  { title: 'Transaction reconciliation system', description: 'Implement automated reconciliation between KCB core banking and M-Pesa settlement reports.', status: 'DONE', priority: 'MEDIUM', projectIndex: 6, estimatedHours: 40, daysAhead: -5 },
  { title: 'Regulatory compliance documentation', description: 'Prepare CBK regulatory submission for the M-Pesa integration partnership including risk assessment and customer protection framework.', status: 'IN_PROGRESS', priority: 'URGENT', projectIndex: 6, estimatedHours: 30, daysAhead: 10 },
  // Olkaria Geothermal Plant — Unit 7 (project 7)
  { title: 'Well drilling — site preparation', description: 'Prepare drilling pads and access roads for 3 new production wells in the Olkaria East field.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 7, estimatedHours: 200, daysAhead: 90 },
  { title: 'Environmental impact assessment update', description: 'Update the EIA report for the new unit including air quality, noise, and water usage impact studies.', status: 'DONE', priority: 'HIGH', projectIndex: 7, estimatedHours: 80, daysAhead: -20 },
  { title: 'Turbine procurement — international bidding', description: 'Manage international competitive bidding for the 70 MW steam turbine including technical evaluation and contract negotiation.', status: 'TODO', priority: 'HIGH', projectIndex: 7, estimatedHours: 160, daysAhead: 60 },
  { title: 'Local community engagement — Nakuru County', description: 'Stakeholder engagement with communities in Naivasha and Gilgil areas regarding land access, employment, and CSR programs.', status: 'IN_REVIEW', priority: 'MEDIUM', projectIndex: 7, estimatedHours: 40, daysAhead: 14 },
  // Lake Turkana Wind Power — Feasibility Study (project 8)
  { title: 'Wind resource assessment — Loiyangalani', description: 'Install and monitor 12 anemometer masts across the proposed wind farm site for minimum 6-month data collection.', status: 'TODO', priority: 'HIGH', projectIndex: 8, estimatedHours: 240, daysAhead: 120 },
  { title: 'Geotechnical site survey', description: 'Conduct geotechnical investigations including soil boreholes and geological mapping for turbine foundation design.', status: 'TODO', priority: 'MEDIUM', projectIndex: 8, estimatedHours: 160, daysAhead: 90 },
  { title: 'Community stakeholder mapping', description: 'Identify and map all community stakeholders in Loiyangalani and Mount Kulal areas including pastoralist groups and conservation organizations.', status: 'TODO', priority: 'MEDIUM', projectIndex: 8, estimatedHours: 40, daysAhead: 30 },
  // National Grid Modernization (project 9)
  { title: 'SCADA system upgrade — specification', description: 'Develop technical specifications for SCADA system upgrade including RTU replacements, fiber optic communication, and control center display systems.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 9, estimatedHours: 80, daysAhead: 21 },
  { title: 'Smart grid sensor deployment — pilot', description: 'Deploy 100 smart grid sensors in Nairobi industrial area for pilot phase including installation, commissioning, and data integration.', status: 'DONE', priority: 'MEDIUM', projectIndex: 9, estimatedHours: 60, daysAhead: -10 },
  { title: 'Distributed solar integration study', description: 'Study the impact of distributed solar PV on grid stability and design integration requirements for feed-in tariff customers.', status: 'TODO', priority: 'LOW', projectIndex: 9, estimatedHours: 60, daysAhead: 45 },
  // Huduma Centre Digital Transformation (project 10)
  { title: 'Integrated service portal — MVP development', description: 'Build the MVP of the integrated Huduma service portal starting with 10 high-volume government services (ID, passport, birth certificate, business registration).', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 10, estimatedHours: 200, daysAhead: 60 },
  { title: 'Queue management system — 10 pilot centres', description: 'Deploy digital queue management system in 10 pilot Huduma Centres including Nairobi GPO, Mombasa, Kisumu, Nakuru, and Eldoret.', status: 'IN_REVIEW', priority: 'HIGH', projectIndex: 10, estimatedHours: 80, daysAhead: 14 },
  { title: 'Digital literacy training for Huduma staff', description: 'Train 500 Huduma Centre staff on the new digital systems including tablet-based service delivery and digital payments.', status: 'TODO', priority: 'MEDIUM', projectIndex: 10, estimatedHours: 120, daysAhead: 45 },
  // National Fiber Optic Backbone — Phase IV (project 11)
  { title: 'Route survey — Lamu to Garissa', description: 'Conduct fiber route survey from Lamu through Garissa covering 350 km including river crossings and protected area assessments.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 11, estimatedHours: 160, daysAhead: 30 },
  { title: 'Wayleave negotiations — county governments', description: 'Negotiate wayleave agreements with 15 county governments for fiber trenching permits and road crossing approvals.', status: 'TODO', priority: 'URGENT', projectIndex: 11, estimatedHours: 120, daysAhead: 14 },
  { title: 'Equipment procurement — DWDM systems', description: 'Procure Dense Wavelength Division Multiplexing (DWDM) equipment for the backbone network upgrade.', status: 'DONE', priority: 'HIGH', projectIndex: 11, estimatedHours: 60, daysAhead: -8 },
  // Kenya Digital ID System (project 12)
  { title: 'Biometric registration system development', description: 'Develop the biometric registration system including fingerprint capture, facial recognition, and secure data enrollment workflows.', status: 'TODO', priority: 'HIGH', projectIndex: 12, estimatedHours: 200, daysAhead: 90 },
  { title: 'Privacy framework and data protection audit', description: 'Conduct privacy impact assessment and ensure compliance with Kenya Data Protection Act 2019 including DPIA documentation.', status: 'TODO', priority: 'URGENT', projectIndex: 12, estimatedHours: 80, daysAhead: 30 },
  { title: 'Integration with Registrar of Persons database', description: 'Design and build integration between the new digital ID system and the existing Registrar of Persons legacy database.', status: 'TODO', priority: 'MEDIUM', projectIndex: 12, estimatedHours: 60, daysAhead: 60 },
  // Ajira Digital Program 2.0 (project 13)
  { title: 'Digital skills curriculum development', description: 'Develop comprehensive digital skills curriculum covering software development, data analytics, digital marketing, graphic design, and online freelancing.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 13, estimatedHours: 120, daysAhead: 21 },
  { title: 'Online learning platform — content migration', description: 'Migrate Ajira Digital learning content to the new LMS platform with support for mobile-first access and offline learning capabilities.', status: 'IN_REVIEW', priority: 'MEDIUM', projectIndex: 13, estimatedHours: 80, daysAhead: 7 },
  { title: 'Trainer recruitment and onboarding', description: 'Recruit and onboard 200 digital skills trainers across all 47 counties with focus on youth and women.', status: 'TODO', priority: 'HIGH', projectIndex: 13, estimatedHours: 160, daysAhead: 45 },
  // County Connectivity Project — Last Mile (project 14)
  { title: 'Connectivity audit — 290 constituency hubs', description: 'Audit current connectivity status and equipment at all 290 constituency ICT hubs to determine last-mile requirements.', status: 'IN_PROGRESS', priority: 'HIGH', projectIndex: 14, estimatedHours: 200, daysAhead: 30 },
  { title: 'Community Wi-Fi hotspot deployment — pilot', description: 'Deploy community Wi-Fi hotspots in 10 constituency hubs with solar-powered equipment and local ISP partnerships.', status: 'TODO', priority: 'MEDIUM', projectIndex: 14, estimatedHours: 80, daysAhead: 60 },
  { title: 'Digital literacy volunteer program', description: 'Design and launch a volunteer program recruiting university students to provide digital literacy training at constituency hubs during school breaks.', status: 'TODO', priority: 'LOW', projectIndex: 14, estimatedHours: 40, daysAhead: 45 },
];
