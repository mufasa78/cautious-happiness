import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  projects, type Project, type InsertProject,
  contacts, type Contact, type InsertContact,
  type ClientProjectSubmission
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Client methods
  createClientWithProject(submission: ClientProjectSubmission): Promise<{client: Client, project: Project}>;
  getClients(): Promise<Client[]>;
  getClientById(id: number): Promise<Client | undefined>;
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProjectsByClientId(clientId: number): Promise<Project[]>;
  updateProjectStatus(id: number, status: string): Promise<Project | undefined>;
  
  // Contact form submissions
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private contacts: Map<number, Contact>;
  
  private userId: number;
  private clientId: number;
  private projectId: number;
  private contactId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.contacts = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.projectId = 1;
    this.contactId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Client methods
  async createClientWithProject(submission: ClientProjectSubmission): Promise<{client: Client, project: Project}> {
    // First create the client
    const clientId = this.clientId++;
    const now = new Date();
    
    const client: Client = {
      id: clientId,
      fullName: submission.fullName,
      email: submission.email,
      phone: submission.phone,
      company: submission.company || null,
      address: submission.address || null,
      createdAt: now
    };
    
    this.clients.set(clientId, client);
    
    // Then create the project linked to this client
    const projectId = this.projectId++;
    
    const project: Project = {
      id: projectId,
      clientId,
      projectType: submission.projectType,
      description: submission.description,
      features: submission.features || [],
      budget: submission.budget,
      timeline: submission.timeline,
      startDate: submission.startDate || null,
      deadline: submission.deadline || null,
      additionalRequirements: submission.additionalRequirements || null,
      status: "pending",
      createdAt: now
    };
    
    this.projects.set(projectId, project);
    
    return { client, project };
  }
  
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async getClientById(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.clientId === clientId
    );
  }
  
  async updateProjectStatus(id: number, status: string): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, status };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  // Contact form submissions
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const now = new Date();
    
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: now
    };
    
    this.contacts.set(id, contact);
    return contact;
  }
  
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
}

export const storage = new MemStorage();
