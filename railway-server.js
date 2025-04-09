// Simple Express server for Railway deployment
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';
import { storage } from './server/storage.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS - more permissive for initial deployment
app.use(cors({
  origin: '*', // Allow all origins during initial testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Once everything is working, you can restrict to specific origins:
/*
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://mufasa-kappa.vercel.app',
  // Add your custom domain when you have it
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PortfolioHub API is running',
    version: '1.0.0',
    endpoints: [
      '/api/login',
      '/api/me',
      '/api/health',
      '/api/debug'
    ]
  });
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate a JWT token for a user
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    userType: user.userType
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d" // Token expires in 7 days
  });
}

// Middleware to verify JWT tokens
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user endpoint
app.get('/api/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user from database
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    jwt: process.env.JWT_SECRET ? 'configured' : 'not configured',
    email: process.env.EMAIL_USER ? 'configured' : 'not configured'
  });
});

// Debug endpoint to check environment variables (remove in production)
app.get('/api/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : null,
    jwt: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : null,
    email: process.env.EMAIL_USER || null
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
