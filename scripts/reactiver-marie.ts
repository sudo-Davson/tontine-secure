import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  const tontine = await prisma.tontine.findFirst({
    where: { nom: { contains: 'Amis 2026' } },
  });

  if (!tontine) return;

  const marie = await prisma.user.findFirst({
    where: { email: 'marie.adjoua@email.com' },
  });

  if (!marie) return;

  // Réactiver Marie
  await prisma.member.updateMany({
    where: { tontineId: tontine.id, userId: marie.id },
    data: {
      statut: 'ACTIF',
      retireLe: null,
      retirePar: null,
      raisonRetrait: null,
      montantCotise: 0,
      montantPenalite: 0,
      montantRembourse: 0,
      pourcentagePenalite: 0,
      statutRemboursement: 'EN_ATTENTE',
    },
  });

  // Récupérer ses cotisations
  const cotisations = await prisma.cotisation.findMany({
    where: { tontineId: tontine.id, userId: marie.id },
  });

  console.log(`🎯 Tontine : ${tontine.nom}`);
  console.log(`👤 Marie : ${marie.email}`);
  console.log(`✅ Réactivée`);
  console.log(`💰 ${cotisations.length} cotisation(s) trouvée(s)`);
  console.log(`   Total : ${cotisations.reduce((s, c) => s + c.montant, 0).toLocaleString()} FCFA`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());