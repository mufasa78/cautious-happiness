# Deployment Guide: Vercel (Frontend) & Railway (Backend)

This guide will walk you through deploying your PortfolioHub application with:
- Frontend on Vercel
- Backend on Railway
- Custom domain configuration

## 1. Deploy Backend to Railway

### Prerequisites
- GitHub repository with your code
- Railway account (https://railway.app)

### Steps

1. **Push your code to GitHub**
   Make sure your latest code is pushed to your GitHub repository.

2. **Create a new project on Railway**
   - Go to Railway dashboard and click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Choose the main branch (or your preferred branch)

3. **Configure environment variables**
   In your Railway project, go to the "Variables" tab and add:
   
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   DATABASE_URL=your-database-url
   EMAIL_USER=your-email-user
   EMAIL_PASSWORD=your-email-password
   PORT=3000
   ```

   Note: Keep the JWT_SECRET value safe as you'll need it for future reference.

4. **Deploy the project**
   - Railway will automatically deploy your application
   - Wait for the deployment to complete
   - Once deployed, Railway will provide you with a URL (e.g., https://portfoliohub-production.up.railway.app)
   - Save this URL as you'll need it for the frontend configuration

## 2. Deploy Frontend to Vercel

### Prerequisites
- GitHub repository with your code
- Vercel account (https://vercel.com)

### Steps

1. **Push your code to GitHub**
   Make sure your latest code is pushed to your GitHub repository.

2. **Create a new project on Vercel**
   - Go to Vercel dashboard and click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Vite
     - Root Directory: `./` (or the directory containing your package.json)
     - Build Command: `npm run build:frontend`
     - Output Directory: `dist`

3. **Configure environment variables**
   In your Vercel project settings, go to the "Environment Variables" tab and add:
   
   ```
   VITE_API_URL=https://your-railway-app-url.up.railway.app
   ```
   
   Replace `your-railway-app-url` with the actual URL from Railway.

4. **Deploy the project**
   - Click "Deploy"
   - Wait for the deployment to complete
   - Vercel will provide you with a URL (e.g., https://mufasa-kappa.vercel.app)

## 3. Configure Custom Domain on Vercel

### Prerequisites
- Registered domain name
- Access to domain DNS settings

### Steps

1. **Add custom domain to Vercel project**
   - Go to your project on Vercel
   - Navigate to "Settings" > "Domains"
   - Enter your domain name and click "Add"

2. **Configure DNS settings**
   Vercel will provide you with DNS configuration instructions. Typically:
   
   - For apex domain (example.com):
     Add an A record pointing to Vercel's IP addresses
   
   - For www subdomain (www.example.com):
     Add a CNAME record pointing to cname.vercel-dns.com

3. **Update CORS configuration**
   After setting up your custom domain, you need to update the CORS configuration in your backend:
   
   - Go to your Railway project
   - Edit the `server/index.ts` file to add your custom domain to the `allowedOrigins` array
   - Commit and push the changes
   - Railway will automatically redeploy your backend

## 4. Testing the Deployment

1. **Test the frontend-backend connection**
   - Visit your Vercel URL (or custom domain)
   - Try to log in with your admin credentials
   - If login works, the connection to the backend is successful

2. **Troubleshooting**
   If you encounter issues:
   
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Ensure CORS is properly configured
   - Check Railway logs for backend errors

## 5. Maintaining Your Deployment

### Updating the application

1. **Make changes to your code locally**
2. **Push changes to GitHub**
3. **Both Railway and Vercel will automatically redeploy**

### Monitoring

- Use Railway's monitoring tools for backend performance
- Use Vercel's analytics for frontend performance

## Security Considerations

1. **JWT Secret**
   - Use a strong, random JWT secret
   - Never expose it in client-side code
   - Rotate it periodically for enhanced security

2. **Database Security**
   - Ensure your database connection is secure
   - Use strong passwords
   - Enable SSL for database connections

3. **API Security**
   - Implement rate limiting for API endpoints
   - Use HTTPS for all communications
   - Validate all user inputs
