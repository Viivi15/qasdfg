import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: any;
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: "Missing token" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; 
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}
