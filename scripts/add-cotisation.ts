import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  // Récupérer une tontine
  const tontine = await prisma.tontine.findFirst();
  if (!tontine) {
    console.log('❌ Aucune tontine');
    return;
  }

  // Récupérer un membre
  const membre = await prisma.member.findFirst({
    where: { tontineId: tontine.id, statut: 'ACTIF' },
  });
  if (!membre) {
    console.log('❌ Aucun membre');
    return;
  }

  // Créer une cotisation
  const cotisation = await prisma.cotisation.create({
    data: {
      tontineId: tontine.id,
      userId: membre.userId,
      montant: tontine.montant,
      statut: 'PAYEE',
      dateEcheance: new Date(),
      datePaiement: new Date(),
      methodePaiement: 'TMONEY',
    },
  });

  console.log('✅ Cotisation créée :', cotisation.id);
  console.log('   Montant :', cotisation.montant.toLocaleString(), 'FCFA');
  console.log('   Membre :', membre.userId);
  console.log('   Tontine :', tontine.nom);

  // Mettre la tontine en ACTIVE
  await prisma.tontine.update({
    where: { id: tontine.id },
    data: { statut: 'ACTIVE' },
  });
  console.log('✅ Tontine passée en ACTIVE');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());