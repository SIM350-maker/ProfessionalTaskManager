/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const path = require('path');

try {
  const root = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
  process.chdir(root);
  const huskyBin = path.join(process.cwd(), 'apps/web/node_modules/.bin/husky');
  execSync(`"${huskyBin}" install apps/web/.husky`, { stdio: 'inherit' });
} catch (error) {
  console.log('Skipping husky install:', error.message);
  process.exit(0);
}
