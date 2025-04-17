import { pgTable, text, uuid, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Prompts table
export const prompts = pgTable("prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // "text" or "image"
  content: text("content").notNull(),
  author: text("author").default("anon"), // Optioneel, kan 'anon' of gebruikers-id zijn
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Extra eigenschappen voor de UI
  isActive: boolean("is_active").default(false),
  isDaily: boolean("is_daily").default(false),
  contributionsCount: integer("contributions_count").default(0),
  commentsCount: integer("comments_count").default(0),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: uuid("prompt_id").references(() => prompts.id).notNull(),
  type: text("type").notNull(), // "text" or "image"
  content: text("content").notNull(),
  author: text("author").default("anon"), // Optioneel, kan 'anon' of gebruikers-id zijn
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
});

// Likes table to track likes on submissions
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id).notNull(),
  userId: text("user_id").default("anon"), // Optioneel voor anonieme likes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments table for both prompts and submissions
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentType: text("content_type").notNull(), // "prompt" of "submission"
  contentId: uuid("content_id").notNull(), // ID van de prompt of submission
  userId: text("user_id").default("anon"), // Optioneel, kan anoniem zijn
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertPromptSchema = createInsertSchema(prompts).pick({
  type: true,
  content: true,
  author: true,
  isActive: true,
  isDaily: true,
}).partial({ author: true, isActive: true, isDaily: true });

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  promptId: true,
  type: true,
  content: true,
  author: true,
}).partial({ author: true });

export const insertCommentSchema = createInsertSchema(comments).pick({
  contentType: true,
  contentId: true,
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
