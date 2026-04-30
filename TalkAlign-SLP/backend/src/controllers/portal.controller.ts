import { Request, Response } from "express";
import { sendSuccess, sendError } from "../lib/apiResponse";

// ---------------------------------------------------------------------------
// GET /api/v1/portal/me
// Fetch parent profile and associated patients
// ---------------------------------------------------------------------------
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const supabase = (req as any).supabase;

    // Get caregiver profile
    const { data: caregiver, error: caregiverError } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", req.user!.id)
      .single();

    if (caregiverError || !caregiver) {
      res.status(404).json(sendError("Caregiver profile not found"));
      return;
    }

    // Get patients linked to this caregiver
    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select("id, name, age, condition, gender")
      .eq("caregiver_id", req.user!.id)
      .eq("status", "active");

    if (patientsError) {
      res.status(500).json(sendError("Failed to fetch patients"));
      return;
    }

    res.status(200).json(sendSuccess({ caregiver, patients }));
  } catch (err: any) {
    res.status(500).json(sendError("Internal server error"));
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/portal/sessions
// Fetch completed sessions for caregiver's patients
// ---------------------------------------------------------------------------
export async function getPortalSessions(req: Request, res: Response): Promise<void> {
  try {
    const supabase = (req as any).supabase;

    // We only fetch sessions where patient's caregiver_id matches the user's ID.
    // Also, only return safe fields and home practice tasks.
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select(`
        id,
        date,
        duration,
        status,
        ai_parent_summary,
        summary,
        patients!inner ( id, name, caregiver_id ),
        profiles ( name ),
        home_practice_tasks ( id, title, completed, completed_at )
      `)
      .eq("status", "completed")
      .eq("patients.caregiver_id", req.user!.id)
      .order("date", { ascending: false });

    if (error) {
      res.status(500).json(sendError("Failed to fetch sessions"));
      return;
    }

    // Map output to match frontend expectations
    const formattedSessions = sessions.map((session: any) => ({
      id: session.id,
      date: session.date,
      duration: session.duration,
      status: session.status,
      aiParentSummary: session.ai_parent_summary,
      summary: session.summary, // Fallback if AI summary not ready
      patientId: session.patients.id,
      patientName: session.patients.name,
      therapist: session.profiles?.name,
      homePractice: session.home_practice_tasks,
    }));

    res.status(200).json(sendSuccess(formattedSessions));
  } catch (err: any) {
    res.status(500).json(sendError("Internal server error"));
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/portal/tasks/:taskId/complete
// ---------------------------------------------------------------------------
export async function completeTask(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;
    const supabase = (req as any).supabase;

    // Ensure the task belongs to a session for a patient the parent manages
    // First, verify access
    const { data: taskDetails, error: checkError } = await supabase
      .from("home_practice_tasks")
      .select(`
        id,
        sessions!inner (
          patients!inner ( caregiver_id )
        )
      `)
      .eq("id", taskId)
      .single();

    if (checkError || !taskDetails) {
      res.status(404).json(sendError("Task not found"));
      return;
    }

    if (taskDetails.sessions.patients.caregiver_id !== req.user!.id) {
      res.status(403).json(sendError("Not authorized to modify this task"));
      return;
    }

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from("home_practice_tasks")
      .update({
        completed: Boolean(completed),
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq("id", taskId)
      .select()
      .single();

    if (updateError) {
      res.status(500).json(sendError("Failed to update task"));
      return;
    }

    res.status(200).json(sendSuccess(updatedTask));
  } catch (err: any) {
    res.status(500).json(sendError("Internal server error"));
  }
}
