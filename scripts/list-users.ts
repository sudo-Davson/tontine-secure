import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      kycLevel: true,
      reputation: true,
    },
  });

  if (users.length === 0) {
    console.log('📭 Aucun utilisateur');
    return;
  }

  console.log(`📊 ${users.length} utilisateur(s):\n`);
  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.firstName} ${u.lastName}`);
    console.log(`   📧 ${u.email}`);
    console.log(`   🆔 ${u.id}`);
    console.log(`   ✅ KYC : ${u.kycLevel}`);
    console.log(`   ⭐ Réputation : ${u.reputation}%`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());