# GitHub Pages Deployment Guide

## Quick Setup Steps

### 1. Fix Do Not Disturb
✅ Already fixed - Do Not Disturb will now show for 3 seconds on each page load.

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `Recap-2025`)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)

### 3. Update Repository Name in Config

Before pushing, update `vite.config.ts` line 7 to match your repository name:
```typescript
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```

### 4. Push to GitHub

Run these commands in your terminal:

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Apple UI Desktop with GitHub Pages setup"

# Rename branch to main (if needed)
git branch -M main

# Add your GitHub repository as remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 5. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **"GitHub Actions"**
4. The deployment workflow will run automatically
5. Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### 6. Verify Deployment

- The GitHub Actions workflow will build and deploy automatically
- Check the **Actions** tab in your repository to see deployment status
- It may take 1-2 minutes for the first deployment

## Troubleshooting

### If images don't load:
- Make sure all images are in the `public/images/` folder
- Check that file paths in `desktopData.json` match actual file names

### If the site shows a 404:
- Verify the `base` path in `vite.config.ts` matches your repository name exactly
- Make sure GitHub Pages is set to use "GitHub Actions" as the source

### If deployment fails:
- Check the Actions tab for error messages
- Ensure `package.json` has the correct build script
- Verify Node.js version compatibility

