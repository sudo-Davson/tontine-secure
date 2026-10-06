import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  const tontines = await prisma.tontine.findMany({
    select: {
      id: true,
      nom: true,
      statut: true,
      _count: { select: { membres: true } },
    },
  });

  console.log('📊 Tontines :\n');
  tontines.forEach((t) => {
    console.log(`🎯 ${t.nom}`);
    console.log(`   Statut: ${t.statut}`);
    console.log(`   Membres: ${t._count.membres}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());