import { Router } from "express";
import {
    getProfile,
    updateProfile,
    updatePassword,
    getActiveSessions,
    logoutAllSessions,
    getPreferences,
    savePreferences,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect); // All user routes require authentication

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/password", updatePassword);
router.get("/sessions", getActiveSessions);
router.delete("/sessions", logoutAllSessions);
router.get("/preferences", getPreferences);
router.post("/preferences", savePreferences);

export default router;
