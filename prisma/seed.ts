// prisma/seed.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Nettoyer la base
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.cotisation.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.member.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.tontine.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Base nettoyée');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'jean.kouassi@email.com',
      phoneNumber: '+22890123456',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Kouassi',
      kycLevel: 2,
      kycStatus: 'VERIFIED',
      isVerified: true,
      reputation: 90,
      abonnement: 'PREMIUM',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'marie.adjoua@email.com',
      phoneNumber: '+22891234567',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Adjoua',
      kycLevel: 2,
      kycStatus: 'VERIFIED',
      isVerified: true,
      reputation: 85,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'pierre.mensah@email.com',
      phoneNumber: '+22892345678',
      password: hashedPassword,
      firstName: 'Pierre',
      lastName: 'Mensah',
      kycLevel: 2,
      kycStatus: 'VERIFIED',
      isVerified: true,
      reputation: 75,
    },
  });

  console.log('👥 Utilisateurs créés :', 3);

  const tontine = await prisma.tontine.create({
    data: {
      nom: 'Tontine des Amis',
      description: 'Tontine mensuelle entre amis pour épargner ensemble',
      type: 'EPARGNE',
      montant: 50000,
      frequence: 'MENSUELLE',
      frequenceConfig: JSON.stringify({ type: 'MENSUELLE', jourDuMois: 15 }),
      nombreMembres: 10,
      nombreTours: 10,
      modeRotation: 'ALEATOIRE',
      statut: 'ACTIVE',
      tourActuel: 1,
      montantCollecte: 150000,
      montantTotal: 500000,
      methodePaiement: 'TMONEY',
      numeroCollecte: '+22890123456',
      createurId: user1.id,
    },
  });

  console.log('🎯 Tontine créée :', tontine.nom);

  await prisma.member.createMany({
    data: [
      { tontineId: tontine.id, userId: user1.id, role: 'ADMIN', statut: 'ACTIF' },
      { tontineId: tontine.id, userId: user2.id, role: 'MEMBRE', statut: 'ACTIF' },
      { tontineId: tontine.id, userId: user3.id, role: 'MEMBRE', statut: 'ACTIF' },
    ],
  });

  console.log('👥 Membres ajoutés :', 3);
  console.log('✅ Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });