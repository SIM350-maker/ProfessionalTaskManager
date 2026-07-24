// Usage: npx tsx scripts/reset-db.ts
// Requires DATABASE_URL in environment (or .env.local / .env)
// WARNING: This will DESTROY all data in the database.

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const appDir = resolve(import.meta.dirname, '..', 'apps', 'web');

function run(label: string, command: string) {
  console.log(`\n--- ${label} ---`);
  console.log(`  $ ${command}`);
  execSync(command, { cwd: appDir, stdio: 'inherit' });
  console.log(`  ✓ ${label} complete`);
}

async function main() {
  console.log('=== DATABASE RESET ===\n');
  console.log('WARNING: This will destroy all existing data!');
  console.log(`Working directory: ${appDir}\n`);

  // 1. Drop all tables using Prisma migrate
  run('Dropping all tables', 'npx prisma migrate reset --force');

  // 2. Run migrations
  run('Running migrations', 'npx prisma migrate deploy');

  // 3. Generate Prisma client
  run('Generating Prisma client', 'npx prisma generate');

  // 4. Seed the database
  run('Seeding database', 'npx prisma db seed');

  console.log('\n=== RESET COMPLETE ===');
  console.log('Database has been reset and re-seeded successfully.');
}

main().catch((err) => {
  console.error('\n❌ Reset failed:', err);
  process.exit(1);
});
