import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcryptjs";
import { storage } from "./storage";
import { InsertUser, User } from "@shared/schema";

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

// Generate a JWT token for a user
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d" // Token expires in 7 days
  });
}

// Hash a password before storing
export function hashPassword(password: string): string {
  return hashSync(password, SALT_ROUNDS);
}

// Verify a plaintext password against a hashed one
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return compareSync(password, hashedPassword);
}

// Middleware to verify JWT tokens
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, username: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Route handlers
export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    
    // Create user with hashed password
    const hashedPassword = hashPassword(password);
    const userData: InsertUser = {
      username,
      password: hashedPassword
    };
    
    const newUser = await storage.createUser(userData);
    
    // Generate token
    const token = generateToken(newUser);
    
    // Return user without password and token
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Verify password
    const isValidPassword = verifyPassword(password, user.password);
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
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

// Add type declaration for the user property on the Request object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}