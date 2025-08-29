import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  inbdeFoundationKnowledge, 
  inbdeClinicalContent, 
  inbdeContentMappings,
  inbdeMappingStats,
  content
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { seedINBDEStandards } from "../scripts/seed-inbde";

const router = Router();

// Initialize INBDE standards (seed data)
router.post("/initialize", async (req, res) => {
  try {
    await seedINBDEStandards();
    res.json({ message: "INBDE standards initialized successfully" });
  } catch (error) {
    console.error("Error initializing INBDE standards:", error);
    res.status(500).json({ error: "Failed to initialize INBDE standards" });
  }
});

// Get all Foundation Knowledge areas
router.get("/foundation-knowledge", async (req, res) => {
  try {
    const fkAreas = await db
      .select()
      .from(inbdeFoundationKnowledge)
      .where(eq(inbdeFoundationKnowledge.isActive, true))
      .orderBy(inbdeFoundationKnowledge.fkNumber);
    
    res.json(fkAreas);
  } catch (error) {
    console.error("Error fetching Foundation Knowledge areas:", error);
    res.status(500).json({ error: "Failed to fetch Foundation Knowledge areas" });
  }
});

// Get all Clinical Content areas
router.get("/clinical-content", async (req, res) => {
  try {
    const ccAreas = await db
      .select()
      .from(inbdeClinicalContent)
      .where(eq(inbdeClinicalContent.isActive, true))
      .orderBy(inbdeClinicalContent.ccNumber);
    
    res.json(ccAreas);
  } catch (error) {
    console.error("Error fetching Clinical Content areas:", error);
    res.status(500).json({ error: "Failed to fetch Clinical Content areas" });
  }
});

// Get curriculum mapping matrix with statistics
router.get("/mapping-matrix/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { courseId } = req.query;
    
    // Get Foundation Knowledge areas
    const fkAreas = await db
      .select()
      .from(inbdeFoundationKnowledge)
      .where(eq(inbdeFoundationKnowledge.isActive, true))
      .orderBy(inbdeFoundationKnowledge.fkNumber);
    
    // Get Clinical Content areas
    const ccAreas = await db
      .select()
      .from(inbdeClinicalContent)
      .where(eq(inbdeClinicalContent.isActive, true))
      .orderBy(inbdeClinicalContent.ccNumber);
    
    // Get mapping statistics
    const whereConditions = [eq(inbdeMappingStats.tenantId, tenantId)];
    if (courseId) {
      whereConditions.push(eq(inbdeMappingStats.courseId, courseId as string));
    }
    
    const stats = await db
      .select({
        fkId: inbdeMappingStats.fkId,
        ccId: inbdeMappingStats.ccId,
        contentCount: inbdeMappingStats.contentCount,
        totalContentCount: inbdeMappingStats.totalContentCount,
        coveragePercentage: inbdeMappingStats.coveragePercentage
      })
      .from(inbdeMappingStats)
      .where(and(...whereConditions));

    
    // Create matrix structure
    const matrix = fkAreas.map(fk => ({
      fk,
      ccMappings: ccAreas.map(cc => {
        const stat = stats.find(s => s.fkId === fk.id && s.ccId === cc.id);
        return {
          cc,
          contentCount: stat?.contentCount || 0,
          totalContentCount: stat?.totalContentCount || 0,
          coveragePercentage: stat?.coveragePercentage || "0.00"
        };
      })
    }));
    
    res.json({
      foundationKnowledge: fkAreas,
      clinicalContent: ccAreas,
      matrix
    });
    
  } catch (error) {
    console.error("Error fetching mapping matrix:", error);
    res.status(500).json({ error: "Failed to fetch mapping matrix" });
  }
});

// Create content mapping
router.post("/content-mapping", async (req, res) => {
  try {
    const mappingSchema = z.object({
      tenantId: z.string().uuid(),
      contentId: z.string().uuid(),
      fkId: z.string().uuid(),
      ccId: z.string().uuid(),
      alignmentStrength: z.number().min(0).max(1).optional(),
      isAiGenerated: z.boolean().optional()
    });
    
    const validatedData = mappingSchema.parse(req.body);
    
    const insertData = {
      ...validatedData,
      alignmentStrength: validatedData.alignmentStrength?.toString() || "1.00"
    };
    
    const mapping = await db
      .insert(inbdeContentMappings)
      .values([insertData])
      .returning();
    
    // Recalculate statistics for this FK-CC combination
    await recalculateMappingStats(validatedData.tenantId, validatedData.fkId, validatedData.ccId);
    
    res.json(mapping[0]);
  } catch (error) {
    console.error("Error creating content mapping:", error);
    res.status(500).json({ error: "Failed to create content mapping" });
  }
});

// Update content mapping
router.patch("/content-mapping/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateSchema = z.object({
      alignmentStrength: z.number().min(0).max(1).optional(),
      reviewedBy: z.string().uuid().optional()
    });
    
    const validatedData = updateSchema.parse(req.body);
    const updateData: any = {
      ...(validatedData.alignmentStrength !== undefined && { alignmentStrength: validatedData.alignmentStrength.toString() }),
      ...(validatedData.reviewedBy && { 
        reviewedBy: validatedData.reviewedBy,
        reviewedAt: new Date() 
      }),
      updatedAt: new Date()
    };
    
    const updated = await db
      .update(inbdeContentMappings)
      .set(updateData)
      .where(eq(inbdeContentMappings.id, id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: "Content mapping not found" });
    }
    
    // Recalculate statistics
    const mapping = updated[0];
    await recalculateMappingStats(mapping.tenantId, mapping.fkId, mapping.ccId);
    
    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating content mapping:", error);
    res.status(500).json({ error: "Failed to update content mapping" });
  }
});

