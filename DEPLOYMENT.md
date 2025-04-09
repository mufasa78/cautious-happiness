# Deployment Guide

This application is split into two parts for deployment:
1. Frontend (React) - Deployed on Vercel
2. Backend (Node.js/Express) - Deployed on a service like Render, Heroku, or Railway

## Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the following settings:
   - Framework Preset: Vite
   - Build Command: `npm run build:frontend`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `/` (or the directory containing your package.json)

4. Add the following environment variable:
   - `VITE_API_URL`: The URL of your backend API (e.g., https://your-backend-api.com)

## Backend Deployment (Render)

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Create a new Web Service
4. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `npm run start`

5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Your JWT secret key (use a strong, random value)
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `EMAIL_USER`: Your email username for sending notifications
   - `EMAIL_PASSWORD`: Your email password

## Important Notes

1. Make sure your JWT_SECRET is the same on both development and production environments to ensure tokens work correctly.

2. For the database, you can use Neon (as you're currently using) or any other PostgreSQL provider.

3. CORS is already configured in the server to accept requests from any origin. If you want to restrict this for security, update the CORS configuration in `server/index.ts`.

4. After deploying both frontend and backend, update the `VITE_API_URL` in Vercel to point to your backend API URL.

## Troubleshooting

If you encounter login issues:

1. Check that the `VITE_API_URL` is correctly set in Vercel
2. Verify that the backend API is accessible and responding to requests
3. Ensure the JWT_SECRET is consistent between environments
4. Check the browser console for any CORS or network errors
