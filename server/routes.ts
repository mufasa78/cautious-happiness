import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clientProjectSchema, insertContactSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { Octokit } from "octokit";

// Custom error handler for Zod validation errors
function handleValidationError(error: unknown) {
  if (error instanceof ZodError) {
    return fromZodError(error);
  }
  
  return { message: error instanceof Error ? error.message : "An unexpected error occurred" };
}

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
  
  // Admin endpoints (would typically require authentication)
  
  // Get all client submissions
  apiRouter.get("/admin/clients", async (req, res) => {
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
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve client details";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get all projects
  apiRouter.get("/admin/projects", async (req, res) => {
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
      const errorMessage = error instanceof Error ? error.message : "Failed to update project status";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get all contact submissions
  apiRouter.get("/admin/contacts", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
