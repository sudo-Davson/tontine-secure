import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 10
): Promise<T> {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.message?.includes('reach database server') && i < maxAttempts) {
        console.log(`⏳ Tentative ${i}/${maxAttempts} - Neon en veille, retry dans 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Impossible de se connecter après plusieurs tentatives');
}

async function main() {
  console.log('🚀 Script avec retry automatique\n');

  // Réveiller Neon
  await retry(async () => {
    await prisma.$queryRaw`SELECT 1`;
  });
  console.log('✅ Neon réveillé\n');

  // ============================================
  // ÉTAPE 1 : Corriger l'admin
  // ============================================
  console.log('📋 ÉTAPE 1 : Correction de l\'admin\n');

  const membres = await prisma.member.findMany({
    include: {
      user: { select: { firstName: true, lastName: true } },
      tontine: { select: { nom: true, createurId: true } },
    },
  });

  let adminFixed = 0;
  for (const membre of membres) {
    if (membre.userId === membre.tontine.createurId && membre.role !== 'ADMIN') {
      await prisma.member.update({
        where: { id: membre.id },
        data: { role: 'ADMIN' },
      });
      console.log(`   ✅ ${membre.user.firstName} → ADMIN (${membre.tontine.nom})`);
      adminFixed++;
    }
  }

  if (adminFixed === 0) {
    console.log('   ℹ️  Aucun admin à corriger');
  }
  console.log('');

  // ============================================
  // ÉTAPE 2 : Ajouter Marie
  // ============================================
  console.log('📋 ÉTAPE 2 : Ajout de Marie\n');

  const tontine = await prisma.tontine.findFirst();
  if (!tontine) {
    console.log('   ❌ Aucune tontine');
    await prisma.$disconnect();
    return;
  }

  console.log(`   🎯 Tontine : ${tontine.nom}`);

  const existingUserIds = (
    await prisma.member.findMany({
      where: { tontineId: tontine.id },
      select: { userId: true },
    })
  ).map((m) => m.userId);

  const user = await prisma.user.findFirst({
    where: {
      id: { notIn: existingUserIds },
      kycLevel: { gte: 2 },
    },
  });

  if (!user) {
    console.log('   ❌ Aucun utilisateur disponible');
  } else {
    const membre = await prisma.member.create({
      data: {
        tontineId: tontine.id,
        userId: user.id,
        role: 'MEMBRE',
        statut: 'ACTIF',
      },
    });

    console.log(`   ✅ ${user.firstName} ${user.lastName} ajouté (${user.email})`);
    console.log(`   🆔 Membre ID : ${membre.id}`);
    console.log(`   🆔 User ID : ${user.id}`);

    // ============================================
    // ÉTAPE 3 : Créer une cotisation
    // ============================================
    console.log('\n📋 ÉTAPE 3 : Création de la cotisation\n');

    const cotisation = await prisma.cotisation.create({
      data: {
        tontineId: tontine.id,
        userId: user.id,
        montant: tontine.montant,
        statut: 'PAYEE',
        dateEcheance: new Date(),
        datePaiement: new Date(),
        methodePaiement: 'TMONEY',
      },
    });

    console.log(`   ✅ Cotisation : ${cotisation.montant.toLocaleString()} FCFA`);

    // Activer la tontine
    await prisma.tontine.update({
      where: { id: tontine.id },
      data: { statut: 'ACTIVE' },
    });
    console.log(`   ✅ Tontine ACTIVE`);
  }

  console.log('\n🎉 Terminé !');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Erreur :', e.message);
  process.exit(1);
});