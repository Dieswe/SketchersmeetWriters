import { eq, and, desc, asc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  prompts, Prompt, InsertPrompt,
  submissions, Submission, InsertSubmission,
  comments, Comment, InsertComment,
  likes, Like, InsertLike
} from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

// Storage interface
export interface IStorage {
  // Prompt methods
  getPrompt(id: string): Promise<Prompt | undefined>;
  getPromptsByType(type: string): Promise<Prompt[]>;
  getPopularPrompts(limit: number): Promise<Prompt[]>;
  getDailyPrompt(): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  
  // Submission methods
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByPromptId(promptId: string): Promise<Submission[]>;
  getSubmissionsByType(type: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Comment methods
  getCommentsByContentId(contentType: string, contentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Like methods
  getLike(userId: string, submissionId: string): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: string, submissionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPrompt(id: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async getPromptsByType(type: string): Promise<Prompt[]> {
    return db.select().from(prompts)
      .where(eq(prompts.type, type))
      .orderBy(desc(prompts.createdAt));
  }

  async getPopularPrompts(limit: number): Promise<Prompt[]> {
    return db.select().from(prompts)
      .orderBy(desc(prompts.contributionsCount))
      .limit(limit);
  }
  
  async getDailyPrompt(): Promise<Prompt | undefined> {
    // Haal de meest recente prompt van vandaag
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start van de dag
    
    const [dailyPrompt] = await db.select().from(prompts)
      .where(sql`DATE(${prompts.createdAt}) = CURRENT_DATE`)
      .orderBy(desc(prompts.createdAt))
      .limit(1);
      
    return dailyPrompt;
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db.insert(prompts).values(insertPrompt).returning();
    return prompt;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async getSubmissionsByPromptId(promptId: string): Promise<Submission[]> {
    return db.select().from(submissions)
      .where(eq(submissions.promptId, promptId))
      .orderBy(desc(submissions.createdAt));
  }
  
  async getSubmissionsByType(type: string): Promise<Submission[]> {
    return db.select().from(submissions)
      .where(eq(submissions.type, type))
      .orderBy(desc(submissions.createdAt));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    
    // Update the contributions count for the prompt
    await db.update(prompts)
      .set({ contributionsCount: sql`${prompts.contributionsCount} + 1` })
      .where(eq(prompts.id, insertSubmission.promptId));
      
    return submission;
  }

  async getCommentsByContentId(contentType: string, contentId: string): Promise<Comment[]> {
    return db.select().from(comments)
      .where(
        and(
          eq(comments.contentType, contentType),
          eq(comments.contentId, contentId)
        )
      )
      .orderBy(asc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    
    // Als het een comment is op een submission, update de comments count
    if (insertComment.contentType === 'submission') {
      await db.update(submissions)
        .set({ comments: sql`${submissions.comments} + 1` })
        .where(eq(submissions.id, insertComment.contentId));
    } 
    // Als het een comment is op een prompt, update de comments count
    else if (insertComment.contentType === 'prompt') {
      await db.update(prompts)
        .set({ commentsCount: sql`${prompts.commentsCount} + 1` })
        .where(eq(prompts.id, insertComment.contentId));
    }
    
    return comment;
  }

  async getLike(userId: string, submissionId: string): Promise<Like | undefined> {
    const [like] = await db.select().from(likes).where(
      and(
        eq(likes.userId, userId),
        eq(likes.submissionId, submissionId)
      )
    );
    return like;
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db.insert(likes).values(insertLike).returning();
    
    // Update de likes count voor de submission
    await db.update(submissions)
      .set({ likes: sql`${submissions.likes} + 1` })
      .where(eq(submissions.id, insertLike.submissionId));
      
    return like;
  }

  async deleteLike(userId: string, submissionId: string): Promise<void> {
    // Verwijder de like
    await db.delete(likes).where(
      and(
        eq(likes.userId, userId),
        eq(likes.submissionId, submissionId)
      )
    );
    
    // Update de likes count voor de submission
    await db.update(submissions)
      .set({ likes: sql`${submissions.likes} - 1` })
      .where(eq(submissions.id, submissionId));
  }
}

export const storage = new DatabaseStorage();
