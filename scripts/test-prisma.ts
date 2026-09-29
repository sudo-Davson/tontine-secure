import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Nombre d'utilisateurs : ${userCount}`);

    const tontineCount = await prisma.tontine.count();
    console.log(`✅ Nombre de tontines : ${tontineCount}`);

    console.log('🎉 Prisma est connecté à Neon !');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Erreur :', e.message);
  process.exit(1);
});