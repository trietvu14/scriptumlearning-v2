import { Request, Response, NextFunction } from "express";

export const loadTenant = (req: Request, res: Response, next: NextFunction) => {
  // Tenant information is already available via req.user.tenantId
  // This middleware can be extended for additional tenant-specific logic
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.tenantId) {
    return res.status(400).json({ message: "No tenant associated with user" });
  }

  next();
};