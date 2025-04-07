import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { clientProjectSchema, insertContactSchema, insertDocumentSchema, insertMessageSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { Octokit } from "octokit";
import multer from "multer";
import { 
  authenticateJWT, 
  login, 
  register, 
  getCurrentUser, 
  initializeAdminUser 
} from "./auth";
import { sendClientAccountNotification } from "./email";

// Set up file upload directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: function(req, file, cb) {
    // Accept common document and image file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Reject the file but don't throw an error
      cb(null, false);
      (req as any).fileValidationError = 'Invalid file type. Only documents and images are allowed.';
    }
  }
});

// Custom error handler for Zod validation errors
function handleValidationError(error: unknown) {
  if (error instanceof ZodError) {
    return fromZodError(error);
  }
  
  return { message: error instanceof Error ? error.message : "An unexpected error occurred" };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin user
  await initializeAdminUser();
  
  // API routes
  const apiRouter = express.Router();
  
  // Authentication routes
  // Remove public registration
  // apiRouter.post("/register", register);
  apiRouter.post("/login", login);
  apiRouter.get("/me", authenticateJWT, getCurrentUser);
  
  // Client onboarding submission endpoint
  apiRouter.post("/client-onboarding", async (req, res) => {
    try {
      const validatedData = clientProjectSchema.parse(req.body);
      const result = await storage.createClientWithProject(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Project request submitted successfully",
        data: result
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      
      res.status(error instanceof ZodError ? 400 : 500).json({
        success: false,
        message: validationError.message
      });
    }
  });
  
  // Contact form submission endpoint
  apiRouter.post("/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: contact
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      
      res.status(error instanceof ZodError ? 400 : 500).json({
        success: false,
        message: validationError.message
      });
    }
  });
  
  // Admin endpoints - protected by JWT authentication
  
  // Get all client submissions
  apiRouter.get("/admin/clients", authenticateJWT, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve clients";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get client details with projects
  apiRouter.get("/admin/clients/:id", authenticateJWT, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClientById(clientId);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found"
        });
      }
      
      const projects = await storage.getProjectsByClientId(clientId);
      
      res.json({
        client,
        projects
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve client details";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get all projects
  apiRouter.get("/admin/projects", authenticateJWT, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve projects";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Update project status
  apiRouter.patch("/admin/projects/:id/status", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }
      
      const updatedProject = await storage.updateProjectStatus(projectId, status);
      
      if (!updatedProject) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }
      
      res.json({
        success: true,
        message: "Project status updated",
        data: updatedProject
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update project status";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get all contact submissions
  apiRouter.get("/admin/contacts", authenticateJWT, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve contact submissions";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Client registration - for creating accounts for existing clients
  apiRouter.post("/register-client", authenticateJWT, async (req, res) => {
    try {
      // Only admin can register clients
      if (req.user?.userType !== 'admin') {
        return res.status(403).json({ error: "Not authorized to perform this action" });
      }
      
      // Get client details before registration
      const { clientId, username, password } = req.body;
      
      if (!clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      
      const client = await storage.getClientById(parseInt(clientId));
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      // Store the original request object and response
      const originalReq = { ...req };
      
      // Call the register function
      await register(req, res);
      
      // If we get here, registration was successful, so update the client record
      if (client) {
        try {
          // Update the client with the new user ID (last created user ID)
          const clients = await storage.getClients();
          const users = await Promise.all(clients.map(async c => {
            if (c.userId) {
              return await storage.getUser(c.userId);
            }
            return undefined;
          }));
          
          const newUser = users.find(u => u?.username === username);
          
          if (newUser) {
            await storage.updateClientUser(client.id, newUser.id);
            
            // Send email notification
            const baseUrl = originalReq.body.baseUrl || `${req.protocol}://${req.get('host')}`;
            const clientPortalUrl = `${baseUrl}/client-login`;
            
            await sendClientAccountNotification(
              client.email,
              client.fullName,
              username,
              clientPortalUrl
            );
          }
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
          // We don't want to fail the request if email fails
        }
      }
    } catch (error) {
      console.error("Client registration error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Document management endpoints
  
  // Upload document (JSON data only)
  apiRouter.post("/documents", authenticateJWT, async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      
      // Add the user info to the document
      const documentWithUser = {
        ...validatedData,
        uploadedBy: req.user!.id,
        uploadedByType: req.user!.userType || 'client'
      };
      
      const document = await storage.createDocument(documentWithUser);
      
      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: document
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      
      res.status(error instanceof ZodError ? 400 : 500).json({
        success: false,
        message: validationError.message
      });
    }
  });
  
  // Upload document with file
  apiRouter.post("/upload-document", authenticateJWT, upload.single('file'), async (req, res) => {
    try {
      // Check for file validation error
      if ((req as any).fileValidationError) {
        return res.status(400).json({
          success: false,
          message: (req as any).fileValidationError
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      const projectId = parseInt(req.body.projectId);
      if (isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid project ID is required"
        });
      }
      
      // Generate file URL based on server path
      const fileUrl = `/uploads/${req.file.filename}`;
      const fileName = req.body.fileName || req.file.originalname;
      const fileType = req.body.fileType || req.file.mimetype;
      const description = req.body.description || '';
      
      // Create document record
      const documentData = {
        projectId,
        fileName,
        fileType,
        fileUrl,
        description: description || null,
        uploadedBy: req.user!.id,
        uploadedByType: req.user!.userType || 'client'
      };
      
      const document = await storage.createDocument(documentData);
      
      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: document
      });
    } catch (error) {
      console.error("File upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload document";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get documents for a project
  apiRouter.get("/projects/:projectId/documents", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const documents = await storage.getDocumentsByProjectId(projectId);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve documents";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Messaging endpoints
  
  // Send a message
  apiRouter.post("/messages", authenticateJWT, async (req, res) => {
    try {
      // Use the client message schema for validation
      const { clientMessageSchema } = await import("@shared/schema");
      const validatedData = clientMessageSchema.parse(req.body);
      
      // Add the sender info to the message
      const messageWithSender = {
        ...validatedData,
        senderId: req.user!.id,
        senderType: req.user!.userType || 'client',
        isRead: false
      };
      
      const message = await storage.createMessage(messageWithSender);
      
      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      
      res.status(error instanceof ZodError ? 400 : 500).json({
        success: false,
        message: validationError.message
      });
    }
  });
  
  // Get messages for a project
  apiRouter.get("/projects/:projectId/messages", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const messages = await storage.getMessagesByProjectId(projectId);
      
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve messages";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Mark message as read
  apiRouter.patch("/messages/:id/read", authenticateJWT, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      
      if (!updatedMessage) {
        return res.status(404).json({
          success: false,
          message: "Message not found"
        });
      }
      
      res.json({
        success: true,
        message: "Message marked as read",
        data: updatedMessage
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark message as read";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get projects for client
  apiRouter.get("/projects", authenticateJWT, async (req, res) => {
    try {
      let projects;
      
      // If user is admin, return all projects
      if (req.user?.userType === 'admin') {
        projects = await storage.getProjects();
      } else {
        // For client users, only return projects associated with their client record
        // We need to find the client record based on the user id
        const clients = await storage.getClients();
        const clientRecord = clients.find(client => client.userId === req.user?.id);
        
        if (!clientRecord) {
          return res.status(404).json({
            success: false,
            message: "No client record found for this user"
          });
        }
        
        projects = await storage.getProjectsByClientId(clientRecord.id);
      }
      
      res.json(projects);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve projects";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });

  // GitHub API integration - fetch repositories from mufasa78
  apiRouter.get("/github/repos", async (req, res) => {
    try {
      const octokit = new Octokit();
      
      // Fetch repositories for the specific GitHub username
      const response = await octokit.rest.repos.listForUser({
        username: 'mufasa78',
        sort: 'updated',
        direction: 'desc',
        per_page: 10 // Limit to top 10 repos
      });
      
      // Transform the data to include only what we need
      const repositories = response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
        homepage: repo.homepage
      }));
      
      res.json({
        success: true,
        data: repositories
      });
    } catch (error) {
      console.error('GitHub API error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve GitHub repositories";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Register the API router with the /api prefix
  app.use("/api", apiRouter);
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  const httpServer = createServer(app);

  return httpServer;
}
