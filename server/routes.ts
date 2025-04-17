import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, insertLikeSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: nl
    });
  };

  // Format prompt for API response
  const formatPrompt = (prompt: any) => {
    return {
      id: prompt.id,
      creator: {
        id: "user-" + prompt.author,
        name: prompt.author === "anon" ? "Anoniem" : prompt.author,
        avatar: "",
      },
      creatorRole: prompt.type === "text" ? "writer" : "sketcher",
      type: prompt.type,
      content: prompt.content,
      isActive: prompt.isActive || false,
      contributionsCount: prompt.contributionsCount || 0,
      commentsCount: prompt.commentsCount || 0,
      likes: 0,
      comments: prompt.commentsCount || 0,
    };
  };

  // Format submission for API response
  const formatSubmission = async (submission: any, userId?: string) => {
    const isLiked = userId && await storage.getLike(userId, submission.id) !== undefined;
    
    return {
      id: submission.id,
      promptId: submission.promptId,
      creator: {
        id: "user-" + submission.author,
        name: submission.author === "anon" ? "Anoniem" : submission.author,
        avatar: "",
      },
      type: submission.type,
      content: submission.content,
      likes: submission.likes || 0,
      comments: submission.comments || 0,
      isLiked: isLiked || false,
      timeAgo: formatTimeAgo(submission.createdAt),
    };
  };

  // GET prompts by type
  router.get("/prompts", async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string;
      if (!type || (type !== "text" && type !== "image")) {
        return res.status(400).json({ message: "Type parameter must be 'text' or 'image'" });
      }
      
      const prompts = await storage.getPromptsByType(type);
      const formattedPrompts = prompts.map(formatPrompt);
      res.json(formattedPrompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Error fetching prompts" });
    }
  });

  // GET daily prompt
  router.get("/prompts/daily", async (req: Request, res: Response) => {
    try {
      const dailyPrompt = await storage.getDailyPrompt();
      if (!dailyPrompt) {
        return res.json(null);
      }
      res.json(formatPrompt(dailyPrompt));
    } catch (error) {
      console.error("Error fetching daily prompt:", error);
      res.status(500).json({ message: "Error fetching daily prompt" });
    }
  });

  // GET popular prompts
  router.get("/prompts/popular", async (req: Request, res: Response) => {
    try {
      const prompts = await storage.getPopularPrompts(6);
      const formattedPrompts = prompts.map(formatPrompt);
      res.json(formattedPrompts);
    } catch (error) {
      console.error("Error fetching popular prompts:", error);
      res.status(500).json({ message: "Error fetching popular prompts" });
    }
  });

  // GET single prompt
  router.get("/prompts/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const prompt = await storage.getPrompt(id);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(formatPrompt(prompt));
    } catch (error) {
      console.error("Error fetching prompt:", error);
      res.status(500).json({ message: "Error fetching prompt" });
    }
  });

  // GET submissions for a prompt
  router.get("/prompts/:id/submissions", async (req: Request, res: Response) => {
    try {
      const promptId = req.params.id;
      const submissions = await storage.getSubmissionsByPromptId(promptId);
      
      // Gebruik "anon" als gebruikers-ID voor anonieme gebruikers
      const userId = "anon";
      
      const formattedSubmissions = await Promise.all(
        submissions.map(sub => formatSubmission(sub, userId))
      );
      
      res.json(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Error fetching submissions" });
    }
  });

  // Voorlopig behouden we deze route met mock data
  router.get("/collaborations", async (req: Request, res: Response) => {
    try {
      // Simuleer collaborations door tekst en afbeelding te combineren
      const textSubmissions = await storage.getSubmissionsByType("text");
      const imageSubmissions = await storage.getSubmissionsByType("image");
      
      // Combineer ze tot collaborations (maximaal 5)
      const collaborations = [];
      const maxCount = Math.min(5, Math.min(textSubmissions.length, imageSubmissions.length));
      
      for (let i = 0; i < maxCount; i++) {
        collaborations.push({
          id: `collab-${i}`,
          promptId: textSubmissions[i].promptId, 
          image: imageSubmissions[i].content,
          imageAlt: "Afbeelding voor collaboratie",
          text: textSubmissions[i].content,
          collaborators: [
            {
              id: `user-${textSubmissions[i].author}`,
              name: textSubmissions[i].author === "anon" ? "Anoniem" : textSubmissions[i].author,
              avatar: ""
            },
            {
              id: `user-${imageSubmissions[i].author}`,
              name: imageSubmissions[i].author === "anon" ? "Anoniem" : imageSubmissions[i].author,
              avatar: ""
            }
          ]
        });
      }
      
      res.json(collaborations);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
      res.status(500).json({ message: "Error fetching collaborations" });
    }
  });

  // POST create submission
  router.post("/submissions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(validatedData);
      const formattedSubmission = await formatSubmission(submission);
      res.status(201).json(formattedSubmission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid submission data", 
          errors: error.errors 
        });
      }
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Error creating submission" });
    }
  });

  // POST like submission
  router.post("/submissions/:id/like", async (req: Request, res: Response) => {
    try {
      const submissionId = req.params.id;
      const userId = req.body.userId || "anon"; // Gebruik "anon" als er geen gebruikers-ID is
      
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const liked = req.body.liked === true;
      const existingLike = await storage.getLike(userId, submissionId);
      
      if (liked && !existingLike) {
        await storage.createLike({ userId, submissionId });
      } else if (!liked && existingLike) {
        await storage.deleteLike(userId, submissionId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking submission:", error);
      res.status(500).json({ message: "Error liking submission" });
    }
  });

  // POST comment on content (prompt or submission)
  router.post("/content/:type/:id/comment", async (req: Request, res: Response) => {
    try {
      const contentType = req.params.type; // "prompt" of "submission"
      const contentId = req.params.id;
      const userId = req.body.userId || "anon"; // Gebruik "anon" als er geen gebruikers-ID is
      
      if (contentType !== "prompt" && contentType !== "submission") {
        return res.status(400).json({ message: "Type must be 'prompt' or 'submission'" });
      }
      
      const validatedData = insertCommentSchema.parse({
        contentType,
        contentId,
        userId,
        text: req.body.text
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json({
        id: comment.id,
        userId: comment.userId,
        text: comment.text,
        createdAt: comment.createdAt,
        timeAgo: formatTimeAgo(comment.createdAt)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid comment data", 
          errors: error.errors 
        });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Error creating comment" });
    }
  });

  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
