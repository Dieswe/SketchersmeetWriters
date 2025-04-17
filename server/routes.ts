import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { prompts, submissions, insertSubmissionSchema, insertLikeSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { isValidUUID, createErrorResponse } from "./utils";

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
  const formatSubmission = async (submission: any, userId?: string) => {
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
        return res.status(400).json({ message: "Role parameter must be 'writer' or 'sketcher'" });
      }
      
      const role = req.query.role as string;
      
      // Validate role parameter
      if (role !== 'writer' && role !== 'sketcher') {
        return res.status(400).json({ message: "Role parameter must be 'writer' or 'sketcher'" });
      }
      
      // Get prompts from database based on role
      const prompts = await storage.getPromptsByCreatorRole(role);
      const formattedPrompts = await Promise.all(prompts.map(formatPrompt));
      
      // Add logging for debugging
      console.log(`Retrieved ${prompts.length} prompts for role: ${role}`);
      
      res.json(formattedPrompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Error fetching prompts" });
    }
  });

  // GET popular prompts
  router.get("/prompts/popular", async (req: Request, res: Response) => {
    try {
      // Get the 6 most popular prompts from database
      const prompts = await storage.getPopularPrompts(6);
      const formattedPrompts = await Promise.all(prompts.map(formatPrompt));
      
      // Add logging for debugging
      console.log(`Retrieved ${prompts.length} popular prompts`);
      
      res.json(formattedPrompts);
    } catch (error) {
      console.error("Error fetching popular prompts:", error);
      res.status(500).json({ message: "Error fetching popular prompts" });
    }
  });
  
  // GET daily prompts
  router.get("/prompts/daily", async (req: Request, res: Response) => {
    try {
      // Get all daily prompts from database
      const prompts = await storage.getDailyPrompts();
      const formattedPrompts = await Promise.all(prompts.map(formatPrompt));
      
      // Add logging for debugging
      console.log(`Retrieved ${prompts.length} daily prompts`);
      
      res.json(formattedPrompts);
    } catch (error) {
      console.error("Error fetching daily prompts:", error);
      res.status(500).json({ message: "Error fetching daily prompts" });
    }
  });

  // GET single prompt
  router.get("/prompts/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      // Validate UUID format
      if (!isValidUUID(id)) {
        return res.status(400).json(
          createErrorResponse("Invalid prompt ID format", 400)
        );
      }
      
      const prompt = await storage.getPrompt(id);
      if (!prompt) {
        return res.status(404).json(
          createErrorResponse("Prompt not found", 404)
        );
      }
      
      const formattedPrompt = await formatPrompt(prompt);
      res.json(formattedPrompt);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      res.status(500).json(
        createErrorResponse("Error fetching prompt", 500)
      );
    }
  });

  // GET submissions for a prompt
  router.get("/prompts/:id/submissions", async (req: Request, res: Response) => {
    try {
      const promptId = req.params.id;
      
      // Validate UUID format
      if (!isValidUUID(promptId)) {
        return res.status(400).json(
          createErrorResponse("Invalid prompt ID format", 400)
        );
      }
      
      const prompt = await storage.getPrompt(promptId);
      if (!prompt) {
        return res.status(404).json(
          createErrorResponse("Prompt not found", 404)
        );
      }
      
      const submissions = await storage.getSubmissionsByPromptId(promptId);
      const userId = "1"; // Mock user ID for now as string
      const formattedSubmissions = await Promise.all(
        submissions.map(sub => formatSubmission(sub, userId))
      );
      
      // Add logging for debugging
      console.log(`Retrieved ${submissions.length} submissions for prompt ID: ${promptId}`);
      
      res.json(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json(
        createErrorResponse("Error fetching submissions", 500)
      );
    }
  });

  // GET collaborations
  router.get("/collaborations", async (req: Request, res: Response) => {
    try {
      // Optional limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Validate limit
      if (isNaN(limit) || limit < 1 || limit > 20) {
        return res.status(400).json(
          createErrorResponse("Invalid limit parameter. Should be a number between 1 and 20.", 400)
        );
      }
      
      // Get all text prompts with image submissions and vice versa to form collaborations
      const textPrompts = await db
        .select()
        .from(prompts)
        .where(eq(prompts.type, 'text'))
        .limit(limit);
      
      const collaborations = [];
      
      // For each text prompt, find an image submission if available
      for (const prompt of textPrompts) {
        const [imageSubmission] = await db
          .select()
          .from(submissions)
          .where(
            and(
              eq(submissions.type, 'image'),
              eq(submissions.promptId, prompt.id)
            )
          )
          .limit(1);
          
        if (imageSubmission) {
          const promptCreator = await storage.getUser(prompt.creatorId);
          const submissionCreator = imageSubmission.userId 
            ? await storage.getUser(imageSubmission.userId)
            : null;
            
          collaborations.push({
            id: `collab-${prompt.id}-${imageSubmission.id}`,
            promptId: prompt.id.toString(),
            image: imageSubmission.content,
            imageAlt: "Afbeelding door gebruiker",
            text: prompt.content,
            collaborators: [
              promptCreator ? {
                id: promptCreator.id.toString(),
                name: promptCreator.name,
                avatar: promptCreator.avatar
              } : { id: "anonymous", name: "Anoniem", avatar: "" },
              submissionCreator ? {
                id: submissionCreator.id.toString(),
                name: submissionCreator.name,
                avatar: submissionCreator.avatar 
              } : { id: "anonymous", name: "Anoniem", avatar: "" }
            ]
          });
        }
      }
      
      // Add logging for debugging
      console.log(`Found ${collaborations.length} collaborations from ${textPrompts.length} text prompts`);
      
      // Always return actual collaborations, even if empty
      res.json(collaborations);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
      res.status(500).json(
        createErrorResponse("Error fetching collaborations", 500)
      );
    }
  });

  // POST create submission
  router.post("/submissions", async (req: Request, res: Response) => {
    try {
      // Validate required fields are present
      if (!req.body.promptId) {
        return res.status(400).json(
          createErrorResponse("promptId is required", 400)
        );
      }
      
      if (!req.body.type || !['text', 'image'].includes(req.body.type)) {
        return res.status(400).json(
          createErrorResponse("type must be either 'text' or 'image'", 400)
        );
      }
      
      if (!req.body.content || typeof req.body.content !== 'string' || req.body.content.trim() === '') {
        return res.status(400).json(
          createErrorResponse("content is required and must be a non-empty string", 400)
        );
      }

      // Validate promptId is a valid UUID
      if (!isValidUUID(req.body.promptId)) {
        return res.status(400).json(
          createErrorResponse("Invalid promptId format", 400)
        );
      }
      
      // Verify prompt exists
      const prompt = await storage.getPrompt(req.body.promptId);
      if (!prompt) {
        return res.status(404).json(
          createErrorResponse("Prompt not found", 404)
        );
      }
      
      // Assign user ID (will be from session in production)
      const userId = "1"; // For now, use a fixed user ID (guest user) as string
      
      const submissionData = {
        ...req.body,
        userId,
        content: req.body.content.trim()
      };
      
      // Validate using schema
      const validatedData = insertSubmissionSchema.parse(submissionData);
      const submission = await storage.createSubmission(validatedData);
      const formattedSubmission = await formatSubmission(submission);
      
      // Log successful submission
      console.log(`User ${userId} created a ${validatedData.type} submission for prompt ${validatedData.promptId}`);
      
      res.status(201).json(formattedSubmission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          createErrorResponse("Invalid submission data", 400, { 
            validation: error.errors.map(e => e.message) 
          })
        );
      }
      console.error("Error creating submission:", error);
      res.status(500).json(
        createErrorResponse("Error creating submission", 500)
      );
    }
  });

  // POST like submission
  router.post("/submissions/:id/like", async (req: Request, res: Response) => {
    try {
      const submissionId = req.params.id;
      
      // Validate UUID format
      if (!isValidUUID(submissionId)) {
        return res.status(400).json(
          createErrorResponse("Invalid submission ID format", 400)
        );
      }
      
      const userId = "1"; // For now, use a fixed user ID (guest user) as string
      // const userId = req.session?.userId; // If using sessions
      
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json(
          createErrorResponse("Submission not found", 404)
        );
      }
      
      // Validate liked parameter
      if (req.body.liked === undefined) {
        return res.status(400).json(
          createErrorResponse("Missing 'liked' parameter", 400)
        );
      }
      
      const liked = req.body.liked === true;
      const existingLike = await storage.getLike(userId, submissionId);
      
      if (liked && !existingLike) {
        await storage.createLike({ userId, submissionId });
        console.log(`User ${userId} liked submission ${submissionId}`);
      } else if (!liked && existingLike) {
        await storage.deleteLike(userId, submissionId);
        console.log(`User ${userId} unliked submission ${submissionId}`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking submission:", error);
      res.status(500).json(
        createErrorResponse("Error processing like action", 500)
      );
    }
  });

  // POST comment on submission
  router.post("/submissions/:id/comments", async (req: Request, res: Response) => {
    try {
      const submissionId = req.params.id;
      
      // Validate UUID format
      if (!isValidUUID(submissionId)) {
        return res.status(400).json(
          createErrorResponse("Invalid submission ID format", 400)
        );
      }
      
      // Check if submission exists
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json(
          createErrorResponse("Submission not found", 404)
        );
      }
      
      // Ensure content is provided
      if (!req.body.content || typeof req.body.content !== 'string' || req.body.content.trim() === '') {
        return res.status(400).json(
          createErrorResponse("Comment content is required", 400)
        );
      }
      
      const userId = "1"; // For now, use a fixed user ID (guest user) as string
      // const userId = req.session?.userId; // If using sessions
      
      // Validate against schema
      const validatedData = insertCommentSchema.parse({
        submissionId,
        userId,
        content: req.body.content.trim()
      });
      
      // Create comment in database
      const comment = await storage.createComment(validatedData);
      
      // Log successful comment creation
      console.log(`User ${userId} commented on submission ${submissionId}: "${validatedData.content.substring(0, 30)}${validatedData.content.length > 30 ? '...' : ''}"`);
      
      // Return formatted response
      res.status(201).json({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        timeAgo: formatTimeAgo(comment.createdAt)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          createErrorResponse("Invalid comment data", 400, { 
            validation: error.errors.map(e => e.message) 
          })
        );
      }
      console.error("Error creating comment:", error);
      res.status(500).json(
        createErrorResponse("Error creating comment", 500)
      );
    }
  });

  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
