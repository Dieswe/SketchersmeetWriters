import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, insertLikeSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { MOCK_WRITER_PROMPTS, MOCK_SKETCHER_PROMPTS, MOCK_COLLABORATIONS, MOCK_POPULAR_PROMPTS, MOCK_SUBMISSIONS } from "../client/src/lib/constants";

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
  const formatPrompt = async (prompt: any) => {
    const creator = await storage.getUser(prompt.creatorId);
    return {
      id: prompt.id.toString(),
      creator: {
        id: creator?.id.toString() || "",
        name: creator?.name || "",
        avatar: creator?.avatar || "",
      },
      creatorRole: prompt.creatorRole,
      type: prompt.type,
      content: prompt.content,
      isActive: prompt.isActive,
      contributionsCount: (await storage.getSubmissionsByPromptId(prompt.id)).length,
      commentsCount: prompt.comments,
      likes: prompt.likes,
      comments: prompt.comments,
    };
  };

  // Format submission for API response
  const formatSubmission = async (submission: any, userId?: number) => {
    const creator = submission.userId ? await storage.getUser(submission.userId) : null;
    const isLiked = userId && await storage.getLike(userId, submission.id) !== undefined;
    
    return {
      id: submission.id.toString(),
      promptId: submission.promptId.toString(),
      creator: {
        id: creator?.id.toString() || "anonymous",
        name: creator?.name || "Anonymous",
        avatar: creator?.avatar || "",
      },
      type: submission.type,
      content: submission.content,
      likes: submission.likes,
      comments: submission.comments,
      isLiked: isLiked || false,
      timeAgo: formatTimeAgo(submission.createdAt),
    };
  };

  // GET writer prompts
  router.get("/prompts", async (req: Request, res: Response) => {
    try {
      if (!req.query.role) {
        return res.status(400).json({ message: "Type parameter must be 'writer' or 'sketcher'" });
      }
      
      const role = req.query.role as string;
      
      // Validate role parameter
      if (role !== 'writer' && role !== 'sketcher') {
        return res.status(400).json({ message: "Type parameter must be 'writer' or 'sketcher'" });
      }
      
      // Get prompts from database based on role
      const prompts = await storage.getPromptsByCreatorRole(role);
      const formattedPrompts = await Promise.all(prompts.map(formatPrompt));
      res.json(formattedPrompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Error fetching prompts" });
    }
  });

  // GET popular prompts
  router.get("/prompts/popular", async (req: Request, res: Response) => {
    try {
      // Use mock data for now
      res.json(MOCK_POPULAR_PROMPTS);
      
      // For a real implementation:
      // const prompts = await storage.getPopularPrompts(6);
      // const formattedPrompts = await Promise.all(prompts.map(formatPrompt));
      // res.json(formattedPrompts);
    } catch (error) {
      console.error("Error fetching popular prompts:", error);
      res.status(500).json({ message: "Error fetching popular prompts" });
    }
  });

  // GET single prompt
  router.get("/prompts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Use mock data for now
      const mockPrompt = [...MOCK_WRITER_PROMPTS, ...MOCK_SKETCHER_PROMPTS].find(p => p.id === req.params.id);
      if (mockPrompt) {
        res.json(mockPrompt);
      } else {
        res.status(404).json({ message: "Prompt not found" });
      }
      
      // For a real implementation:
      // const prompt = await storage.getPrompt(id);
      // if (!prompt) {
      //   return res.status(404).json({ message: "Prompt not found" });
      // }
      // const formattedPrompt = await formatPrompt(prompt);
      // res.json(formattedPrompt);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      res.status(500).json({ message: "Error fetching prompt" });
    }
  });

  // GET submissions for a prompt
  router.get("/prompts/:id/submissions", async (req: Request, res: Response) => {
    try {
      const promptId = parseInt(req.params.id);
      
      // Use mock data for now
      res.json(MOCK_SUBMISSIONS);
      
      // For a real implementation:
      // const submissions = await storage.getSubmissionsByPromptId(promptId);
      // const userId = req.session?.userId; // If using sessions
      // const formattedSubmissions = await Promise.all(
      //   submissions.map(sub => formatSubmission(sub, userId))
      // );
      // res.json(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Error fetching submissions" });
    }
  });

  // GET collaborations
  router.get("/collaborations", async (req: Request, res: Response) => {
    try {
      // Use mock data for now
      res.json(MOCK_COLLABORATIONS);
      
      // For a real implementation, this would fetch real collaborations
      // from storage and format them appropriately
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
      const submissionId = parseInt(req.params.id);
      const userId = 1; // For now, use a fixed user ID (guest user)
      // const userId = req.session?.userId; // If using sessions
      
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

  // POST comment on submission
  router.post("/submissions/:id/comments", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const userId = 1; // For now, use a fixed user ID (guest user)
      // const userId = req.session?.userId; // If using sessions
      
      const validatedData = insertCommentSchema.parse({
        submissionId,
        userId,
        content: req.body.content
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json({
        id: comment.id,
        content: comment.content,
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
