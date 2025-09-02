import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const router = Router();

// Get users by tenant (school admin and above)
router.get("/", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    let users;
    
    if (req.user!.role === "super_admin") {
      // Super admin can specify tenant, or get all users from all tenants
      const tenantId = req.query.tenantId as string;
      if (tenantId) {
        users = await storage.getUsersByTenant(tenantId);
      } else {
        // Super admin gets all users from all tenants with tenant info
        users = await storage.getAllUsersWithTenantInfo();
      }
    } else {
      // School admin can only see users from their own tenant
      if (!req.user!.tenantId) {
        return res.status(400).json({ error: "User has no tenant association" });
      }
      users = await storage.getUsersByTenant(req.user!.tenantId);
    }
    
    // Remove password from response
    const sanitizedUsers = users.map(user => {
      const { password, ...sanitizedUser } = user;
      return sanitizedUser;
    });
    
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Users can only view their own profile or admins can view users in their tenant
    if (req.user!.id !== user.id && 
        req.user!.role !== "super_admin" && 
        !(["school_admin"].includes(req.user!.role) && req.user!.tenantId === user.tenantId)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { password, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user (school admin and above)
router.post("/", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // School admins can only create users in their own tenant
    let tenantId = validatedData.tenantId;
    if (req.user!.role === "school_admin") {
      tenantId = req.user!.tenantId;
    }
    
    const user = await storage.createUser({
      ...validatedData,
      tenantId,
      password: hashedPassword
    });
    
    const { password, ...sanitizedUser } = user;
    res.status(201).json(sanitizedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Users can update their own profile or admins can update users in their tenant
    if (req.user!.id !== user.id && 
        req.user!.role !== "super_admin" && 
        !(["school_admin"].includes(req.user!.role) && req.user!.tenantId === user.tenantId)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const updateData = insertUserSchema.partial().parse(req.body);
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Regular users cannot change their role or tenant
    if (req.user!.id === user.id && !["super_admin", "school_admin"].includes(req.user!.role)) {
      delete updateData.role;
      delete updateData.tenantId;
    }
    
    const updatedUser = await storage.updateUser(req.params.id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...sanitizedUser } = updatedUser;
    res.json(sanitizedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;