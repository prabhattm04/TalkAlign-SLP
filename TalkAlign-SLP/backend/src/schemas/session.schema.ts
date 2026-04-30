import { z } from "zod";

export const createSessionSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  date: z.string().datetime().optional().default(() => new Date().toISOString()),
  summary: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "draft"]).optional()
});

export const saveSoapSchema = z.object({
  soap: z.object({
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional()
  })
});

export const endSessionSchema = z.object({
  end_time: z.string().datetime(),
  duration: z.number().int().nonnegative()
});

export const assignTasksSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(1, "Task title is required")
    })
  ).min(1, "At least one task is required")
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SaveSoapInput = z.infer<typeof saveSoapSchema>;
export type AssignTasksInput = z.infer<typeof assignTasksSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
