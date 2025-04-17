import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prompts table
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  creatorRole: text("creator_role").notNull(), // "writer" or "sketcher"
  type: text("type").notNull(), // "text" or "image"
  content: text("content").notNull(),
  isActive: boolean("is_active").default(false),
  isDaily: boolean("is_daily").default(false),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").references(() => prompts.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // "text" or "image"
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Likes table to track which submissions users have liked
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  submissionId: integer("submission_id").references(() => submissions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").references(() => submissions.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  avatar: true,
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  creatorId: true,
  creatorRole: true,
  type: true,
  content: true,
  isActive: true,
  isDaily: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  promptId: true,
  userId: true,
  type: true,
  content: true,
})
  // fallback voor anonieme uploads
  .partial({ userId: true });

export const insertCommentSchema = createInsertSchema(comments).pick({
  submissionId: true, 
  userId: true,
  content: true,
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  userId: true,
  submissionId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
