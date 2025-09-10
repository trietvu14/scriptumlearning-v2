import { Router } from "express";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { db } from "../db";
import { 
  standardsFrameworks, 
  standardsSubjects, 
  standardsTopics, 
  standardsSubtopics,
  standardsDocuments,
  tenants,
  insertStandardsFrameworkSchema,
  insertStandardsSubjectSchema,
  insertStandardsTopicSchema,
  insertStandardsSubtopicSchema,
  type SelectStandardsFramework,
  type SelectStandardsSubject,
  type SelectStandardsTopic,
  type SelectStandardsSubtopic
} from "../../shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Get all frameworks (with filtering by educational area)
router.get("/frameworks", requireAuth, async (req, res) => {
  try {
    const { educationalArea, includeOfficial } = req.query;
    
    // Build where conditions
    const conditions = [];
    
    // For non-super admins, filter by their tenant's educational area
    if (req.user!.role !== "super_admin") {
      // First, get user's tenant educational area from the db
      const [userTenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, req.user!.tenantId!))
        .limit(1);
      
      if (userTenant) {
        console.log(`Filtering standards for educational area: ${userTenant.educationalArea}`);
        // Only show standards for their educational area
        conditions.push(eq(standardsFrameworks.educationalArea, userTenant.educationalArea));
      }
      
      // Show only official standards and their own tenant's custom standards
      conditions.push(
        sql`(${standardsFrameworks.isOfficial} = true OR ${standardsFrameworks.tenantId} = ${req.user!.tenantId})`
      );
    } else {
      // Super admin can see all or filter by educational area if specified
      if (educationalArea) {
        conditions.push(eq(standardsFrameworks.educationalArea, educationalArea as string));
      }
      
      if (includeOfficial === "false") {
        conditions.push(eq(standardsFrameworks.isOfficial, false));
      }
    }
    
    conditions.push(eq(standardsFrameworks.isActive, true));
    
    console.log(`Applied ${conditions.length} conditions to standards query`);
    
    const frameworks = await db
      .select()
      .from(standardsFrameworks)
      .where(and(...conditions))
      .orderBy(standardsFrameworks.isOfficial, standardsFrameworks.name);
    
    res.json(frameworks);
  } catch (error) {
    console.error("Error fetching frameworks:", error);
    res.status(500).json({ error: "Failed to fetch frameworks" });
  }
});

// Create new framework (school admin and above)
router.post("/frameworks", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const validatedData = insertStandardsFrameworkSchema.parse(req.body);
    
    // School admins can only create custom frameworks for their tenant
    if (req.user!.role === "school_admin") {
      validatedData.tenantId = req.user!.tenantId;
      validatedData.isOfficial = false;
    }
    
    const framework = await db.insert(standardsFrameworks)
      .values(validatedData)
      .returning()
      .then(rows => rows[0]);
    
    res.status(201).json(framework);
  } catch (error: any) {
    console.error("Error creating framework:", error);
    res.status(400).json({ error: error.message || "Failed to create framework" });
  }
});

