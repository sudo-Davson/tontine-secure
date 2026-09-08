// scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const sourceIcon = path.join(__dirname, '../public/icon-source.png');
  const outputDir = path.join(__dirname, '../public/icons');
  
  // Créer le dossier de sortie
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const size of sizes) {
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    
    console.log(`✅ Icône ${size}x${size} générée`);
  }
  
  // Générer l'icône maskable
  await sharp(sourceIcon)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon-maskable-512x512.png'));
  
  console.log('✅ Icône maskable générée');
  console.log('🎉 Toutes les icônes ont été générées !');
}

generateIcons().catch(console.error);