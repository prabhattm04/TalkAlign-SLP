import { SupabaseClient } from "@supabase/supabase-js";

export async function cascadeDeletePatient(supabase: SupabaseClient, patientId: string) {
  // Collect session IDs so we can cascade-delete child records first.
  const { data: sessionRows } = await supabase
    .from("sessions")
    .select("id")
    .eq("patient_id", patientId);

  if (sessionRows && sessionRows.length > 0) {
    const sessionIds = sessionRows.map((s) => s.id);

    const { error: tasksError } = await supabase
      .from("home_practice_tasks")
      .delete()
      .in("session_id", sessionIds);

    if (tasksError) {
      throw new Error("Failed to delete practice tasks: " + tasksError.message);
    }
  }

  const { error: sessionsError } = await supabase
    .from("sessions")
    .delete()
    .eq("patient_id", patientId);

  if (sessionsError) {
    throw new Error("Failed to delete sessions: " + sessionsError.message);
  }

  // Delete goals
  const { error: goalsError } = await supabase
    .from("goals")
    .delete()
    .eq("patient_id", patientId);

  if (goalsError) {
    throw new Error("Failed to delete goals: " + goalsError.message);
  }

  // Hard-delete the patient row (RLS DELETE policy: doctor_id = auth.uid())
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", patientId);

  if (error) {
    throw new Error(error.message);
  }
}
