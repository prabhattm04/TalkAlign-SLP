import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getSessions,
  getSession,
  createSession,
  saveSoap,
  assignTasks,
} from "../controllers/sessions.controller";
import { createSessionSchema, saveSoapSchema, assignTasksSchema } from "../schemas/session.schema";

const router = Router();

// All session routes require authentication and the 'doctor' role
router.use(authenticate, requireRole("doctor"));

router.get("/", getSessions);
router.get("/:id", getSession);
router.post("/", validate(createSessionSchema, "body"), createSession);
router.post("/:id/soap", validate(saveSoapSchema, "body"), saveSoap);
router.post("/:id/home-practice", validate(assignTasksSchema, "body"), assignTasks);

export default router;
