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
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Verify the build output
if (!fs.existsSync('dist/index.js')) {
  console.error('Error: dist/index.js not found after build');
  process.exit(1);
}

if (!fs.existsSync('dist/public/index.html')) {
  console.error('Error: dist/public/index.html not found after build');
  process.exit(1);
}

console.log('Build verification completed successfully!');
