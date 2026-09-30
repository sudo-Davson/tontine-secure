import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('⏰ Réveil de Neon...\n');

  const prisma = new PrismaClient();

  for (let i = 1; i <= 15; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✅ Neon réveillé après ${i} tentative(s) !`);
      await prisma.$disconnect();
      return;
    } catch (error: any) {
      console.log(`❌ Tentative ${i}/15 échouée, retry dans 3s...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log('❌ Impossible de réveiller Neon');
  await prisma.$disconnect();
  process.exit(1);
}

main();