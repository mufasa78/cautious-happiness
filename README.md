# Help With Mufasa - Web Development Services

## Deployment Guide

### Vercel Deployment

This application is configured to be deployed on Vercel. Follow these steps to deploy:

1. Push your code to a GitHub repository
2. Connect your Vercel account to your GitHub repository
3. Create a new project in Vercel and select your repository
4. Configure the following environment variables in Vercel:
   - `DATABASE_URL`: Your Neon database connection string
   - `JWT_SECRET`: Your JWT secret key for authentication
   - `EMAIL_USER`: Email address for sending notifications
   - `EMAIL_PASSWORD`: Password for the email account
   - `NODE_ENV`: Set to `production`

### Local Development

To run the application locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run the development server: `npm run dev`

### Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `EMAIL_USER`: Email address for sending notifications
- `EMAIL_PASSWORD`: Password for the email account

### Build Process

The build process is handled by the `vercel-build.js` script, which:

1. Builds the client-side React application using Vite
2. Compiles TypeScript files
3. Bundles the server-side code using esbuild

### Project Structure

- `client/`: React frontend application
- `server/`: Node.js backend API
- `shared/`: Shared types and schemas
- `dist/`: Build output directory
- `migrations/`: Database migration files

### Troubleshooting

If you encounter issues with the deployment:

1. Check that all environment variables are correctly set in Vercel
2. Verify that the build process completed successfully in the Vercel logs
3. Ensure the database is accessible from the Vercel deployment
4. Check for any CORS issues if the frontend cannot communicate with the backend
