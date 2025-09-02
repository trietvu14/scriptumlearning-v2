import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users, User } from "@shared/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: User & { name?: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log('No auth token provided');
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log('Token decoded:', { userId: decoded.userId });
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user) {
      console.log('User not found:', decoded.userId);
      return res.status(401).json({ error: "User not found" });
    }

    console.log('User authenticated:', user.email, user.role);
    req.user = {
      ...user,
      name: `${user.firstName} ${user.lastName}`
    };
    next();
  } catch (error) {
    console.log('Token verification failed:', error);
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Legacy export for compatibility
export const authenticateToken = requireAuth;

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

export const requireSchoolAdmin = requireRole(["school_admin", "super_admin"]);
export const requireFaculty = requireRole(["faculty", "school_admin", "super_admin"]);
export const requireSuperAdmin = requireRole(["super_admin"]);
export const adminMiddleware = requireSuperAdmin;