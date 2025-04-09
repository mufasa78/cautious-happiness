// vercel-build.js - Frontend only build script
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting frontend build process...');

// Ensure the dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
  console.log('Created dist directory');
}

// Run the frontend build command
console.log('Running frontend build command...');
try {
  execSync('npm run build:frontend', { stdio: 'inherit' });
  console.log('Frontend build completed successfully!');

  // List the files in dist for debugging
  if (fs.existsSync('dist')) {
    console.log('Files in dist:');
    const files = fs.readdirSync('dist');
    console.log(files);

    // Check for assets directory
    if (fs.existsSync('dist/assets')) {
      console.log('Files in dist/assets:');
      const assetFiles = fs.readdirSync('dist/assets');
      console.log(assetFiles);
    }
  }

  // Verify the build output
  if (!fs.existsSync('dist/index.html')) {
    console.error('Error: dist/index.html not found after build');
    process.exit(1);
  }

  // Copy the root index.html to dist if it doesn't exist
  if (fs.existsSync('index.html')) {
    fs.copyFileSync('index.html', 'dist/404.html');
    console.log('Created 404.html fallback page');
  }

  console.log('Frontend build verification completed successfully!');
} catch (error) {
  console.error('Frontend build failed:', error);
  process.exit(1);
}
