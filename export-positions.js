// Script to export current desktop positions from localStorage
// Run this in the browser console when the app is open

function exportDesktopPositions() {
  try {
    const savedData = localStorage.getItem('desktopData');
    if (!savedData) {
      console.log('No saved data found in localStorage');
      return null;
    }
    
    const data = JSON.parse(savedData);
    
    // Extract just the positions we need
    const positions = {
      folders: data.folders?.map(f => ({
        id: f.id,
        position: f.position
      })) || [],
      images: data.images?.map(img => ({
        id: img.id,
        position: img.position
      })) || [],
      yearlyReportBubblePosition: data.yearlyReportBubblePosition,
      folderContents: {}
    };
    
    // Extract folder contents positions if they exist
    if (data.folderContents) {
      Object.keys(data.folderContents).forEach(folderId => {
        const content = data.folderContents[folderId];
        positions.folderContents[folderId] = {
          folders: content.folders?.map(f => ({
            id: f.id,
            position: f.position
          })) || [],
          images: content.images?.map(img => ({
            id: img.id,
            position: img.position
          })) || [],
          notes: content.notes?.map(n => ({
            id: n.id,
            position: n.position
          })) || [],
          music: content.music?.map(m => ({
            id: m.id,
            position: m.position
          })) || [],
          calendar: content.calendar?.map(c => ({
            id: c.id,
            position: c.position
          })) || [],
          movies: content.movies?.map(m => ({
            id: m.id,
            position: m.position
          })) || [],
          photoBoothPosition: content.photoBoothPosition,
          airdropPosition: content.airdropPosition,
          tripBubblePosition: content.tripBubblePosition,
          nycBubblePosition: content.nycBubblePosition
        };
      });
    }
    
    console.log('Current positions:');
    console.log(JSON.stringify(positions, null, 2));
    
    // Copy to clipboard if possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(positions, null, 2))
        .then(() => console.log('✓ Positions copied to clipboard!'))
        .catch(err => console.log('Could not copy to clipboard:', err));
    }
    
    return positions;
  } catch (error) {
    console.error('Error exporting positions:', error);
    return null;
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  exportDesktopPositions();
}

module.exports = { exportDesktopPositions };

