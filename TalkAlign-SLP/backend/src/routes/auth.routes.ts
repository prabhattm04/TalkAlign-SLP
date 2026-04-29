import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), register);

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), login);

// POST /api/v1/auth/logout
router.post("/logout", authenticate, logout);

export default router;
