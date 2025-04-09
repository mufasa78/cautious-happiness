/**
 * This script prepares files for manual deployment to Railway
 */

const fs = require('fs');
const path = require('path');

// Create a deployment directory
const deployDir = path.join(__dirname, 'railway-deploy');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Copy the necessary files
const filesToCopy = [
  { source: 'railway-server.js', dest: 'server.js' },
  { source: 'railway-package.json', dest: 'package.json' },
  { source: '.env.railway', dest: '.env' },
  { source: 'server/storage.js', dest: 'server/storage.js' },
  // Add any other files needed for the deployment
];

// Make sure the server directory exists
const serverDir = path.join(deployDir, 'server');
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}

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

console.log('\n🚀 Deployment files prepared in the railway-deploy directory');
console.log('\nNext steps:');
console.log('1. Navigate to the railway-deploy directory: cd railway-deploy');
console.log('2. Initialize a new Git repository: git init');
console.log('3. Add all files: git add .');
console.log('4. Commit the files: git commit -m "Initial Railway deployment"');
console.log('5. Create a new project on Railway and follow their instructions to push your code');
