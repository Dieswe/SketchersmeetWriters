import { pgTable, text, uuid, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Prompts table
export const prompts = pgTable("prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // "text" or "image"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  isDaily: boolean("is_daily").default(false),
  // Extra eigenschappen voor de UI
  contributionsCount: integer("contributions_count").default(0),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: uuid("prompt_id").references(() => prompts.id).notNull(),
  userId: uuid("user_id").notNull(), // null mogelijk voor anonieme gebruikers
  type: text("type").notNull(), // "text" or "image" 
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
});

// Likes table 
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id).notNull(),
  userId: uuid("user_id"), // null mogelijk voor anonieme likes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id).notNull(),
  userId: uuid("user_id"), // null mogelijk voor anonieme comments
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertPromptSchema = createInsertSchema(prompts).pick({
  type: true,
  content: true,
  isActive: true,
  isDaily: true,
}).partial({ isActive: true, isDaily: true });

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  promptId: true,
  userId: true,
  type: true,
  content: true,
}).partial({ userId: true });

export const insertCommentSchema = createInsertSchema(comments).pick({
  submissionId: true,
  userId: true,
  text: true,
}).partial({ userId: true });

export const insertLikeSchema = createInsertSchema(likes).pick({
  submissionId: true,
  userId: true,
}).partial({ userId: true });

// Types
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
