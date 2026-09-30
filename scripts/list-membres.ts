import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  const membres = await prisma.member.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      tontine: { select: { nom: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📊 ${membres.length} membre(s) au total:\n`);

  membres.forEach((m) => {
    console.log(`👤 ${m.user.firstName} ${m.user.lastName}`);
    console.log(`   📧 ${m.user.email}`);
    console.log(`   🎯 Tontine: ${m.tontine.nom}`);
    console.log(`   🏷️  Rôle: ${m.role}`);
    console.log(`   📌 Statut: ${m.statut}`);
    if (m.retireLe) {
      console.log(`   🚫 Retiré le: ${m.retireLe.toLocaleString('fr-FR')}`);
      console.log(`   📝 Raison: ${m.raisonRetrait || 'N/A'}`);
      console.log(`   💰 Cotisé: ${m.montantCotise.toLocaleString()} FCFA`);
      console.log(`   ⚠️  Pénalité (${m.pourcentagePenalite}%): ${m.montantPenalite.toLocaleString()} FCFA`);
      console.log(`   ✅ À rembourser: ${m.montantRembourse.toLocaleString()} FCFA`);
      console.log(`   💳 Statut remboursement: ${m.statutRemboursement}`);
    }
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());