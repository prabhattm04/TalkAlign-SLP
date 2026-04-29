import { Request, Response } from "express";
import { sendSuccess, sendError } from "../lib/apiResponse";
import { CreateSessionInput, SaveSoapInput, AssignTasksInput } from "../schemas/session.schema";

export async function getSessions(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const patientId = req.query.patientId as string | undefined;

  let query = supabase
    .from("sessions")
    .select("*, patient:patients(name)")
    .order("date", { ascending: false });

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

export async function getSession(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("sessions")
    .select("*, home_practice_tasks(*), patient:patients(name)")
    .eq("id", id)
    .single();

  if (error) {
    res.status(404).json(sendError("Session not found"));
    return;
  }

  res.status(200).json(sendSuccess(data));
}

export async function createSession(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const input = req.body as CreateSessionInput;

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      patient_id: input.patient_id,
      date: input.date,
      summary: input.summary,
      therapist_id: req.user!.id,
      status: "in_progress",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(201).json(sendSuccess(data));
}

export async function saveSoap(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;
  const { soap } = req.body as SaveSoapInput;

  const { data, error } = await supabase
    .from("sessions")
    .update({
      soap_subjective: soap.subjective,
      soap_objective: soap.objective,
      soap_assessment: soap.assessment,
      soap_plan: soap.plan,
      status: "completed",
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

export async function assignTasks(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;
  const { tasks } = req.body as AssignTasksInput;

  const insertData = tasks.map(task => ({
    session_id: id,
    title: task.title,
  }));

  const { data, error } = await supabase
    .from("home_practice_tasks")
    .insert(insertData)
    .select();

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(201).json(sendSuccess(data));
}
