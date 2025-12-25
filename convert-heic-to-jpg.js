import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imagesDir = join(__dirname, 'public', 'images');

async function findHeicFiles(dir, fileList = []) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory()) {
      await findHeicFiles(filePath, fileList);
    } else if (file.toLowerCase().endsWith('.heic')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

async function convertHeicToJpg(heicPath) {
  try {
    const jpgPath = heicPath.replace(/\.heic$/i, '.jpg');
    
    // Check if JPG already exists
    try {
      await stat(jpgPath);
      console.log(`⏭️  Skipping ${heicPath} - JPG already exists`);
      return { success: true, skipped: true };
    } catch {
      // JPG doesn't exist, proceed with conversion
    }
    
    console.log(`🔄 Converting ${heicPath}...`);
    
    // Use sips (macOS built-in tool) to convert HEIC to JPG
    // -s format jpeg: convert to JPEG
    // -s formatOptions 90: set quality to 90%
    await execAsync(`sips -s format jpeg -s formatOptions 90 "${heicPath}" --out "${jpgPath}"`);
    
    console.log(`✅ Converted ${heicPath} → ${jpgPath}`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`❌ Error converting ${heicPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Finding all HEIC files...\n');
  
  const heicFiles = await findHeicFiles(imagesDir);
  console.log(`Found ${heicFiles.length} HEIC files\n`);
  
  if (heicFiles.length === 0) {
    console.log('No HEIC files found. Exiting.');
    return;
  }
  
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const heicFile of heicFiles) {
    const result = await convertHeicToJpg(heicFile);
    if (result.success) {
      if (result.skipped) {
        skippedCount++;
      } else {
        successCount++;
      }
    } else {
      errorCount++;
    }
  }
  
  console.log('\n📊 Conversion Summary:');
  console.log(`✅ Successfully converted: ${successCount}`);
  console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`\n💡 Note: Original HEIC files are preserved. You can delete them manually if desired.`);
}

main().catch(console.error);
