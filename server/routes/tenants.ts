import { Router } from "express";
import { storage } from "../storage";
import { insertTenantSchema } from "@shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Get all tenants (super admin only)
router.get("/", requireAuth, requireRole(["super_admin"]), async (req, res) => {
  try {
    const tenants = await storage.getAllTenants();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});

// Get tenant by ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const tenant = await storage.getTenant(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    
    // Only super admins or users from the same tenant can view tenant details
    if (req.user!.role !== "super_admin" && req.user!.tenantId !== tenant.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
});

// Create new tenant (super admin only)
router.post("/", requireAuth, requireRole(["super_admin"]), async (req, res) => {
  try {
    const validatedData = insertTenantSchema.parse(req.body);
    
    // Check if domain already exists
    const existingTenant = await storage.getTenantByDomain(validatedData.domain);
    if (existingTenant) {
      return res.status(400).json({ error: "Domain already exists" });
    }
    
    const tenant = await storage.createTenant(validatedData);
    res.status(201).json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create tenant" });
  }
});

// Update tenant
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const tenant = await storage.getTenant(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    
    // Only super admins or school admins from the same tenant can update
    if (req.user!.role !== "super_admin" && 
        !(req.user!.role === "school_admin" && req.user!.tenantId === tenant.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const updateData = insertTenantSchema.partial().parse(req.body);
    const updatedTenant = await storage.updateTenant(req.params.id, updateData);
    
    res.json(updatedTenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update tenant" });
  }
});

export default router;