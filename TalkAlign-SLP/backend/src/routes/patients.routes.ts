import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patients.controller";
import { createPatientSchema, updatePatientSchema } from "../schemas/patient.schema";

const router = Router();

// All patient routes require authentication and the 'doctor' role
router.use(authenticate, requireRole("doctor"));

router.get("/", getPatients);
router.get("/:id", getPatient);
router.post("/", validate(createPatientSchema, "body"), createPatient);
router.patch("/:id", validate(updatePatientSchema, "body"), updatePatient);
router.delete("/:id", deletePatient);

export default router;
