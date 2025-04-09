// vercel.js - A simple handler for Vercel serverless deployment
import { createServer } from 'http';
import { app } from './server/index.js';

// Create a server instance
const server = createServer(app);

// Export the server for Vercel
export default function handler(req, res) {
  // Pass the request to the Express app
  return app(req, res);
}
