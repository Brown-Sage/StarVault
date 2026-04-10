import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User";

// ─── Helper ─────────────────────────────────────────────────────────────────

const getValidatedUser = async (userId: string | undefined, res: Response) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(401).json({ message: "Not authorized" });
        return null;
    }
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return null;
    }
    return user;
};

// ─── GET /api/user/profile ───────────────────────────────────────────────────

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await getValidatedUser(req.user, res);
        if (!user) return;

        const memberSince = user._id
            ? new Date((user._id as mongoose.Types.ObjectId).getTimestamp()).toISOString()
            : null;

        res.json({
            _id: user._id,
            email: user.email,
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            accentColor: user.accentColor,
            memberSince,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile", error: err });
    }
};

// ─── PATCH /api/user/profile ─────────────────────────────────────────────────

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = await getValidatedUser(req.user, res);
        if (!user) return;

        const { displayName, bio, avatarUrl, accentColor } = req.body;

        const validAccentColors = ['indigo', 'violet', 'emerald', 'rose', 'amber'];

        if (displayName !== undefined) user.displayName = String(displayName).slice(0, 50);
        if (bio !== undefined) user.bio = String(bio).slice(0, 300);
        if (avatarUrl !== undefined) user.avatarUrl = String(avatarUrl).slice(0, 500);
        if (accentColor !== undefined && validAccentColors.includes(accentColor)) {
            user.accentColor = accentColor;
        }

        await user.save();

        res.json({
            message: "Profile updated",
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            accentColor: user.accentColor,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile", error: err });
    }
};

// ─── PATCH /api/user/password ─────────────────────────────────────────────────

export const updatePassword = async (req: Request, res: Response) => {
    try {
        const user = await getValidatedUser(req.user, res);
        if (!user) return;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }

        const passwordMatches = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!strongPassword.test(newPassword)) {
            return res.status(400).json({
                message: "New password must be at least 8 characters with an uppercase letter, lowercase letter, and number.",
            });
        }

        user.password = newPassword; // pre-save hook hashes it
        // Invalidate all sessions on password change
        user.set('sessions', []);
        await user.save();

        res.json({ message: "Password updated successfully. Please log in again." });
    } catch (err) {
        res.status(500).json({ message: "Failed to update password", error: err });
    }
};

// ─── GET /api/user/sessions ───────────────────────────────────────────────────

export const getActiveSessions = async (req: Request, res: Response) => {
    try {
        const user = await getValidatedUser(req.user, res);
        if (!user) return;

        // Return sessions without the actual token value for security
        const sessions = user.sessions.map((s) => ({
            _id: s._id,
            device: s.device,
            ip: s.ip,
            lastActive: s.lastActive,
        }));

        res.json({ sessions });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch sessions", error: err });
    }
};

// ─── DELETE /api/user/sessions ───────────────────────────────────────────────

export const logoutAllSessions = async (req: Request, res: Response) => {
    try {
        const user = await getValidatedUser(req.user, res);
        if (!user) return;

        // Get the current token from the Authorization header to keep it
        const currentToken = req.headers.authorization?.split(" ")[1];

        // Remove all sessions except the current one
        user.set('sessions', user.sessions.filter((s) => s.token === currentToken));
        await user.save();

        res.json({ message: "All other sessions have been logged out" });
    } catch (err) {
        res.status(500).json({ message: "Failed to logout sessions", error: err });
    }
};
