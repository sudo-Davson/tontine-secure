import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  const tontine = await prisma.tontine.findFirst();
  if (!tontine) {
    console.log('❌ Aucune tontine');
    return;
  }

  console.log('🎯 Tontine :', tontine.nom);

  // Récupérer les IDs déjà membres
  const existingUserIds = (
    await prisma.member.findMany({
      where: { tontineId: tontine.id },
      select: { userId: true },
    })
  ).map((m) => m.userId);

  // Chercher un utilisateur KYC 2 qui n'est pas membre
  const user = await prisma.user.findFirst({
    where: {
      id: { notIn: existingUserIds },
      kycLevel: { gte: 2 },
    },
  });

  if (!user) {
    console.log('❌ Aucun utilisateur disponible');
    return;
  }

  console.log('👤 Utilisateur :', user.firstName, user.lastName, `(${user.email})`);

  const membre = await prisma.member.create({
    data: {
      tontineId: tontine.id,
      userId: user.id,
      role: 'MEMBRE',
      statut: 'ACTIF',
    },
  });

  console.log('✅ Membre ajouté :', membre.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());