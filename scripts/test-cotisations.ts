import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔍 Vérification des cotisations\n');

  // Récupérer la tontine
  const tontine = await prisma.tontine.findFirst({
    where: { nom: { contains: 'Amis 2026' } },
    include: {
      membres: {
        where: { statut: 'ACTIF' },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
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

  tontine.membres.forEach((m) => {
    console.log(`  - ${m.user.firstName} ${m.user.lastName} (${m.user.email})`);
  });

  // Récupérer les cotisations
  const cotisations = await prisma.cotisation.findMany({
    where: { tontineId: tontine.id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      tour: { select: { numero: true } },
    },
    orderBy: { dateEcheance: 'desc' },
  });

  console.log(`\n📊 ${cotisations.length} cotisation(s) trouvée(s)\n`);

  cotisations.forEach((c) => {
    console.log(`👤 ${c.user.firstName} ${c.user.lastName}`);
    console.log(`   💰 Montant : ${c.montant.toLocaleString()} FCFA`);
    console.log(`   📌 Statut : ${c.statut}`);
    console.log(`   📅 Échéance : ${c.dateEcheance.toLocaleDateString('fr-FR')}`);
    if (c.datePaiement) {
      console.log(`   ✅ Payé le : ${c.datePaiement.toLocaleDateString('fr-FR')}`);
    }
    if (c.methodePaiement) {
      console.log(`   📱 Méthode : ${c.methodePaiement}`);
    }
    console.log('');
  });

  const stats = {
    total: cotisations.length,
    payees: cotisations.filter((c) => c.statut === 'PAYEE').length,
    enAttente: cotisations.filter((c) => c.statut === 'EN_ATTENTE').length,
    enRetard: cotisations.filter((c) => c.statut === 'EN_RETARD').length,
  };

  console.log('📈 Récapitulatif :');
  console.log(`   Total : ${stats.total}`);
  console.log(`   Payées : ${stats.payees}`);
  console.log(`   En attente : ${stats.enAttente}`);
  console.log(`   En retard : ${stats.enRetard}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());