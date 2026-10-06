import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  // Trouver tous les membres non-ADMIN
  const membres = await prisma.member.findMany({
    where: { role: { not: 'ADMIN' } },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      tontine: { select: { nom: true, createurId: true } },
    },
  });

  console.log(`📊 ${membres.length} membre(s) non-ADMIN trouvé(s)\n`);

  for (const membre of membres) {
    // Si le membre est le créateur de la tontine → ADMIN
    if (membre.userId === membre.tontine.createurId) {
      await prisma.member.update({
        where: { id: membre.id },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ ${membre.user.firstName} ${membre.user.lastName} → ADMIN (tontine: ${membre.tontine.nom})`);
    }
  }

  console.log('\n🎉 Correction terminée !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());