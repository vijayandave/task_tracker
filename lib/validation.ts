import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  dueDate: z.string().datetime().optional(),
  recurring: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).default("NONE"),
  recurrenceEndDate: z.string().datetime().optional(),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
