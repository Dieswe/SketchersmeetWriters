import {
  users, User, InsertUser,
  prompts, Prompt, InsertPrompt,
  submissions, Submission, InsertSubmission,
  comments, Comment, InsertComment,
  likes, Like, InsertLike
} from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt methods
  getPrompt(id: number): Promise<Prompt | undefined>;
  getPromptsByCreatorRole(role: string): Promise<Prompt[]>;
  getPopularPrompts(limit: number): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  
  // Submission methods
  getSubmission(id: number): Promise<Submission | undefined>;
  getSubmissionsByPromptId(promptId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Comment methods
  getCommentsBySubmissionId(submissionId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Like methods
  getLike(userId: number, submissionId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, submissionId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private userMap: Map<number, User>;
  private promptMap: Map<number, Prompt>;
  private submissionMap: Map<number, Submission>;
  private commentMap: Map<number, Comment>;
  private likeMap: Map<number, Like>;
  
  private userCurrentId: number;
  private promptCurrentId: number;
  private submissionCurrentId: number;
  private commentCurrentId: number;
  private likeCurrentId: number;

  constructor() {
    this.userMap = new Map();
    this.promptMap = new Map();
    this.submissionMap = new Map();
    this.commentMap = new Map();
    this.likeMap = new Map();
    
    this.userCurrentId = 1;
    this.promptCurrentId = 1;
    this.submissionCurrentId = 1;
    this.commentCurrentId = 1;
    this.likeCurrentId = 1;
    
    // Initialize with some example data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.userMap.set(id, user);
    return user;
  }
  
  // Prompt methods
  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.promptMap.get(id);
  }
  
  async getPromptsByCreatorRole(role: string): Promise<Prompt[]> {
    // This returns prompts that writers/sketchers can respond to
    // So for writer role, we show sketcher prompts and vice versa
    const oppositeRole = role === "writer" ? "sketcher" : "writer";
    return Array.from(this.promptMap.values())
      .filter(prompt => prompt.creatorRole === oppositeRole)
      .sort((a, b) => {
        // Sort with daily prompts first, then by creation date
        if (a.isDaily && !b.isDaily) return -1;
        if (!a.isDaily && b.isDaily) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }
  
  async getPopularPrompts(limit: number): Promise<Prompt[]> {
    return Array.from(this.promptMap.values())
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
  }
  
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptCurrentId++;
    const now = new Date();
    const prompt: Prompt = { ...insertPrompt, id, createdAt: now };
    this.promptMap.set(id, prompt);
    return prompt;
  }
  
  // Submission methods
  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissionMap.get(id);
  }
  
  async getSubmissionsByPromptId(promptId: number): Promise<Submission[]> {
    return Array.from(this.submissionMap.values())
      .filter(submission => submission.promptId === promptId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.submissionCurrentId++;
    const now = new Date();
    const submission: Submission = { ...insertSubmission, id, likes: 0, comments: 0, createdAt: now };
    this.submissionMap.set(id, submission);
    
    // Update prompt statistics
    const prompt = await this.getPrompt(insertSubmission.promptId);
    if (prompt) {
      const updatedPrompt = { ...prompt };
      this.promptMap.set(prompt.id, updatedPrompt);
    }
    
    return submission;
  }
  
  // Comment methods
  async getCommentsBySubmissionId(submissionId: number): Promise<Comment[]> {
    return Array.from(this.commentMap.values())
      .filter(comment => comment.submissionId === submissionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentCurrentId++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.commentMap.set(id, comment);
    
    // Update submission comment count
    const submission = await this.getSubmission(insertComment.submissionId);
    if (submission) {
      const updatedSubmission = { ...submission, comments: submission.comments + 1 };
      this.submissionMap.set(submission.id, updatedSubmission);
    }
    
    return comment;
  }
  
  // Like methods
  async getLike(userId: number, submissionId: number): Promise<Like | undefined> {
    return Array.from(this.likeMap.values()).find(
      like => like.userId === userId && like.submissionId === submissionId
    );
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.likeCurrentId++;
    const now = new Date();
    const like: Like = { ...insertLike, id, createdAt: now };
    this.likeMap.set(id, like);
    
    // Update submission like count
    const submission = await this.getSubmission(insertLike.submissionId);
    if (submission) {
      const updatedSubmission = { ...submission, likes: submission.likes + 1 };
      this.submissionMap.set(submission.id, updatedSubmission);
    }
    
    return like;
  }
  
  async deleteLike(userId: number, submissionId: number): Promise<void> {
    const like = await this.getLike(userId, submissionId);
    if (like) {
      this.likeMap.delete(like.id);
      
      // Update submission like count
      const submission = await this.getSubmission(submissionId);
      if (submission) {
        const updatedSubmission = { ...submission, likes: Math.max(0, submission.likes - 1) };
        this.submissionMap.set(submission.id, updatedSubmission);
      }
    }
  }
  
  // Helper method to initialize example data
  private async initializeData() {
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
      isDaily: true,
      likes: 218,
      comments: 87
    });
    
    const writerPrompt2 = await this.createPrompt({
      creatorId: user2.id,
      creatorRole: "writer",
      type: "text",
      content: "\"De robot had 257 jaar in de verlaten bibliotheek gezeten, boeken lezend en verzorgend. Nu was er voor het eerst een mens binnengekomen, een kind met grote ogen, dat verbaasd tussen de eindeloze boekenrijen stond. De robot deed wat hij altijd deed: hij reikte naar de plank en koos het perfecte boek uit voor zijn nieuwe bezoeker...\"",
      isActive: false,
      isDaily: false,
      likes: 183,
      comments: 73
    });
    
    // Create sketcher prompts
    const sketcherPrompt1 = await this.createPrompt({
      creatorId: user3.id,
      creatorRole: "sketcher",
      type: "image",
      content: "https://images.unsplash.com/photo-1618331835717-801e976710b2",
      isActive: true,
      isDaily: true,
      likes: 218,
      comments: 87
    });
    
    const sketcherPrompt2 = await this.createPrompt({
      creatorId: user4.id,
      creatorRole: "sketcher",
      type: "image",
      content: "https://images.unsplash.com/photo-1613312968134-3fd240c3c9ad",
      isActive: true,
      isDaily: false,
      likes: 183,
      comments: 73
    });
    
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

export const storage = new MemStorage();
