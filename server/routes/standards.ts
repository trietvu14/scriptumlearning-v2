import { Router } from "express";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { db } from "../db";
import { 
  standardsFrameworks, 
  standardsSubjects, 
  standardsTopics, 
  standardsSubtopics,
  standardsDocuments,
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
    
    let queryBuilder = db.select().from(standardsFrameworks);
    
    // Build where conditions
    const conditions = [];
    
    if (educationalArea) {
      conditions.push(eq(standardsFrameworks.educationalArea, educationalArea as string));
    }
    
    // For non-super admins, show only official standards and their own tenant's custom standards
    if (req.user!.role !== "super_admin") {
      conditions.push(
        sql`(${standardsFrameworks.isOfficial} = true OR ${standardsFrameworks.tenantId} = ${req.user!.tenantId})`
      );
    } else if (includeOfficial === "false") {
      // Super admin can filter to only custom standards
      conditions.push(eq(standardsFrameworks.isOfficial, false));
    }
    
    conditions.push(eq(standardsFrameworks.isActive, true));
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    
    const frameworks = await queryBuilder.orderBy(
      standardsFrameworks.isOfficial, 
      standardsFrameworks.name
    );
    
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
    
    const subjectsWithTopics = await Promise.all(
      subjects.map(async (subject) => {
        const topics = await db.select()
          .from(standardsTopics)
          .where(and(
            eq(standardsTopics.subjectId, subject.id),
            eq(standardsTopics.isActive, true)
          ))
          .orderBy(standardsTopics.sortOrder, standardsTopics.name);
        
        const topicsWithSubtopics = await Promise.all(
          topics.map(async (topic) => {
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
        
        return { ...subject, topics: topicsWithSubtopics };
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

export default router;