import { watch } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get folder name from command line argument
const folderName = process.argv[2];

if (!folderName) {
  console.error('❌ Please provide a folder name as an argument');
  console.log('Usage: node watch-folder-heic.js <folder-name>');
  console.log('Example: node watch-folder-heic.js Agosto');
  process.exit(1);
}

const folderDir = join(__dirname, 'public', 'images', folderName);

// Helper function to check if file is HEIC
function isHEIC(filename) {
  const ext = extname(filename).toLowerCase();
  return ext === '.heic' || ext === '.heif';
}

// Convert HEIC to JPG
async function convertHeicToJpg(heicPath) {
  try {
    const jpgPath = heicPath.replace(/\.(heic|heif)$/i, '.jpg');
    
    // Check if JPG already exists
    try {
      await stat(jpgPath);
      console.log(`⏭️  Skipping ${basename(heicPath)} - JPG already exists`);
      return jpgPath;
    } catch {
      // JPG doesn't exist, proceed with conversion
    }
    
    console.log(`🔄 Converting ${basename(heicPath)} to JPG...`);
    
    // Use sips (macOS built-in tool) to convert HEIC to JPG
    await execAsync(`sips -s format jpeg -s formatOptions 90 "${heicPath}" --out "${jpgPath}"`);
    
    console.log(`✅ Converted ${basename(heicPath)} → ${basename(jpgPath)}`);
    return jpgPath;
  } catch (error) {
    console.error(`❌ Error converting ${basename(heicPath)}:`, error.message);
    return null;
  }
}

// Convert all HEIC files in folder
async function convertAllHeicFiles() {
  try {
    const files = await readdir(folderDir);
    
    for (const file of files) {
      const filePath = join(folderDir, file);
      
      try {
        const fileStat = await stat(filePath);
        
        if (fileStat.isFile() && isHEIC(file)) {
          await convertHeicToJpg(filePath);
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`Warning: Could not process ${file}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading ${folderName} folder:`, error);
  }
}

// Watch for file changes
function startWatching() {
  console.log(`👀 Watching ${folderDir} for HEIC files...\n`);
  
  // Initial conversion
  convertAllHeicFiles();
  
  // Watch for file changes
  watch(folderDir, { recursive: false }, async (eventType, filename) => {
    if (filename) {
      console.log(`\n📝 Detected change: ${filename} (${eventType})`);
      
      // Small delay to ensure file is fully written
      setTimeout(async () => {
        const filePath = join(folderDir, filename);
        
        try {
          const fileStat = await stat(filePath);
          
          if (fileStat.isFile() && isHEIC(filename)) {
            await convertHeicToJpg(filePath);
          }
        } catch (error) {
          // File might have been deleted
          if (error.code !== 'ENOENT') {
            console.error('Error processing file:', error);
          }
        }
      }, 500);
    }
  });
  
  console.log('✅ File watcher started. Press Ctrl+C to stop.\n');
}

// Start watching
startWatching();

