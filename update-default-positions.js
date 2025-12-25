// Script to update desktopData.json with current positions from localStorage export
// Usage: 
// 1. Open browser console and run: exportDesktopPositions()
// 2. Copy the output JSON
// 3. Save it to a file called 'current-positions.json'
// 4. Run this script: node update-default-positions.js

const fs = require('fs');
const path = require('path');

const desktopDataPath = path.join(__dirname, 'src/data/desktopData.json');
const currentPositionsPath = path.join(__dirname, 'current-positions.json');

function updateDefaultPositions() {
  try {
    // Read the current desktop data
    const desktopData = JSON.parse(fs.readFileSync(desktopDataPath, 'utf8'));
    
    // Check if current positions file exists
    if (!fs.existsSync(currentPositionsPath)) {
      console.log('Error: current-positions.json not found!');
      console.log('Please:');
      console.log('1. Open your browser console');
      console.log('2. Run: exportDesktopPositions()');
      console.log('3. Copy the JSON output');
      console.log('4. Save it to current-positions.json in the project root');
      return;
    }
    
    // Read the current positions
    const currentPositions = JSON.parse(fs.readFileSync(currentPositionsPath, 'utf8'));
    
    // Update folder positions
    if (currentPositions.folders) {
      currentPositions.folders.forEach((pos: any) => {
        const folder = desktopData.folders.find((f: any) => f.id === pos.id);
        if (folder) {
          folder.position = pos.position;
        }
      });
    }
    
    // Update image positions
    if (currentPositions.images) {
      currentPositions.images.forEach((pos: any) => {
        const image = desktopData.images.find((img: any) => img.id === pos.id);
        if (image) {
          image.position = pos.position;
        }
      });
    }
    
    // Update yearly report bubble position
    if (currentPositions.yearlyReportBubblePosition) {
      desktopData.yearlyReportBubblePosition = currentPositions.yearlyReportBubblePosition;
    }
    
    // Update folder contents positions
    if (currentPositions.folderContents) {
      Object.keys(currentPositions.folderContents).forEach(folderId => {
        if (!desktopData.folderContents[folderId]) {
          desktopData.folderContents[folderId] = {};
        }
        
        const content = currentPositions.folderContents[folderId];
        const desktopContent = desktopData.folderContents[folderId];
        
        // Update folders in folder contents
        if (content.folders && desktopContent.folders) {
          content.folders.forEach((pos: any) => {
            const folder = desktopContent.folders.find((f: any) => f.id === pos.id);
            if (folder) {
              folder.position = pos.position;
            }
          });
        }
        
        // Update images in folder contents
        if (content.images && desktopContent.images) {
          content.images.forEach((pos: any) => {
            const image = desktopContent.images.find((img: any) => img.id === pos.id);
            if (image) {
              image.position = pos.position;
            }
          });
        }
        
        // Update notes, music, calendar, movies
        ['notes', 'music', 'calendar', 'movies'].forEach(type => {
          if (content[type] && desktopContent[type]) {
            content[type].forEach((pos: any) => {
              const item = desktopContent[type].find((item: any) => item.id === pos.id);
              if (item) {
                item.position = pos.position;
              }
            });
          }
        });
        
        // Update special positions
        if (content.photoBoothPosition) desktopContent.photoBoothPosition = content.photoBoothPosition;
        if (content.airdropPosition) desktopContent.airdropPosition = content.airdropPosition;
        if (content.tripBubblePosition) desktopContent.tripBubblePosition = content.tripBubblePosition;
        if (content.nycBubblePosition) desktopContent.nycBubblePosition = content.nycBubblePosition;
      });
    }
    
    // Write updated data back to file
    fs.writeFileSync(desktopDataPath, JSON.stringify(desktopData, null, 2));
    console.log('✓ Successfully updated desktopData.json with current positions!');
    console.log('✓ You can now delete current-positions.json if you want');
    
  } catch (error) {
    console.error('Error updating positions:', error);
  }
}

updateDefaultPositions();

