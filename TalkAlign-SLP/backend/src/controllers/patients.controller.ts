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

  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...input,
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

  const { data, error } = await supabase
    .from("patients")
    .update({ status: "discharged" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json(sendError(error.message));
    return;
  }

  res.status(200).json(sendSuccess(data));
}
