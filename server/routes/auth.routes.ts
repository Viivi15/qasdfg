import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
