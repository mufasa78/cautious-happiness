/**
 * This script helps prepare the project for deployment
 * Run with: node prepare-deploy.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for the Railway backend URL
rl.question('Enter your Railway backend URL (e.g., https://portfoliohub-production.up.railway.app): ', (railwayUrl) => {
  // Ask for custom domain if available
  rl.question('Enter your custom domain (leave empty if none): ', (customDomain) => {
    console.log('\nUpdating configuration files...');
    
    // Update the frontend production environment file
    const envProdPath = path.join(__dirname, 'client', '.env.production');
    let envProdContent = `# API URL for production
VITE_API_URL=${railwayUrl}`;
    
    fs.writeFileSync(envProdPath, envProdContent);
    console.log(`✅ Updated ${envProdPath}`);
    
    // Update the CORS configuration in server/index.ts if custom domain is provided
    if (customDomain && customDomain.trim() !== '') {
      const serverIndexPath = path.join(__dirname, 'server', 'index.ts');
      let serverIndexContent = fs.readFileSync(serverIndexPath, 'utf8');
      
      // Find the allowedOrigins array
      const originsRegex = /const allowedOrigins = \[([\s\S]*?)\];/;
      const originsMatch = serverIndexContent.match(originsRegex);
      
      if (originsMatch) {
        // Check if the custom domain is already in the array
        if (!originsMatch[1].includes(customDomain)) {
          // Add the custom domain to the array
          const newOriginsContent = originsMatch[1].trim() + `,\n  '${customDomain}'`;
          serverIndexContent = serverIndexContent.replace(originsRegex, `const allowedOrigins = [${newOriginsContent}];`);
          
          fs.writeFileSync(serverIndexPath, serverIndexContent);
          console.log(`✅ Added ${customDomain} to CORS allowed origins in ${serverIndexPath}`);
        } else {
          console.log(`ℹ️ ${customDomain} is already in CORS allowed origins`);
        }
      } else {
        console.log(`⚠️ Could not find allowedOrigins array in ${serverIndexPath}`);
      }
    }
    
    console.log('\n🚀 Deployment preparation complete!');
    console.log('\nNext steps:');
    console.log('1. Push your changes to GitHub');
    console.log('2. Deploy the backend to Railway (see DEPLOYMENT_GUIDE.md)');
    console.log('3. Deploy the frontend to Vercel (see DEPLOYMENT_GUIDE.md)');
    
    rl.close();
  });
});
