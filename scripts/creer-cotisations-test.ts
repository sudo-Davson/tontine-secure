import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🚀 Création des cotisations de test\n');

  const tontine = await prisma.tontine.findFirst({
    where: { nom: { contains: 'Amis 2026' } },
    include: {
      membres: {
        where: { statut: 'ACTIF' },
      },
    },
  });

  if (!tontine) {
    console.log('❌ Tontine non trouvée');
    return;
  }

  console.log(`🎯 Tontine : ${tontine.nom}`);
  console.log(`💰 Montant : ${tontine.montant.toLocaleString()} FCFA`);
  console.log(`👥 ${tontine.membres.length} membre(s) actif(s)\n`);

  const deleted = await prisma.cotisation.deleteMany({
    where: { tontineId: tontine.id },
  });
  console.log(`🧹 ${deleted.count} ancienne(s) cotisation(s) supprimée(s)\n`);

  const echeance = new Date();
  echeance.setDate(echeance.getDate() + 15);

  for (const membre of tontine.membres) {
    const cotisation = await prisma.cotisation.create({
      data: {
        tontineId: tontine.id,
        userId: membre.userId,
        montant: tontine.montant,
        statut: 'EN_ATTENTE',
        dateEcheance: echeance,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: membre.userId },
      select: { firstName: true, lastName: true },
    });

    console.log(`✅ Cotisation créée pour ${user?.firstName} ${user?.lastName}`);
    console.log(`   💰 ${cotisation.montant.toLocaleString()} FCFA`);
    console.log(`   📅 Échéance : ${echeance.toLocaleDateString('fr-FR')}\n`);
  }

  console.log(`🎉 ${tontine.membres.length} cotisation(s) créée(s) avec succès !`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());