// vercel-build.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure the dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Ensure the dist/public directory exists
if (!fs.existsSync('dist/public')) {
  fs.mkdirSync('dist/public', { recursive: true });
}

// Run the build command
console.log('Running build command...');
try {
  // Build the client
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Client build completed successfully!');

  // Copy the client/index.html to dist/public if it doesn't exist
  if (!fs.existsSync('dist/public/index.html') && fs.existsSync('client/index.html')) {
    fs.copyFileSync('client/index.html', 'dist/public/index.html');
    console.log('Copied index.html to dist/public');
  }

  // List the files in dist/public for debugging
  if (fs.existsSync('dist/public')) {
    console.log('Files in dist/public:');
    const files = fs.readdirSync('dist/public');
    console.log(files);

    // Check for assets directory
    if (fs.existsSync('dist/public/assets')) {
      console.log('Files in dist/public/assets:');
      const assetFiles = fs.readdirSync('dist/public/assets');
      console.log(assetFiles);
    }
  }

} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Verify the build output
if (!fs.existsSync('dist/public/index.html')) {
  console.error('Error: dist/public/index.html not found after build');
  process.exit(1);
}

console.log('Build verification completed successfully!');
