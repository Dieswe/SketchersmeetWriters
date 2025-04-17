import { pgTable, text, serial, integer, boolean, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prompts table
export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
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
  id: uuid("id").defaultRandom().primaryKey(),
  promptId: uuid("prompt_id").references(() => prompts.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(), // "text" or "image"
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Likes table to track which submissions users have liked
export const likes = pgTable("likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  submissionId: uuid("submission_id").references(() => submissions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userSubmissionUnique: uniqueIndex("user_submission_idx").on(table.userId, table.submissionId),
  };
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").references(() => submissions.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for users
export const usersRelations = relations(users, ({ many }) => ({
  prompts: many(prompts),
  submissions: many(submissions),
  likes: many(likes),
  comments: many(comments),
}));

// Relations for prompts
export const promptsRelations = relations(prompts, ({ one, many }) => ({
  creator: one(users, {
    fields: [prompts.creatorId],
    references: [users.id],
  }),
  submissions: many(submissions),
}));

// Relations for submissions
export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  prompt: one(prompts, {
    fields: [submissions.promptId],
    references: [prompts.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  likes: many(likes),
  comments: many(comments),
}));

// Relations for likes
export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  submission: one(submissions, {
    fields: [likes.submissionId],
    references: [submissions.id],
  }),
}));

// Relations for comments
export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  submission: one(submissions, {
    fields: [comments.submissionId],
    references: [submissions.id],
  }),
}));

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
})
  // fallback voor anonieme comments
  .partial({ userId: true });

export const insertLikeSchema = createInsertSchema(likes).pick({
  userId: true,
  submissionId: true,
})
  // fallback voor anonieme likes
  .partial({ userId: true });

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
