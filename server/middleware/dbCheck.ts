import { Request, Response, NextFunction } from "express";
import { isDbConnected } from "../config/db.js";

export function dbCheck(req: Request, res: Response, next: NextFunction) {
  if (!isDbConnected) {
    // If we are in a development environment without a MONGO_URI, 
    // we might want to warn the user instead of hanging.
    if (!process.env.MONGO_URI) {
       res.status(503).json({ 
        message: "Database not configured. Please set MONGO_URI in your environment variables." 
      });
      return;
    }
    
    res.status(503).json({ 
      message: "Database connection failed. Please check your connection string." 
    });
    return;
  }
  next();
}
