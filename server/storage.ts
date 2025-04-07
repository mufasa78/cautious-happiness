import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  projects, type Project, type InsertProject,
  contacts, type Contact, type InsertContact,
  documents, type Document, type InsertDocument,
  messages, type Message, type InsertMessage,
  type ClientProjectSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
  updateClientUser(clientId: number, userId: number): Promise<Client | undefined>;
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProjectsByClientId(clientId: number): Promise<Project[]>;
  updateProjectStatus(id: number, status: string): Promise<Project | undefined>;
  
  // Contact form submissions
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByProjectId(projectId: number): Promise<Document[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByProjectId(projectId: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private contacts: Map<number, Contact>;
  private documents: Map<number, Document>;
  private messages: Map<number, Message>;
  
  private userId: number;
  private clientId: number;
  private projectId: number;
  private contactId: number;
  private documentId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.contacts = new Map();
    this.documents = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.projectId = 1;
    this.contactId = 1;
    this.documentId = 1;
    this.messageId = 1;
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
    const now = new Date();
    
    const user: User = {
      ...insertUser,
      id,
      userType: insertUser.userType || 'client',
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      createdAt: now
    };
    
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
      userId: null,
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
  
  async updateClientUser(clientId: number, userId: number): Promise<Client | undefined> {
    const client = this.clients.get(clientId);
    if (!client) return undefined;
    
    const updatedClient = { ...client, userId };
    this.clients.set(clientId, updatedClient);
    return updatedClient;
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
  
  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const now = new Date();
    
    const document: Document = {
      ...insertDocument,
      id,
      description: insertDocument.description || null,
      createdAt: now
    };
    
    this.documents.set(id, document);
    return document;
  }
  
  async getDocumentsByProjectId(projectId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      document => document.projectId === projectId
    );
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    
    const message: Message = {
      ...insertMessage,
      id,
      isRead: insertMessage.isRead !== undefined ? insertMessage.isRead : false,
      createdAt: now
    };
    
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesByProjectId(projectId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Client methods
  async createClientWithProject(submission: ClientProjectSubmission): Promise<{client: Client, project: Project}> {
    // Create client
    const clientData: InsertClient = {
      fullName: submission.fullName,
      email: submission.email,
      phone: submission.phone,
      company: submission.company || null,
      address: submission.address || null,
    };
    
    const [client] = await db.insert(clients).values(clientData).returning();
    
    // Create project
    const projectData: InsertProject = {
      clientId: client.id,
      projectType: submission.projectType,
      description: submission.description,
      features: submission.features || [],
      budget: submission.budget,
      timeline: submission.timeline,
      startDate: submission.startDate || null,
      deadline: submission.deadline || null,
      additionalRequirements: submission.additionalRequirements || null,
      status: 'pending',
    };
    
    const [project] = await db.insert(projects).values(projectData).returning();
    
    return { client, project };
  }

  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClientById(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }
  
  async updateClientUser(clientId: number, userId: number): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set({ userId })
      .where(eq(clients.id, clientId))
      .returning();
    
    return updatedClient || undefined;
  }
  
  // Project methods
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return db.select()
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.createdAt));
  }

  async updateProjectStatus(id: number, status: string): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ status })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject || undefined;
  }
  
  // Contact form submissions
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
  
  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    
    return document;
  }
  
  async getDocumentsByProjectId(projectId: number): Promise<Document[]> {
    return db.select()
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.createdAt));
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    return message;
  }
  
  async getMessagesByProjectId(projectId: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(desc(messages.createdAt));
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    
    return updatedMessage || undefined;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
