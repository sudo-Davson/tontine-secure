import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../lib/prisma';

async function ping() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Neon réveillé`);
  } catch (error) {
    console.log(`❌ [${new Date().toLocaleTimeString('fr-FR')}] Erreur`);
  }
}

ping();
setInterval(ping, 4 * 60 * 1000);

console.log('🔄 Keep-alive démarré. Ctrl+C pour arrêter.');