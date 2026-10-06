import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🚀 Setup test soft delete\n');

  // 1. Prendre la tontine "Tontine des Amis 2026"
  const tontine = await prisma.tontine.findFirst({
    where: { nom: { contains: 'Amis 2026' } },
  });

  if (!tontine) {
    console.log('❌ Tontine non trouvée');
    return;
  }

  console.log(`🎯 Tontine : ${tontine.nom}`);
  console.log(`   Statut : ${tontine.statut}`);

  // 2. Ajouter Marie
  const marie = await prisma.user.findFirst({
    where: { email: 'marie.adjoua@email.com' },
  });

  if (!marie) {
    console.log('❌ Marie non trouvée');
    return;
  }

  // Vérifier si Marie est déjà membre
  const existing = await prisma.member.findFirst({
    where: { tontineId: tontine.id, userId: marie.id },
  });

  let membreId;
  if (existing) {
    await prisma.member.update({
      where: { id: existing.id },
      data: { statut: 'ACTIF', retireLe: null, raisonRetrait: null },
    });
    membreId = existing.id;
    console.log(`   ✅ Marie réactivée`);
  } else {
    const newMembre = await prisma.member.create({
      data: {
        tontineId: tontine.id,
        userId: marie.id,
        role: 'MEMBRE',
        statut: 'ACTIF',
      },
    });
    membreId = newMembre.id;
    console.log(`   ✅ Marie ajoutée`);
  }

  // 3. Créer une cotisation pour Marie
  const existingCotisation = await prisma.cotisation.findFirst({
    where: { tontineId: tontine.id, userId: marie.id },
  });

  if (!existingCotisation) {
    await prisma.cotisation.create({
      data: {
        tontineId: tontine.id,
        userId: marie.id,
        montant: tontine.montant,
        statut: 'PAYEE',
        dateEcheance: new Date(),
        datePaiement: new Date(),
        methodePaiement: 'TMONEY',
      },
    });
    console.log(`   ✅ Cotisation créée (${tontine.montant.toLocaleString()} FCFA)`);
  } else {
    console.log(`   ℹ️  Cotisation déjà existante`);
  }

  console.log(`\n🆔 Membre ID : ${membreId}`);
  console.log(`🆔 User ID : ${marie.id}`);
  console.log(`\n🎉 Prêt pour le test !`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());