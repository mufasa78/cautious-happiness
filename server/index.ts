import dotenv from 'dotenv';

// Load environment variables from .env file
// In production, environment variables are set by Vercel
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import path from "path";
import fs from "fs";

// Create Express app
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error: ${message} (${status})`);

    res.status(status).json({
      success: false,
      message
    });

    // Don't throw the error again as it will crash the server
    // Only log it
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve static files directly
    const clientPath = path.resolve(process.cwd(), 'dist/public');
    console.log(`Serving static files from: ${clientPath}`);

    // Check if the directory exists
    if (fs.existsSync(clientPath)) {
      console.log('Static directory exists');
      try {
        const files = fs.readdirSync(clientPath);
        console.log('Files in static directory:', files);
      } catch (error) {
        console.error('Error listing static files:', error);
      }
    } else {
      console.warn('Static directory does not exist:', clientPath);
    }

    // Serve static files
    app.use(express.static(clientPath));

    // Serve index.html for all other routes
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(clientPath, 'index.html'));
    });
  }

  // In production (like Vercel), use the PORT environment variable
  // Otherwise, default to port 5000 for local development
  const port = process.env.PORT || 5000;

  server.listen(port, () => {
    log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  });
})();
