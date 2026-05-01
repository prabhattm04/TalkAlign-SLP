import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { getMe, getPortalSessions, getPortalGoals, completeTask } from "../controllers/portal.controller";

const router = Router();

// All portal routes require authentication and the 'parent' role
router.use(authenticate, requireRole("parent"));

router.get("/me", getMe);
router.get("/sessions", getPortalSessions);
router.get("/goals", getPortalGoals);
router.patch("/tasks/:taskId/complete", completeTask);

export default router;
