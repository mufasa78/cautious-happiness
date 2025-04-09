/**
 * This script prepares a minimal deployment for Railway
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a deployment directory
const deployDir = path.join(__dirname, 'minimal-deploy');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Copy the necessary files
const filesToCopy = [
  { source: 'minimal-server.js', dest: 'server.js' },
  { source: 'minimal-package.json', dest: 'package.json' }
];

// Copy each file
filesToCopy.forEach(file => {
  try {
    const sourceContent = fs.readFileSync(path.join(__dirname, file.source), 'utf8');
    fs.writeFileSync(path.join(deployDir, file.dest), sourceContent);
    console.log(`✅ Copied ${file.source} to ${file.dest}`);
  } catch (error) {
    console.error(`❌ Error copying ${file.source}: ${error.message}`);
  }
});

// Create a simple README
const readmeContent = `# Minimal API for Railway

This is a minimal API server for testing Railway deployment.

## Endpoints

- GET / - Root endpoint
- POST /api/login - Mock login endpoint
- GET /api/health - Health check endpoint

## Deployment

1. Deploy to Railway
2. No environment variables required
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);
console.log('✅ Created README.md');

console.log('\n🚀 Minimal deployment files prepared in the minimal-deploy directory');
console.log('\nNext steps:');
console.log('1. Navigate to the minimal-deploy directory: cd minimal-deploy');
console.log('2. Initialize a new Git repository: git init');
console.log('3. Add all files: git add .');
console.log('4. Commit the files: git commit -m "Minimal Railway deployment"');
console.log('5. Create a new repository on GitHub for this minimal deployment');
console.log('6. Push to GitHub: git remote add origin <your-repo-url> && git push -u origin main');
console.log('7. Deploy to Railway from this new GitHub repository');
