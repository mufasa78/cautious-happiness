import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clientProjectSchema, insertContactSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
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
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: validationError.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: "An unexpected error occurred"
        });
      }
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
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: validationError.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: "An unexpected error occurred"
        });
      }
    }
  });
  
  // Admin endpoints (would typically require authentication)
  
  // Get all client submissions
  apiRouter.get("/admin/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve clients"
      });
    }
  });
  
  // Get client details with projects
  apiRouter.get("/admin/clients/:id", async (req, res) => {
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
      res.status(500).json({
        success: false,
        message: "Failed to retrieve client details"
      });
    }
  });
  
  // Get all projects
  apiRouter.get("/admin/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve projects"
      });
    }
  });
  
  // Update project status
  apiRouter.patch("/admin/projects/:id/status", async (req, res) => {
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
      res.status(500).json({
        success: false,
        message: "Failed to update project status"
      });
    }
  });
  
  // Get all contact submissions
  apiRouter.get("/admin/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve contact submissions"
      });
    }
  });
  
  // Register the API router with the /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
