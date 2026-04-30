import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  suggestGoalsHandler
} from "../controllers/goals.controller";
import { createGoalSchema, updateGoalSchema, suggestGoalsSchema } from "../schemas/goal.schema";

const router = Router();

// Require authentication and doctor role
router.use(authenticate, requireRole("doctor"));

router.get("/", getGoals);
router.post("/", validate(createGoalSchema, "body"), createGoal);
router.patch("/:id", validate(updateGoalSchema, "body"), updateGoal);
router.delete("/:id", deleteGoal);
router.post("/suggest", validate(suggestGoalsSchema, "body"), suggestGoalsHandler);

export default router;
