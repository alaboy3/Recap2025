# Recap 2025 - Apple UI Desktop

An interactive desktop experience built with React and TypeScript, featuring a macOS-inspired interface with folders, images, and interactive elements.

## Features

- 🖼️ Interactive desktop with draggable folders and images
- 📁 Folder navigation with full-page transitions
- 🖼️ HEIC image support with automatic conversion
- 🎵 Music player with album previews
- 📝 Notes app with restaurant listings
- 📸 Photo Booth window
- ✈️ AirDrop notifications
- 🎨 Beautiful Apple-inspired UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Automatic Concerts Folder Watcher

The project includes an automatic file watcher that monitors the `public/images/Concerts` folder for new files. When new images or videos are added:

- **HEIC files** are automatically converted to JPG format
- **All files** are automatically added to the image stack in `desktopData.json`
- The watcher runs continuously and updates the configuration in real-time

To start the watcher:

```bash
npm run watch-concerts
```

The watcher will:
- Convert any HEIC files to JPG automatically
- Update the `badbo_desktop` image stack with all files from the Concerts folder
- Monitor for new files and update the configuration automatically

**Note:** The watcher must be running while you're adding files. Press `Ctrl+C` to stop it.

## GitHub Pages Deployment

This project is configured for GitHub Pages deployment.

### Setup Instructions

1. Create a new repository on GitHub (e.g., `Recap-2025`)

2. Update the `base` path in `vite.config.ts` to match your repository name:
   ```typescript
   base: '/your-repo-name/',
   ```

3. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

4. Enable GitHub Pages:
   - Go to your repository Settings
   - Navigate to Pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy on every push to `main`

5. Your site will be available at:
   `https://yourusername.github.io/your-repo-name/`

## Project Structure

```
├── public/
│   └── images/          # Image assets
├── src/
│   ├── components/      # React components
│   ├── context/         # React Context providers
│   ├── data/           # Data files
│   ├── hooks/          # Custom React hooks
│   └── styles/         # Global styles
└── dist/               # Build output (generated)
```

## Technologies

- React 18
- TypeScript
- Vite
- HEIC2Any (for HEIC image conversion)

## License

Private project