// Get framework by ID with full hierarchy
router.get("/frameworks/:id", requireAuth, async (req, res) => {
  try {
    const frameworkId = req.params.id;
    
    // Get framework
    const framework = await db.select()
      .from(standardsFrameworks)
      .where(eq(standardsFrameworks.id, frameworkId))
      .then(rows => rows[0]);
    
    if (!framework) {
      return res.status(404).json({ error: "Framework not found" });
    }
    
    // Check access - users can only access official frameworks or their tenant's custom ones
    if (!framework.isOfficial && framework.tenantId !== req.user!.tenantId && req.user!.role !== "super_admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get subjects with topics and subtopics
    const subjects = await db.select()
      .from(standardsSubjects)
      .where(and(
        eq(standardsSubjects.frameworkId, frameworkId),
        eq(standardsSubjects.isActive, true)
      ))
      .orderBy(standardsSubjects.sortOrder, standardsSubjects.name);
    
    // Helper function to build hierarchical topic structure
    const buildTopicHierarchy = (allTopics: any[], parentId: string | null = null): any[] => {
      const children = allTopics
        .filter(topic => topic.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      
      return children.map(topic => ({
        ...topic,
        children: buildTopicHierarchy(allTopics, topic.id)
      }));
    };

    const subjectsWithTopics = await Promise.all(
      subjects.map(async (subject) => {
        // Fetch all topics for this subject
        const allTopics = await db.select()
          .from(standardsTopics)
          .where(and(
            eq(standardsTopics.subjectId, subject.id),
            eq(standardsTopics.isActive, true)
          ))
          .orderBy(standardsTopics.level, standardsTopics.sortOrder, standardsTopics.name);
        
        // Add subtopics to each topic
        const topicsWithSubtopics = await Promise.all(
          allTopics.map(async (topic) => {
            const subtopics = await db.select()
              .from(standardsSubtopics)
              .where(and(
                eq(standardsSubtopics.topicId, topic.id),
                eq(standardsSubtopics.isActive, true)
              ))
              .orderBy(standardsSubtopics.sortOrder, standardsSubtopics.name);
            
            return { ...topic, subtopics };
          })
        );
        
        // Build hierarchical structure (only root topics - those without parents)
        const hierarchicalTopics = buildTopicHierarchy(topicsWithSubtopics, null);
        
        return { ...subject, topics: hierarchicalTopics };
      })
    );
    
    res.json({ ...framework, subjects: subjectsWithTopics });
  } catch (error) {
    console.error("Error fetching framework:", error);
    res.status(500).json({ error: "Failed to fetch framework" });
  }
});

// Create subject (school admin and above)
router.post("/frameworks/:frameworkId/subjects", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const frameworkId = req.params.frameworkId;
    const validatedData = insertStandardsSubjectSchema.parse({
      ...req.body,
      frameworkId
    });
    
    // Check if user can modify this framework
    const framework = await db.select()
      .from(standardsFrameworks)
      .where(eq(standardsFrameworks.id, frameworkId))
      .then(rows => rows[0]);
    
    if (!framework) {
      return res.status(404).json({ error: "Framework not found" });
    }
    
    if (req.user!.role === "school_admin" && (framework.isOfficial || framework.tenantId !== req.user!.tenantId)) {
      return res.status(403).json({ error: "Can only modify your own custom frameworks" });
    }
    
    const subject = await db.insert(standardsSubjects)
      .values(validatedData)
      .returning()
      .then(rows => rows[0]);
    
    res.status(201).json(subject);
  } catch (error: any) {
    console.error("Error creating subject:", error);
    res.status(400).json({ error: error.message || "Failed to create subject" });
  }
});

// Create topic (school admin and above)
router.post("/subjects/:subjectId/topics", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const validatedData = insertStandardsTopicSchema.parse({
      ...req.body,
      subjectId
    });
    
    // Check if user can modify this subject's framework
    const subjectWithFramework = await db.select({
      subject: standardsSubjects,
      framework: standardsFrameworks
    })
      .from(standardsSubjects)
      .innerJoin(standardsFrameworks, eq(standardsSubjects.frameworkId, standardsFrameworks.id))
      .where(eq(standardsSubjects.id, subjectId))
      .then(rows => rows[0]);
    
    if (!subjectWithFramework) {
      return res.status(404).json({ error: "Subject not found" });
    }
    
    const { framework } = subjectWithFramework;
    if (req.user!.role === "school_admin" && (framework.isOfficial || framework.tenantId !== req.user!.tenantId)) {
      return res.status(403).json({ error: "Can only modify your own custom frameworks" });
    }
    
    const topic = await db.insert(standardsTopics)
      .values(validatedData)
      .returning()
      .then(rows => rows[0]);
    
    res.status(201).json(topic);
  } catch (error: any) {
    console.error("Error creating topic:", error);
    res.status(400).json({ error: error.message || "Failed to create topic" });
  }
});

// Create subtopic (school admin and above)
router.post("/topics/:topicId/subtopics", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const topicId = req.params.topicId;
    const validatedData = insertStandardsSubtopicSchema.parse({
      ...req.body,
      topicId
    });
    
    // Check if user can modify this topic's framework
    const topicWithFramework = await db.select({
      topic: standardsTopics,
      subject: standardsSubjects,
      framework: standardsFrameworks
    })
      .from(standardsTopics)
      .innerJoin(standardsSubjects, eq(standardsTopics.subjectId, standardsSubjects.id))
      .innerJoin(standardsFrameworks, eq(standardsSubjects.frameworkId, standardsFrameworks.id))
      .where(eq(standardsTopics.id, topicId))
      .then(rows => rows[0]);
    
    if (!topicWithFramework) {
      return res.status(404).json({ error: "Topic not found" });
    }
    
    const { framework } = topicWithFramework;
    if (req.user!.role === "school_admin" && (framework.isOfficial || framework.tenantId !== req.user!.tenantId)) {
      return res.status(403).json({ error: "Can only modify your own custom frameworks" });
    }
    
    const subtopic = await db.insert(standardsSubtopics)
      .values(validatedData)
      .returning()
      .then(rows => rows[0]);
    
    res.status(201).json(subtopic);
  } catch (error: any) {
    console.error("Error creating subtopic:", error);
    res.status(400).json({ error: error.message || "Failed to create subtopic" });
  }
});

