import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_WIDTH = 1920; // Max width for images
const QUALITY = 85; // JPEG quality

async function getAllImageFiles(dir, fileList = []) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await getAllImageFiles(filePath, fileList);
    } else if (/\.(jpg|jpeg|png|heic|heif)$/i.test(file)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function optimizeImage(imagePath) {
  try {
    const ext = path.extname(imagePath).toLowerCase();
    const isHEIC = ext === '.heic' || ext === '.heif';

    // For HEIC files, convert to JPG
    if (isHEIC) {
      const outputPath = imagePath.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
      console.log(`Converting ${path.relative(PUBLIC_DIR, imagePath)} to JPG...`);

      await sharp(imagePath)
        .rotate() // Automatically apply EXIF orientation
        .resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
        .jpeg({ quality: QUALITY })
        .toFile(outputPath);

      console.log(`  ✓ Created ${path.relative(PUBLIC_DIR, outputPath)}`);
      return;
    }

    // For other images, check size and optimize if needed
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);
    const sizeMB = stats.size / (1024 * 1024);

    // Only optimize if image is larger than 1MB or wider than MAX_WIDTH
    if (sizeMB > 1 || metadata.width > MAX_WIDTH) {
      console.log(`Optimizing ${path.relative(PUBLIC_DIR, imagePath)} (${sizeMB.toFixed(2)}MB, ${metadata.width}x${metadata.height})...`);

      const tempPath = imagePath + '.tmp';
      await sharp(imagePath)
        .rotate() // Automatically apply EXIF orientation
        .resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
        .jpeg({ quality: QUALITY })
        .toFile(tempPath);

      await fs.rename(tempPath, imagePath);

      const newStats = await fs.stat(imagePath);
      const newSizeMB = newStats.size / (1024 * 1024);
      console.log(`  ✓ Reduced from ${sizeMB.toFixed(2)}MB to ${newSizeMB.toFixed(2)}MB`);
    }
  } catch (error) {
    console.error(`Error optimizing ${imagePath}:`, error.message);
  }
}

async function main() {
  console.log('Starting image optimization...\n');

  const imageFiles = await getAllImageFiles(PUBLIC_DIR);
  console.log(`Found ${imageFiles.length} images to process\n`);

  for (const imagePath of imageFiles) {
    await optimizeImage(imagePath);
  }

  console.log('\n✓ Image optimization complete!');
}

main().catch(console.error);
