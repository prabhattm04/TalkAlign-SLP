import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().min(0, "Age must be a positive integer").max(150),
  gender: z.string().min(1, "Gender is required"),
  condition: z.string().min(1, "Condition is required"),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  caregiver_id: z.string().uuid().nullable().optional(),
  caregiver_name: z.string().optional(),
  caregiver_phone: z.string().min(1, "Phone number is required").regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  caregiver_email: z.string().email("Invalid email")
});

export const updatePatientSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  age: z.number().int().min(0, "Age must be a positive integer").max(150).optional(),
  gender: z.string().min(1, "Gender is required").optional(),
  condition: z.string().min(1, "Condition is required").optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "discharged", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
  caregiver_id: z.string().uuid().nullable().optional(),
  caregiver_name: z.string().optional(),
  caregiver_phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format").optional(),
  caregiver_email: z.string().email("Invalid email").optional()
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
