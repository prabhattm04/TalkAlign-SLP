import { Request, Response } from "express";
import { sendSuccess, sendError } from "../lib/apiResponse";
import { CreateGoalInput, UpdateGoalInput, SuggestGoalsInput } from "../schemas/goal.schema";
import { suggestGoals } from "../services/ai.service";

export async function getGoals(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const patientId = req.query.patientId as string | undefined;

  let query = supabase.from("goals").select("*").order("created_at", { ascending: false });

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess(data));
}

export async function createGoal(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const input = req.body as CreateGoalInput;

  // RLS (Doctor Insert) automatically verifies ownership 
  // via `patient_id IN (SELECT id FROM patients WHERE doctor_id = auth.uid())`
  const { data, error } = await supabase
    .from("goals")
    .insert({
      patient_id: input.patient_id,
      title: input.title,
      type: input.type,
      status: input.status,
      baseline: input.baseline,
      target: input.target
    })
    .select()
    .single();

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(201).json(sendSuccess(data));
}

export async function updateGoal(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;
  const input = req.body as UpdateGoalInput;

  const { data, error } = await supabase
    .from("goals")
    .update({
      title: input.title,
      type: input.type,
      status: input.status,
      baseline: input.baseline,
      target: input.target,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess(data));
}

export async function deleteGoal(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id);

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess({ message: "Goal deleted successfully" }));
}

export async function suggestGoalsHandler(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const input = req.body as SuggestGoalsInput;

  // Fetch patient to make sure doctor owns patient
  const { data: patient, error: patientErr } = await supabase
    .from("patients")
    .select("name, age, condition")
    .eq("id", input.patient_id)
    .single();

  if (patientErr || !patient) {
    res.status(404).json(sendError("Patient not found"));
    return;
  }

  // Fetch past sessions to build context
  const { data: sessions, error: sessionsErr } = await supabase
    .from("sessions")
    .select("date, summary, soap_subjective, soap_objective, soap_assessment, soap_plan")
    .eq("patient_id", input.patient_id)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(5);

  if (sessionsErr) {
    res.status(500).json(sendError("Failed to fetch past sessions"));
    return;
  }

  let contextString = "No past sessions found. Suggest general goals based on condition.";
  if (sessions && sessions.length > 0) {
    contextString = sessions.map((s, i) => 
      `Session ${i + 1} (${new Date(s.date).toLocaleDateString()}):
       Summary: ${s.summary || 'N/A'}
       SOAP: 
       S: ${s.soap_subjective || 'N/A'}
       O: ${s.soap_objective || 'N/A'}
       A: ${s.soap_assessment || 'N/A'}
       P: ${s.soap_plan || 'N/A'}`
    ).join("\n\n");
  }

  try {
    const suggestions = await suggestGoals(patient, contextString);
    res.status(200).json(sendSuccess(suggestions));
  } catch (err: any) {
    res.status(500).json(sendError(err.message || "Failed to generate suggestions"));
  }
}
