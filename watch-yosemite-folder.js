import { watch } from 'fs';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const yosemiteDir = join(__dirname, 'public', 'images', 'Yosemite');
const desktopDataPath = join(__dirname, 'src', 'data', 'desktopData.json');

// Helper function to check if file is HEIC
function isHEIC(filename) {
  const ext = extname(filename).toLowerCase();
  return ext === '.heic' || ext === '.heif';
}

// Helper function to check if file is video
function isVideo(filename) {
  const ext = extname(filename).toLowerCase();
  return ext === '.mov' || ext === '.mp4' || ext === '.webm';
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

// Get all files from Yosemite folder
async function getYosemiteFiles() {
  try {
    const files = await readdir(yosemiteDir);
    const filePaths = [];
    const processedBaseNames = new Set(); // Track base names to avoid HEIC/JPG duplicates
    
    for (const file of files) {
      const filePath = join(yosemiteDir, file);
      
      try {
        const fileStat = await stat(filePath);
        
        if (fileStat.isFile()) {
          const baseName = basename(file, extname(file));
          const ext = extname(file).toLowerCase();
          
          // Convert HEIC to JPG if needed
          if (isHEIC(file)) {
            const jpgPath = await convertHeicToJpg(filePath);
            if (jpgPath) {
              const jpgBasename = basename(jpgPath);
              // Use the JPG version in the stack
              filePaths.push(`/images/Yosemite/${jpgBasename}`);
              processedBaseNames.add(baseName.toLowerCase());
            } else {
              // If conversion failed, still include the HEIC
              filePaths.push(`/images/Yosemite/${file}`);
              processedBaseNames.add(baseName.toLowerCase());
            }
          } else {
            // For non-HEIC files, check if we already processed a HEIC version
            if (!processedBaseNames.has(baseName.toLowerCase())) {
              filePaths.push(`/images/Yosemite/${file}`);
              processedBaseNames.add(baseName.toLowerCase());
            }
            // If we already processed a HEIC version, skip this file (JPG will be in the list)
          }
        }
      } catch (error) {
        // File might not exist anymore, skip it
        if (error.code !== 'ENOENT') {
          console.warn(`Warning: Could not process ${file}:`, error.message);
        }
      }
    }
    
    return filePaths.sort(); // Sort alphabetically for consistency
  } catch (error) {
    console.error('Error reading Yosemite folder:', error);
    return [];
  }
}

// Update desktopData.json with new files
async function updateDesktopData() {
  try {
    const yosemiteFiles = await getYosemiteFiles();
    
    // Read current desktopData.json
    const dataContent = await readFile(desktopDataPath, 'utf-8');
    const desktopData = JSON.parse(dataContent);
    
    // Find the yosemite_desktop image
    const yosemiteImage = desktopData.images.find(img => img.id === 'yosemite_desktop');
    
    if (yosemiteImage) {
      // Update the imageStack with all files from Yosemite folder
      yosemiteImage.imageStack = yosemiteFiles;
      
      // Write back to file
      await writeFile(desktopDataPath, JSON.stringify(desktopData, null, 2) + '\n', 'utf-8');
      
      console.log(`✅ Updated imageStack with ${yosemiteFiles.length} files from Yosemite folder`);
      console.log(`📁 Files: ${yosemiteFiles.map(f => basename(f)).join(', ')}`);
    } else {
      console.warn('⚠️  yosemite_desktop image not found in desktopData.json');
    }
  } catch (error) {
    console.error('Error updating desktopData.json:', error);
  }
}

// Watch for file changes
function startWatching() {
  console.log(`👀 Watching ${yosemiteDir} for changes...\n`);
  
  // Initial update
  updateDesktopData();
  
  // Watch for file changes
  watch(yosemiteDir, { recursive: false }, async (eventType, filename) => {
    if (filename) {
      console.log(`\n📝 Detected change: ${filename} (${eventType})`);
      
      // Small delay to ensure file is fully written
      setTimeout(async () => {
        const filePath = join(yosemiteDir, filename);
        
        try {
          const fileStat = await stat(filePath);
          
          if (fileStat.isFile()) {
            // If it's a new HEIC file, convert it
            if (isHEIC(filename)) {
              await convertHeicToJpg(filePath);
            }
            
            // Update desktopData.json
            await updateDesktopData();
          }
        } catch (error) {
          // File might have been deleted, still update
          if (error.code !== 'ENOENT') {
            console.error('Error processing file:', error);
          }
          await updateDesktopData();
        }
      }, 500);
    }
  });
  
  console.log('✅ File watcher started. Press Ctrl+C to stop.\n');
}

// Start watching
startWatching();

