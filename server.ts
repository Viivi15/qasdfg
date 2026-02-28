import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// Load env vars
dotenv.config();

import { connectDB } from "./server/config/db.js";
import { startScheduler } from "./server/utils/scheduler.js";
import { dbCheck } from "./server/middleware/dbCheck.js";

import authRoutes from "./server/routes/auth.routes.js";
import productRoutes from "./server/routes/product.routes.js";
import uploadRoutes from "./server/routes/upload.routes.js";
import notificationRoutes from "./server/routes/notification.routes.js";
import assistantRoutes from "./server/routes/assistant.routes.js";
import serviceRoutes from "./server/routes/service.routes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect DB
  await connectDB();
  
  // Start Cron
  startScheduler();

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for dev/preview to allow scripts/images
  }));
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  // API Routes
  app.use("/api", dbCheck); // Apply DB check to all API routes
  app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 30 }), authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/assistant", assistantRoutes);
  app.use("/api/service", serviceRoutes);

  // Serve Uploads
  const uploadDir = path.resolve("uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadDir));

  // Vite Middleware (for serving frontend)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving (if we built it)
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

startServer();
