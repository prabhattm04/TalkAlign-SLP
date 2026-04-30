import { z } from "zod";

export const createGoalSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["long_term", "short_term"]).default("short_term"),
  status: z.enum(["not_started", "in_progress", "achieved"]).default("not_started"),
  baseline: z.string().optional(),
  target: z.string().optional()
});

export const updateGoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  type: z.enum(["long_term", "short_term"]).optional(),
  status: z.enum(["not_started", "in_progress", "achieved"]).optional(),
  baseline: z.string().optional(),
  target: z.string().optional()
});

export const suggestGoalsSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID")
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type SuggestGoalsInput = z.infer<typeof suggestGoalsSchema>;
