import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").default("client").notNull(), // 'admin' or 'client'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Client schema for storing client project requests
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Link to users table (optional initially, updated later)
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Project schema for storing project details
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  projectType: text("project_type").notNull(),
  description: text("description").notNull(),
  features: text("features").array(),
  budget: text("budget").notNull(),
  timeline: text("timeline").notNull(),
  startDate: text("start_date"),
  deadline: text("deadline"),
  additionalRequirements: text("additional_requirements"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Combined client project submission schema for the onboarding form
export const clientProjectSchema = z.object({
  // Personal Info
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  company: z.string().optional(),
  address: z.string().optional(),
  
  // Account creation
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  
  // Project Details
  projectType: z.string().min(1, "Project type is required"),
  description: z.string().min(10, "Project description is required"),
  features: z.array(z.string()).optional(),
  
  // Budget & Timeline
  budget: z.string().min(1, "Budget range is required"),
  timeline: z.string().min(1, "Timeline is required"),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  additionalRequirements: z.string().optional(),
  
  // Terms agreement
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
});

export type ClientProjectSubmission = z.infer<typeof clientProjectSchema>;

// Documents/files shared between client and admin
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedBy: integer("uploaded_by").notNull(), // User ID who uploaded
  uploadedByType: text("uploaded_by_type").notNull(), // "admin" or "client"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Messages between client and admin
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  senderId: integer("sender_id").notNull(), // User ID
  senderType: text("sender_type").notNull(), // "admin" or "client"
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Full message schema
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Partial message schema for client-side submission (senderId and senderType are added by the server)
export const clientMessageSchema = z.object({
  projectId: z.number().positive("Project ID is required"),
  content: z.string().min(1, "Message content is required"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Define relationships between tables

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId],
  }),
}));

// Client relations
export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  projects: many(projects),
}));

// Project relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  documents: many(documents),
  messages: many(messages),
}));

// Document relations
export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

// Message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