// Get official standards for educational area
router.get("/official/:educationalArea", requireAuth, async (req, res) => {
  try {
    const { educationalArea } = req.params;
    
    const frameworks = await db.select()
      .from(standardsFrameworks)
      .where(and(
        eq(standardsFrameworks.educationalArea, educationalArea),
        eq(standardsFrameworks.isOfficial, true),
        eq(standardsFrameworks.isActive, true)
      ))
      .orderBy(standardsFrameworks.name);
    
    res.json(frameworks);
  } catch (error) {
    console.error("Error fetching official standards:", error);
    res.status(500).json({ error: "Failed to fetch official standards" });
  }
});

// Update framework (school admin and above)
router.patch("/frameworks/:id", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const frameworkId = req.params.id;
    const updates = req.body;
    
    // Check if user can modify this framework
    const framework = await db.select()
      .from(standardsFrameworks)
      .where(eq(standardsFrameworks.id, frameworkId))
      .then(rows => rows[0]);
    
    if (!framework) {
      return res.status(404).json({ error: "Framework not found" });
    }
    
    if (req.user!.role === "school_admin" && (framework.isOfficial || framework.tenantId !== req.user!.tenantId)) {
      return res.status(403).json({ error: "Can only modify your own custom frameworks" });
    }
    
    const updatedFramework = await db.update(standardsFrameworks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(standardsFrameworks.id, frameworkId))
      .returning()
      .then(rows => rows[0]);
    
    res.json(updatedFramework);
  } catch (error: any) {
    console.error("Error updating framework:", error);
    res.status(400).json({ error: error.message || "Failed to update framework" });
  }
});

// Seed official standards (publicly accessible for setup)
router.post("/seed", async (req, res) => {
  try {
    console.log("Starting standards seeding...");
    const { seedOfficialStandards } = await import("../data/official-standards");
    await seedOfficialStandards(db, standardsFrameworks, standardsSubjects, standardsTopics, standardsSubtopics);
    console.log("Standards seeding completed successfully");
    res.json({ message: "Official standards seeded successfully" });
  } catch (error) {
    console.error("Error seeding standards:", error);
    res.status(500).json({ error: "Failed to seed standards", details: error });
  }
});

// Delete framework (super admin and school admin for their own custom frameworks)
router.delete("/frameworks/:id", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const frameworkId = req.params.id;
    
    // Get the framework to check permissions
    const [framework] = await db
      .select()
      .from(standardsFrameworks)
      .where(eq(standardsFrameworks.id, frameworkId))
      .limit(1);
    
    if (!framework) {
      return res.status(404).json({ error: "Framework not found" });
    }
    
    // Check permissions
    if (req.user!.role === "school_admin") {
      // School admins can only delete their own custom frameworks
      if (framework.isOfficial || framework.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ error: "Can only delete your own custom frameworks" });
      }
    }
    
    // Delete related data first (topics -> subjects -> framework)
    // Get all subjects for this framework
    const subjects = await db.select()
      .from(standardsSubjects)
      .where(eq(standardsSubjects.frameworkId, frameworkId));
    
    // Delete all topics for these subjects
    for (const subject of subjects) {
      await db.delete(standardsTopics)
        .where(eq(standardsTopics.subjectId, subject.id));
    }
    
    // Delete all subjects for this framework
    await db.delete(standardsSubjects)
      .where(eq(standardsSubjects.frameworkId, frameworkId));
    
    // Finally, delete the framework
    await db
      .delete(standardsFrameworks)
      .where(eq(standardsFrameworks.id, frameworkId));
    
    res.json({ message: "Framework deleted successfully" });
  } catch (error) {
    console.error("Error deleting framework:", error);
    res.status(500).json({ error: "Failed to delete framework" });
  }
});

export default router;