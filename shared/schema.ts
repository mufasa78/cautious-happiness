import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Client schema for storing client project requests
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
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
