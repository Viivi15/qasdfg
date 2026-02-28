import express from "express";
import { SERVICE_DIRECTORY } from "../config/serviceDirectory.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:brand", auth, (req, res) => {
  const brand = req.params.brand;
  const info = SERVICE_DIRECTORY[brand] || null;
  res.json({ brand, info });
});

export default router;
