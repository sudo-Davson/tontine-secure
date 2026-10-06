import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';
import { penaliteService } from '../lib/services/penalite-service';

async function main() {
  // 1. Vérifier les champs
  const membre = await prisma.member.findFirst({
    select: {
      id: true,
      statut: true,
      montantCotise: true,
      montantPenalite: true,
      montantRembourse: true,
      pourcentagePenalite: true,
      statutRemboursement: true,
    },
  });

  console.log('📊 Champs du membre :');
  console.log(JSON.stringify(membre, null, 2));

  // 2. Tester le calcul
  console.log('\n🧮 Test calcul pénalité :');
  const calcul = penaliteService.calculer(50000, 'VOLONTAIRE', 2);
  console.log(JSON.stringify(calcul, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());