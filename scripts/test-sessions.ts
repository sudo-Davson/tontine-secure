import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function main() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  if (sessions.length === 0) {
    console.log('📭 Aucune session');
    return;
  }

  console.log(`📊 ${sessions.length} session(s):\n`);
  sessions.forEach((s, i) => {
    console.log(`--- Session ${i + 1} ---`);
    console.log(`👤 ${s.user.email} (${s.user.firstName} ${s.user.lastName})`);
    console.log(`✅ Active : ${s.isActive}`);
    console.log(`📅 Créée : ${s.createdAt.toLocaleString('fr-FR')}`);
    console.log(`🚫 Révoquée : ${s.revokedAt ? s.revokedAt.toLocaleString('fr-FR') : 'Non'}`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());