import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
}; 