// Delete content mapping
router.delete("/content-mapping/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const mapping = await db
      .select()
      .from(inbdeContentMappings)
      .where(eq(inbdeContentMappings.id, id));
    
    if (mapping.length === 0) {
      return res.status(404).json({ error: "Content mapping not found" });
    }
    
    await db
      .delete(inbdeContentMappings)
      .where(eq(inbdeContentMappings.id, id));
    
    // Recalculate statistics
    const deletedMapping = mapping[0];
    await recalculateMappingStats(deletedMapping.tenantId, deletedMapping.fkId, deletedMapping.ccId);
    
    res.json({ message: "Content mapping deleted successfully" });
  } catch (error) {
    console.error("Error deleting content mapping:", error);
    res.status(500).json({ error: "Failed to delete content mapping" });
  }
});

// Get content mappings for specific FK-CC combination
router.get("/content-mapping/:tenantId/:fkId/:ccId", async (req, res) => {
  try {
    const { tenantId, fkId, ccId } = req.params;
    
    const mappings = await db
      .select({
        id: inbdeContentMappings.id,
        contentId: inbdeContentMappings.contentId,
        alignmentStrength: inbdeContentMappings.alignmentStrength,
        isAiGenerated: inbdeContentMappings.isAiGenerated,
        reviewedBy: inbdeContentMappings.reviewedBy,
        reviewedAt: inbdeContentMappings.reviewedAt,
        createdAt: inbdeContentMappings.createdAt,
        contentTitle: content.title,
        contentType: content.type,
        contentDescription: content.description
      })
      .from(inbdeContentMappings)
      .leftJoin(content, eq(inbdeContentMappings.contentId, content.id))
      .where(
        and(
          eq(inbdeContentMappings.tenantId, tenantId),
          eq(inbdeContentMappings.fkId, fkId),
          eq(inbdeContentMappings.ccId, ccId)
        )
      )
      .orderBy(desc(inbdeContentMappings.createdAt));
    
    res.json(mappings);
  } catch (error) {
    console.error("Error fetching content mappings:", error);
    res.status(500).json({ error: "Failed to fetch content mappings" });
  }
});

// Helper function to recalculate mapping statistics
async function recalculateMappingStats(tenantId: string, fkId: string, ccId: string, courseId?: string) {
  try {
    // Count content mapped to this FK-CC combination
    let contentCountConditions = [
      eq(inbdeContentMappings.tenantId, tenantId),
      eq(inbdeContentMappings.fkId, fkId),
      eq(inbdeContentMappings.ccId, ccId)
    ];
    
    let totalContentConditions = [eq(content.tenantId, tenantId)];
    
    if (courseId) {
      totalContentConditions.push(eq(content.courseId, courseId));
    }
    
    let contentCountResult;
    if (courseId) {
      contentCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(inbdeContentMappings)
        .leftJoin(content, eq(inbdeContentMappings.contentId, content.id))
        .where(and(
          ...contentCountConditions,
          eq(content.courseId, courseId)
        ));
    } else {
      contentCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(inbdeContentMappings)
        .where(and(...contentCountConditions));
    }
    
    const totalContentResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(content)
      .where(and(...totalContentConditions));
    
    const contentCount = contentCountResult[0].count;
    const totalContentCount = totalContentResult[0].count;
    

    const coveragePercentage = totalContentCount > 0 
      ? ((contentCount / totalContentCount) * 100).toFixed(2)
      : "0.00";
    
    // Upsert statistics
    await db
      .insert(inbdeMappingStats)
      .values({
        tenantId,
        courseId: courseId || null,
        fkId,
        ccId,
        contentCount,
        totalContentCount,
        coveragePercentage,
        lastCalculatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: courseId 
          ? [inbdeMappingStats.tenantId, inbdeMappingStats.courseId, inbdeMappingStats.fkId, inbdeMappingStats.ccId]
          : [inbdeMappingStats.tenantId, inbdeMappingStats.fkId, inbdeMappingStats.ccId],
        set: {
          contentCount,
          totalContentCount,
          coveragePercentage,
          lastCalculatedAt: new Date(),
          updatedAt: new Date()
        }
      });
      
  } catch (error) {
    console.error("Error recalculating mapping stats:", error);
  }
}

// Bulk recalculate all statistics for a tenant
router.post("/recalculate-stats/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { courseId } = req.body;
    
    // Get all FK areas
    const fkAreas = await db
      .select()
      .from(inbdeFoundationKnowledge)
      .where(eq(inbdeFoundationKnowledge.isActive, true));
    
    // Get all CC areas
    const ccAreas = await db
      .select()
      .from(inbdeClinicalContent)
      .where(eq(inbdeClinicalContent.isActive, true));
    
    // Recalculate stats for all FK-CC combinations
    for (const fk of fkAreas) {
      for (const cc of ccAreas) {
        await recalculateMappingStats(tenantId, fk.id, cc.id, courseId);
      }
    }
    
    res.json({ message: "Statistics recalculated successfully" });
  } catch (error) {
    console.error("Error recalculating statistics:", error);
    res.status(500).json({ error: "Failed to recalculate statistics" });
  }
});

export default router;