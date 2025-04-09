# Railway Deployment Guide

This guide will help you deploy the backend of your application to Railway.

## Prerequisites
- GitHub repository with your code
- Railway account (https://railway.app)

## Step 1: Push your code to GitHub
Make sure your latest code is pushed to your GitHub repository.

## Step 2: Create a new project on Railway
1. Go to Railway dashboard and click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Choose the main branch (or your preferred branch)

## Step 3: Configure environment variables
In your Railway project, go to the "Variables" tab and add the following environment variables:

```
NODE_ENV=production
JWT_SECRET=your-secret-key-here
DATABASE_URL=your-database-url
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
PORT=3000
```

**Important Notes:**
- Use the same JWT_SECRET value that you have in your local .env file
- For DATABASE_URL, use your Neon database URL
- Make sure to use the correct EMAIL_USER and EMAIL_PASSWORD values

## Step 4: Troubleshooting Railway Deployment

If your deployment is crashing, check the following:

1. **Check the logs in Railway**
   - Go to your project in Railway
   - Click on the "Deployments" tab
   - Click on the latest deployment
   - Check the logs for any errors

2. **Common issues and solutions:**

   a. **Database connection issues:**
   - Make sure your DATABASE_URL is correct
   - Ensure your database is accessible from Railway
   - Check if your database has any IP restrictions

   b. **Environment variable issues:**
   - Verify all required environment variables are set
   - Check for typos in environment variable names
   - Make sure sensitive values are properly escaped

   c. **Build/start command issues:**
   - The project is configured to use `npm run start:railway`
   - Make sure this script exists in your package.json
   - Check if there are any errors during the build process

3. **Manual deployment:**
   If automatic deployment is failing, you can try a manual deployment:
   - Install the Railway CLI: `npm i -g @railway/cli`
   - Login to Railway: `railway login`
   - Link to your project: `railway link`
   - Deploy manually: `railway up`

## Step 5: Get your Railway URL
Once your deployment is successful, Railway will provide you with a URL (e.g., https://portfoliohub-production.up.railway.app).

Save this URL as you'll need it for the frontend configuration in Vercel.
