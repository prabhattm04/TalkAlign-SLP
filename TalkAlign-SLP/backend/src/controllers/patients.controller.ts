import { Request, Response } from "express";
import { sendSuccess, sendError } from "../lib/apiResponse";
import { CreatePatientInput, UpdatePatientInput } from "../schemas/patient.schema";

export async function getPatients(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess(data));
}

export async function getPatient(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("patients")
    .select("*, sessions(count)")
    .eq("id", id)
    .single();

  if (error) {
    res.status(404).json(sendError("Patient not found"));
    return;
  }

  res.status(200).json(sendSuccess(data));
}

export async function createPatient(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const input = req.body as CreatePatientInput;

  // Generate a random ID e.g. PAT-A1B2C3
  const crypto = require("crypto");
  const randomChars = crypto.randomBytes(3).toString("hex").toUpperCase();
  const patient_id = `PAT-${randomChars}`;

  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...input,
      patient_id,
      doctor_id: req.user!.id,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(201).json(sendSuccess(data));
}

export async function updatePatient(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;
  const input = req.body as UpdatePatientInput;

  const { data, error } = await supabase
    .from("patients")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess(data));
}

export async function deletePatient(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;

  // Ownership check — if this patient doesn't belong to the requesting doctor,
  // the SELECT returns nothing (RLS: doctor_id = auth.uid()) and we return 404.
  const { data: patient, error: findError } = await supabase
    .from("patients")
    .select("id, name")
    .eq("id", id)
    .single();

  if (findError || !patient) {
    res.status(404).json(sendError("Patient not found or access denied"));
    return;
  }

  // Collect session IDs so we can cascade-delete child records first.
  const { data: sessionRows } = await supabase
    .from("sessions")
    .select("id")
    .eq("patient_id", id);

  if (sessionRows && sessionRows.length > 0) {
    const sessionIds = sessionRows.map((s) => s.id);

    const { error: tasksError } = await supabase
      .from("home_practice_tasks")
      .delete()
      .in("session_id", sessionIds);

    if (tasksError) {
      res.status(500).json(sendError("Failed to delete practice tasks: " + tasksError.message));
      return;
    }
  }

  const { error: sessionsError } = await supabase
    .from("sessions")
    .delete()
    .eq("patient_id", id);

  if (sessionsError) {
    res.status(500).json(sendError("Failed to delete sessions: " + sessionsError.message));
    return;
  }

  // Hard-delete the patient row (RLS DELETE policy: doctor_id = auth.uid())
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id);

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess({ message: `Patient "${patient.name}" permanently deleted` }));
}
