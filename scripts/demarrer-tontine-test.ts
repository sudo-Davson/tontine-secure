// scripts/demarrer-tontine-test.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🚀 Préparation du test de démarrage\n');

  const tontine = await prisma.tontine.findFirst({
    where: { nom: { contains: 'Amis 2026' } },
    include: {
      membres: {
        where: { statut: 'ACTIF' },
        include: {
          user: { select: { firstName: true, lastName: true, kycLevel: true } },
        },
      },
      tours: true,
      cotisations: true,
    },
  });

  if (!tontine) {
    console.log('❌ Tontine non trouvée');
    return;
  }

  console.log(`🎯 Tontine : ${tontine.nom}`);
  console.log(`📌 Statut : ${tontine.statut}`);
  console.log(`👥 Membres actifs : ${tontine.membres.length}`);
  console.log(`🎯 Tours : ${tontine.tours.length}`);
  console.log(`💰 Cotisations : ${tontine.cotisations.length}\n`);

  console.log('👥 Détail des membres :');
  tontine.membres.forEach((m) => {
    console.log(`   - ${m.user.firstName} ${m.user.lastName} (KYC ${m.user.kycLevel})`);
  });

  if (tontine.statut === 'ACTIVE') {
    console.log('\n🔄 Réinitialisation de la tontine...');

    await prisma.$transaction(async (tx) => {
      await tx.cotisation.deleteMany({ where: { tontineId: tontine.id } });
      await tx.tour.deleteMany({ where: { tontineId: tontine.id } });

      await tx.tontine.update({
        where: { id: tontine.id },
        data: {
          statut: 'EN_ATTENTE',
          dateDebut: null,
          tourActuel: 0,
          montantCollecte: 0,
        },
      });
    });

    console.log('✅ Tontine réinitialisée en EN_ATTENTE\n');
  }

  console.log('✅ Prêt pour le test !');
  console.log(`\n📝 Prochaine étape :`);
  console.log(`   1. Va sur http://localhost:3000/tontines/${tontine.id}`);
  console.log(`   2. Tu devrais voir le bouton vert "Démarrer la tontine"`);
  console.log(`   3. Clique dessus et confirme`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());