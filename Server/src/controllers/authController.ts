import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!strongPassword.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ email, password });

        res.status(201).json({
            message: "User registered",
            userId: user._id,
        });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: "JWT secret is not configured" });
        }

        const token = jwt.sign({ userId: user._id.toString() }, jwtSecret, {
            expiresIn: "7d",
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user", error: err });
    }
};
