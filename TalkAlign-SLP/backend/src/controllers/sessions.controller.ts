import { Request, Response } from "express";
import { sendSuccess, sendError } from "../lib/apiResponse";
import { CreateSessionInput, SaveSoapInput, AssignTasksInput, EndSessionInput } from "../schemas/session.schema";

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

  // Verify the patient exists and belongs to the requesting doctor.
  // req.supabase is user-scoped (RLS), so this query returns nothing for patients
  // owned by a different doctor.
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", input.patient_id)
    .single();

  if (!patient) {
    res.status(404).json(sendError("Patient not found or does not belong to you"));
    return;
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      patient_id: input.patient_id,
      date: input.date,
      summary: input.summary,
      therapist_id: req.user!.id,
      status: input.status || "in_progress",
      start_time: input.status === 'scheduled' ? null : new Date().toISOString()
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
      title: soap.title,
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

export async function endSession(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;
  const { end_time, duration } = req.body as EndSessionInput;

  const { data, error } = await supabase
    .from("sessions")
    .update({
      end_time,
      duration,
      status: "completed"
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

export async function deleteSession(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { id } = req.params;

  const { error: tasksError } = await supabase
    .from("home_practice_tasks")
    .delete()
    .eq("session_id", id);

  if (tasksError) {
    res.status(500).json(sendError("Failed to delete related tasks: " + tasksError.message));
    return;
  }

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess({ message: "Session deleted successfully" }));
}

export async function getAudioUrl(req: Request, res: Response): Promise<void> {
  const supabase = req.supabase!;
  const { createAdminClient } = require("../config/supabase");
  const admin = createAdminClient();
  const { id } = req.params;

  const { data: session, error } = await supabase
    .from("sessions")
    .select("audio_file_path")
    .eq("id", id)
    .single();

  if (error || !session || !session.audio_file_path) {
    res.status(404).json(sendError("Audio file not found"));
    return;
  }

  const { data: urlData, error: urlError } = await admin.storage
    .from("session-audio")
    .createSignedUrl(session.audio_file_path, 3600);

  if (urlError || !urlData) {
    res.status(500).json(sendError("Failed to generate audio URL"));
    return;
  }

  res.status(200).json(sendSuccess({ url: urlData.signedUrl }));
}
