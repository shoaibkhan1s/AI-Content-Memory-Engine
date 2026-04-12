import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createContentSchema = z.object({
  type: z.enum(["youtube", "instagram", "link", "note", "idea", "snippet"]),
  sourceUrl: z.string().url().optional(),
  rawContent: z.string().min(1).max(10000),
  title: z.string().max(200).optional(),
  manualNote: z.string().max(2000).optional(),
});

export const updateContentSchema = z.object({
  title: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).max(20).optional(),
  manualNote: z.string().max(2000).optional(),
  isPinned: z.boolean().optional(),
  status: z.enum(["active", "archived", "deleted"]).optional(),
});

export const reviewSchema = z.object({
  result: z.enum(["easy", "good", "hard", "forgot"]),
});
