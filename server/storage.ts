import {
  users, User, InsertUser,
  prompts, Prompt, InsertPrompt,
  submissions, Submission, InsertSubmission,
  comments, Comment, InsertComment,
  likes, Like, InsertLike
} from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt methods
  getPrompt(id: string): Promise<Prompt | undefined>;
  getPromptsByCreatorRole(role: string): Promise<Prompt[]>;
  getPopularPrompts(limit: number): Promise<Prompt[]>;
  getDailyPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  
  // Submission methods
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByPromptId(promptId: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Comment methods
  getCommentsBySubmissionId(submissionId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Like methods
  getLike(userId: string, submissionId: string): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: string, submissionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Prompt methods
  async getPrompt(id: string): Promise<Prompt | undefined> {
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, id));
    return prompt;
  }
  
  async getDailyPrompts(): Promise<Prompt[]> {
    return await db
      .select()
      .from(prompts)
      .where(eq(prompts.isDaily, true))
      .orderBy(desc(prompts.createdAt));
  }
  
  async getPromptsByCreatorRole(role: string): Promise<Prompt[]> {
    // This returns prompts that writers/sketchers can respond to
    // So for writer role, we show sketcher prompts and vice versa
    const oppositeRole = role === "writer" ? "sketcher" : "writer";
    return await db
      .select()
      .from(prompts)
      .where(eq(prompts.creatorRole, oppositeRole))
      .orderBy(
        desc(prompts.isDaily),
        desc(prompts.createdAt)
      );
  }
  
  async getPopularPrompts(limit: number): Promise<Prompt[]> {
    return await db
      .select()
      .from(prompts)
      .orderBy(desc(prompts.likes))
      .limit(limit);
  }
  
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    // Add default values for the "likes" and "comments" fields
    const valuesWithDefaults = {
      ...insertPrompt,
      likes: 0,
      comments: 0,
    };
    
    const [prompt] = await db
      .insert(prompts)
      .values(valuesWithDefaults)
      .returning();
    return prompt;
  }
  
  // Submission methods
  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));
    return submission;
  }
  
  async getSubmissionsByPromptId(promptId: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.promptId, promptId))
      .orderBy(desc(submissions.createdAt));
  }
  
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    // Add default values for the "likes" and "comments" fields
    const valuesWithDefaults = {
      ...insertSubmission,
      likes: 0,
      comments: 0,
    };
    
    const [submission] = await db
      .insert(submissions)
      .values(valuesWithDefaults)
      .returning();
    return submission;
  }
  
  // Comment methods
  async getCommentsBySubmissionId(submissionId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.submissionId, submissionId))
      .orderBy(comments.createdAt);
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    
    // Update submission comment count with COALESCE to safely handle null values
    await db
      .update(submissions)
      .set({
        comments: sql`COALESCE(${submissions.comments}, 0) + 1`,
      })
      .where(eq(submissions.id, insertComment.submissionId));
    
    return comment;
  }
  
  // Like methods
  async getLike(userId: string, submissionId: string): Promise<Like | undefined> {
    if (!userId) {
      return undefined;
    }
    
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.submissionId, submissionId)
        )
      );
    return like;
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values(insertLike)
      .returning();
    
    // Update submission like count
    await db
      .update(submissions)
      .set({
        likes: sql`COALESCE(${submissions.likes}, 0) + 1`,
      })
      .where(eq(submissions.id, insertLike.submissionId));
    
    return like;
  }
  
  async deleteLike(userId: string, submissionId: string): Promise<void> {
    if (!userId) {
      return;
    }
    
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.submissionId, submissionId)
        )
      );
    
    // Update submission like count
    await db
      .update(submissions)
      .set({
        likes: sql`GREATEST(COALESCE(${submissions.likes}, 0) - 1, 0)`,
      })
      .where(eq(submissions.id, submissionId));
  }
  
  // Initialize the database with sample data if needed
  async initializeDatabase() {
    // Check if there's any data in the users table
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    const count = Number(userCount?.count || '0');
    
    if (count === 0) {
      console.log("Initializing database with sample data");
      
      // Create users
      const user1 = await this.createUser({
        username: "alexj",
        password: "password123",
        name: "Alex Janssen",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
      });
      
      const user2 = await this.createUser({
        username: "saradv",
        password: "password123",
        name: "Sara de Vries",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
      });
      
      const user3 = await this.createUser({
        username: "thomasb",
        password: "password123",
        name: "Thomas Berg",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36"
      });
      
      const user4 = await this.createUser({
        username: "kimv",
        password: "password123",
        name: "Kim Visser",
        avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e"
      });
      
      const user5 = await this.createUser({
        username: "joostb",
        password: "password123",
        name: "Joost Bakker",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
      });
      
      // Create writer prompts
      const writerPrompt1 = await this.createPrompt({
        creatorId: user1.id,
        creatorRole: "writer",
        type: "text",
        content: "\"De oude vuurtoren stond daar, eenzaam aan de rand van de kliffen, als een stille wachter over de woeste zee. Jarenlang had hij schepen veilig naar de kust geloodst, maar nu stond hij verlaten, zijn licht gedoofd. Tot die ene stormachtige nacht, toen haar lantaarn voor het eerst in decennia weer tot leven kwam...\"",
        isActive: true,
        isDaily: true
      });
      
      const writerPrompt2 = await this.createPrompt({
        creatorId: user2.id,
        creatorRole: "writer",
        type: "text",
        content: "\"De robot had 257 jaar in de verlaten bibliotheek gezeten, boeken lezend en verzorgend. Nu was er voor het eerst een mens binnengekomen, een kind met grote ogen, dat verbaasd tussen de eindeloze boekenrijen stond. De robot deed wat hij altijd deed: hij reikte naar de plank en koos het perfecte boek uit voor zijn nieuwe bezoeker...\"",
        isActive: false,
        isDaily: false
      });
      
      // Create sketcher prompts
      const sketcherPrompt1 = await this.createPrompt({
        creatorId: user3.id,
        creatorRole: "sketcher",
        type: "image",
        content: "https://images.unsplash.com/photo-1618331835717-801e976710b2",
        isActive: true,
        isDaily: true
      });
      
      const sketcherPrompt2 = await this.createPrompt({
        creatorId: user4.id,
        creatorRole: "sketcher",
        type: "image",
        content: "https://images.unsplash.com/photo-1613312968134-3fd240c3c9ad",
        isActive: true,
        isDaily: false
      });
      
      // Set some likes and comments on prompts
      await db
        .update(prompts)
        .set({
          likes: 218,
          comments: 87
        })
        .where(eq(prompts.id, writerPrompt1.id));
      
      await db
        .update(prompts)
        .set({
          likes: 183,
          comments: 73
        })
        .where(eq(prompts.id, writerPrompt2.id));
      
      await db
        .update(prompts)
        .set({
          likes: 218,
          comments: 87
        })
        .where(eq(prompts.id, sketcherPrompt1.id));
      
      await db
        .update(prompts)
        .set({
          likes: 183,
          comments: 73
        })
        .where(eq(prompts.id, sketcherPrompt2.id));
      
      // Create submissions
      await this.createSubmission({
        promptId: sketcherPrompt2.id,
        userId: user5.id,
        type: "text",
        content: "\"Model RK-7 was niet ontworpen om te dromen. Toch zag hij de vlinders elke nacht in zijn stand-bymodus. Ze dansten door zijn geheugencircuits, brachten kleur waar alleen binaire code hoorde te zijn. Toen hij er eentje in het park tegenkwam, bevroor zijn systeem voor precies 2,7 seconden. Zijn metallische hand reikte voorzichtig uit, maar de vlinder was al weer weg. In zijn logboek noteerde hij: 'Vandaag leerde ik wat verlangen is.'\""
      });
      
      await this.createSubmission({
        promptId: writerPrompt1.id,
        userId: user3.id,
        type: "image",
        content: "https://images.unsplash.com/photo-1582985412748-cf5339357e77"
      });
    }
  }
}

// Initialize the database storage
export const storage = new DatabaseStorage();

// Initialize the database with sample data
(async () => {
  try {
    await (storage as DatabaseStorage).initializeDatabase();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();
