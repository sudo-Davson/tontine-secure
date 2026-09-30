import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🧹 Suppression de toutes les sessions...');
  const result = await prisma.session.deleteMany({});
  console.log(`✅ ${result.count} session(s) supprimée(s)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());