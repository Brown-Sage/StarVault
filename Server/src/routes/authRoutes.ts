import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // max 10 attempts per window
    message: { message: "Too many login attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, getMe);

export default router;