import { Router } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../db";
import { users } from "../../shared/schema";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Profile update schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
  officeLocation: z.string().max(100).optional(),
  bio: z.string().max(500).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"]
});

// Super admin profile schema (limited fields)
const superAdminProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email()
});

// Get current user profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        title: users.title,
        department: users.department,
        phoneNumber: users.phoneNumber,
        officeLocation: users.officeLocation,
        bio: users.bio,
        profileImageUrl: users.profileImageUrl,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0]);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    // Use different schema validation based on role
    let validatedData;
    if (userRole === "super_admin") {
      validatedData = superAdminProfileSchema.parse(req.body);
    } else {
      validatedData = updateProfileSchema.parse(req.body);
    }
    
    // Check if email is already taken by another user
    if (validatedData.email !== req.user!.email) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, validatedData.email))
        .then(rows => rows[0]);
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }
    
    // Update user profile
    const updatedUser = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        title: users.title,
        department: users.department,
        phoneNumber: users.phoneNumber,
        officeLocation: users.officeLocation,
        bio: users.bio,
        profileImageUrl: users.profileImageUrl,
        updatedAt: users.updatedAt
      })
      .then(rows => rows[0]);
    
    res.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
router.put("/password", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const validatedData = changePasswordSchema.parse(req.body);
    
    // Get current user with password
    const user = await db
      .select({ 
        id: users.id, 
        password: users.password 
      })
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0]);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword, 
      user.password
    );
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);
    
    // Update password
    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error changing password:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Update profile image URL
router.put("/image", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { profileImageUrl } = req.body;
    
    if (!profileImageUrl || typeof profileImageUrl !== "string") {
      return res.status(400).json({ error: "Valid profile image URL is required" });
    }
    
    // Basic URL validation
    try {
      new URL(profileImageUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    
    const updatedUser = await db
      .update(users)
      .set({
        profileImageUrl,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        profileImageUrl: users.profileImageUrl
      })
      .then(rows => rows[0]);
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ error: "Failed to update profile image" });
  }
});

// Delete/deactivate account (non-super admin only)
router.delete("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    // Super admins cannot delete their own accounts
    if (userRole === "super_admin") {
      return res.status(403).json({ 
        error: "Super admin accounts cannot be deleted through this endpoint" 
      });
    }
    
    // Deactivate account instead of hard delete to preserve data integrity
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true, 
      message: "Account deactivated successfully" 
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({ error: "Failed to deactivate account" });
  }
});

export default router;