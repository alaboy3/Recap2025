// Script to sync current localStorage positions to desktopData.json as defaults
// 
// INSTRUCTIONS:
// 1. Open your browser with the app running
// 2. Open browser console (F12)
// 3. Run this command:
//    copy(JSON.stringify(JSON.parse(localStorage.getItem('desktopData')), null, 2))
// 4. Paste the output into a file called 'localStorage-data.json' in the project root
// 5. Run this script: node sync-positions-to-defaults.js

const fs = require('fs');
const path = require('path');

const desktopDataPath = path.join(__dirname, 'src/data/desktopData.json');
const localStorageDataPath = path.join(__dirname, 'localStorage-data.json');

function syncPositions() {
  try {
    // Read the default desktop data structure
    const desktopData = JSON.parse(fs.readFileSync(desktopDataPath, 'utf8'));
    
    // Check if localStorage data file exists
    if (!fs.existsSync(localStorageDataPath)) {
      console.log('⚠️  localStorage-data.json not found!');
      console.log('\n📋 To export your current positions:');
      console.log('1. Open your browser console (F12)');
      console.log('2. Run this command:');
      console.log('   copy(JSON.stringify(JSON.parse(localStorage.getItem("desktopData")), null, 2))');
      console.log('3. Paste the output into a file called "localStorage-data.json" in the project root');
      console.log('4. Run this script again\n');
      return;
    }
    
    // Read the localStorage data
    const localStorageData = JSON.parse(fs.readFileSync(localStorageDataPath, 'utf8'));
    
    console.log('🔄 Syncing positions from localStorage to defaults...\n');
    
    // Update folder positions
    if (localStorageData.folders) {
      localStorageData.folders.forEach(savedFolder => {
        const defaultFolder = desktopData.folders.find(f => f.id === savedFolder.id);
        if (defaultFolder && savedFolder.position) {
          defaultFolder.position = savedFolder.position;
          console.log(`✓ Updated folder: ${savedFolder.id}`);
        }
      });
    }
    
    // Update image positions
    if (localStorageData.images) {
      localStorageData.images.forEach(savedImage => {
        const defaultImage = desktopData.images.find(img => img.id === savedImage.id);
        if (defaultImage && savedImage.position) {
          defaultImage.position = savedImage.position;
          console.log(`✓ Updated image: ${savedImage.id}`);
        }
      });
    }
    
    // Update yearly report bubble position
    if (localStorageData.yearlyReportBubblePosition) {
      desktopData.yearlyReportBubblePosition = localStorageData.yearlyReportBubblePosition;
      console.log('✓ Updated yearlyReportBubblePosition');
    }
    
    // Update folder contents positions
    if (localStorageData.folderContents && desktopData.folderContents) {
      Object.keys(localStorageData.folderContents).forEach(folderId => {
        const savedContent = localStorageData.folderContents[folderId];
        const defaultContent = desktopData.folderContents[folderId];
        
        if (defaultContent) {
          // Update folders in folder contents
          if (savedContent.folders && defaultContent.folders) {
            savedContent.folders.forEach(savedFolder => {
              const defaultFolder = defaultContent.folders.find(f => f.id === savedFolder.id);
              if (defaultFolder && savedFolder.position) {
                defaultFolder.position = savedFolder.position;
                console.log(`✓ Updated folder content folder: ${folderId}/${savedFolder.id}`);
              }
            });
          }
          
          // Update images in folder contents
          if (savedContent.images && defaultContent.images) {
            savedContent.images.forEach(savedImage => {
              const defaultImage = defaultContent.images.find(img => img.id === savedImage.id);
              if (defaultImage && savedImage.position) {
                defaultImage.position = savedImage.position;
                console.log(`✓ Updated folder content image: ${folderId}/${savedImage.id}`);
              }
            });
          }
          
          // Update notes, music, calendar, movies
          ['notes', 'music', 'calendar', 'movies'].forEach(type => {
            if (savedContent[type] && defaultContent[type]) {
              savedContent[type].forEach(savedItem => {
                const defaultItem = defaultContent[type].find(item => item.id === savedItem.id);
                if (defaultItem && savedItem.position) {
                  defaultItem.position = savedItem.position;
                  console.log(`✓ Updated folder content ${type}: ${folderId}/${savedItem.id}`);
                }
              });
            }
          });
          
          // Update special positions
          if (savedContent.photoBoothPosition) {
            defaultContent.photoBoothPosition = savedContent.photoBoothPosition;
            console.log(`✓ Updated photoBoothPosition for ${folderId}`);
          }
          if (savedContent.airdropPosition) {
            defaultContent.airdropPosition = savedContent.airdropPosition;
            console.log(`✓ Updated airdropPosition for ${folderId}`);
          }
          if (savedContent.tripBubblePosition) {
            defaultContent.tripBubblePosition = savedContent.tripBubblePosition;
            console.log(`✓ Updated tripBubblePosition for ${folderId}`);
          }
          if (savedContent.nycBubblePosition) {
            defaultContent.nycBubblePosition = savedContent.nycBubblePosition;
            console.log(`✓ Updated nycBubblePosition for ${folderId}`);
          }
        }
      });
    }
    
    // Write updated data back to file
    fs.writeFileSync(desktopDataPath, JSON.stringify(desktopData, null, 2));
    
    console.log('\n✅ Successfully synced all positions to desktopData.json!');
    console.log('✅ Your current icon positions are now the defaults.');
    console.log('✅ You can delete localStorage-data.json if you want.\n');
    
  } catch (error) {
    console.error('❌ Error syncing positions:', error.message);
    if (error.code === 'ENOENT') {
      console.error('   Make sure desktopData.json exists at:', desktopDataPath);
    }
  }
}

syncPositions();

