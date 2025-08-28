import { Router } from "express";
import { storage } from "../storage";
import { insertUserInvitationSchema } from "@shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const router = Router();

// Get invitations for tenant (school admin and above)
router.get("/", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    let tenantId = req.user!.tenantId;
    
    // Super admin can specify tenant
    if (req.user!.role === "super_admin" && req.query.tenantId) {
      tenantId = req.query.tenantId as string;
    }
    
    const invitations = await storage.getInvitationsByTenant(tenantId);
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
});

// Create invitation (school admin and above)
router.post("/", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const validatedData = insertUserInvitationSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    // School admins can only invite to their own tenant
    let tenantId = validatedData.tenantId;
    if (req.user!.role === "school_admin") {
      tenantId = req.user!.tenantId;
    }
    
    // Generate invitation token and set expiration (7 days)
    const invitationToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const invitation = await storage.createUserInvitation({
      ...validatedData,
      tenantId,
      invitedBy: req.user!.id,
      invitationToken,
      expiresAt
    });
    
    // Here you would typically send an email with the invitation link
    // For now, we'll just return the invitation data
    
    res.status(201).json(invitation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create invitation" });
  }
});

// Get invitation by token (public endpoint)
router.get("/token/:token", async (req, res) => {
  try {
    const invitation = await storage.getUserInvitationByToken(req.params.token);
    if (!invitation) {
      return res.status(404).json({ error: "Invalid or expired invitation" });
    }
    
    // Don't include sensitive information
    const { invitationToken, invitedBy, ...publicInvitation } = invitation;
    res.json(publicInvitation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invitation" });
  }
});

// Accept invitation (public endpoint)
router.post("/accept/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required" });
    }
    
    const invitation = await storage.getUserInvitationByToken(req.params.token);
    if (!invitation) {
      return res.status(404).json({ error: "Invalid or expired invitation" });
    }
    
    // Create user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = invitation.email; // Use email as username for simplicity
    
    const user = await storage.createUser({
      tenantId: invitation.tenantId,
      email: invitation.email,
      username,
      password: hashedPassword,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      role: invitation.role,
      isActive: true
    });
    
    // Mark invitation as accepted
    await storage.acceptInvitation(req.params.token);
    
    const { password: _, ...sanitizedUser } = user;
    res.status(201).json({
      user: sanitizedUser,
      message: "Account created successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept invitation" });
  }
});

// Delete invitation (school admin and above)
router.delete("/:id", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    // Check if invitation exists and user has permission
    const invitations = await storage.getInvitationsByTenant(req.user!.tenantId);
    const invitation = invitations.find(inv => inv.id === req.params.id);
    
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    
    // Super admin can delete any invitation, school admin only their tenant's
    if (req.user!.role !== "super_admin" && invitation.tenantId !== req.user!.tenantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await storage.deleteInvitation(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete invitation" });
  }
});

export default router;