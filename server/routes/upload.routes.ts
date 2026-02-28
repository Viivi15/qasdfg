import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post("/invoice", auth, upload.single("file"), async (req: any, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

export default router;
