import type { Express } from "express";
import { createServer, type Server } from "http";

// User interface is now declared in middleware/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  tenants,
  courses,
  content,
  standards,
  standardObjectives,
  contentStandardMappings,
  boardExams,
  examQuestions,
  studentExamAttempts,
  lmsIntegrations,
  ragDocuments,
  insertUserSchema,
  insertTenantSchema,
  insertStandardSchema,
  insertContentSchema,
  insertBoardExamSchema,
  insertExamQuestionSchema,
  insertRAGDocumentSchema
} from "@shared/schema";
import { authenticateToken, requireRole, requireSchoolAdmin, requireFaculty } from "./middleware/auth";
import { loadTenant } from "./middleware/tenant";


// Import route modules
import tenantRoutes from "./routes/tenants";
import userRoutes from "./routes/users";
import invitationRoutes from "./routes/invitations";
import standardsRoutes from "./routes/standards";
import notificationRoutes from "./routes/notifications";
import adminRoutes from "./routes/admin";
import profileRoutes from "./routes/profile";
import inbdeRoutes from "./routes/inbde";
import aiRoutes from "./routes/ai";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, tenantId: user.tenantId },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword
        })
        .returning();

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Tenant management (Super Admin only)
  app.post("/api/tenants", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const [newTenant] = await db
        .insert(tenants)
        .values(tenantData)
        .returning();

      res.status(201).json(newTenant);
    } catch (error) {
      res.status(400).json({ message: "Failed to create tenant" });
    }
  });

  app.get("/api/tenants", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const allTenants = await db.select().from(tenants);
      res.json(allTenants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard/stats", authenticateToken, loadTenant, async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;

      // Super admins can't access dashboard stats without a specific tenant
      if (!tenantId) {
        return res.status(400).json({ message: "Dashboard stats require tenant context" });
      }

      const [studentCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, "student")));

      const [contentCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(content)
        .where(eq(content.tenantId, tenantId));

      const [mappedContentCount] = await db
        .select({ count: sql<number>`count(distinct ${content.id})` })
        .from(content)
        .innerJoin(contentStandardMappings, eq(content.id, contentStandardMappings.contentId))
        .where(eq(content.tenantId, tenantId));

      // Calculate average board readiness (mock calculation)
      const avgScore = 78; // This would be calculated from actual exam attempts

      res.json({
        totalStudents: studentCount.count,
        contentMapped: mappedContentCount.count,
        totalContent: contentCount.count,
        boardReadiness: avgScore,
        aiInsights: 15 // Mock AI insights count
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Standards management
  app.get("/api/standards", authenticateToken, loadTenant, async (req, res) => {
    try {
      const tenantStandards = await db
        .select()
        .from(standards)
        .where(eq(standards.tenantId, req.user!.tenantId!));

      res.json(tenantStandards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standards" });
    }
  });

  app.post("/api/standards", authenticateToken, requireSchoolAdmin, loadTenant, async (req, res) => {
    try {
      const standardData = insertStandardSchema.parse(req.body);
      const [newStandard] = await db
        .insert(standards)
        .values({
          ...standardData,
          tenantId: req.user!.tenantId
        })
        .returning();

      res.status(201).json(newStandard);
    } catch (error) {
      res.status(400).json({ message: "Failed to create standard" });
    }
  });

  // Content management
  app.get("/api/content", authenticateToken, loadTenant, async (req, res) => {
    try {
      const { courseId } = req.query;
      
      const whereConditions = courseId
        ? and(
            eq(content.tenantId, req.user!.tenantId),
            eq(content.courseId, courseId as string)
          )
        : eq(content.tenantId, req.user!.tenantId);

      const contentList = await db
        .select()
        .from(content)
        .where(whereConditions)
        .orderBy(desc(content.createdAt));
      res.json(contentList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post("/api/content", authenticateToken, requireFaculty, loadTenant, async (req, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const [newContent] = await db
        .insert(content)
        .values({
          ...contentData,
          tenantId: req.user!.tenantId!
        })
        .returning();

      // Trigger AI categorization
      if (newContent.title && newContent.description) {
        const objectives = await db
          .select()
          .from(standardObjectives)
          .innerJoin(standards, eq(standardObjectives.standardId, standards.id))
          .where(eq(standards.tenantId, req.user!.tenantId!));

        try {
          // AI categorization will be handled by the new AI service endpoints
          console.log('Content created, AI categorization available via /ai-categorization page');

          // AI categorization is now handled via dedicated endpoints
        } catch (aiError) {
          console.error("AI categorization failed:", aiError);
          // Content is still created, just without AI categorization
        }
      }

      res.status(201).json(newContent);
    } catch (error) {
      res.status(400).json({ message: "Failed to create content" });
    }
  });

  // Board exam management
  app.get("/api/board-exams", authenticateToken, loadTenant, async (req, res) => {
    try {
      const exams = await db
        .select()
        .from(boardExams)
        .where(eq(boardExams.tenantId, req.user!.tenantId!))
        .orderBy(desc(boardExams.createdAt));

      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch board exams" });
    }
  });

  app.post("/api/board-exams", authenticateToken, requireFaculty, loadTenant, async (req, res) => {
    try {
      const examData = insertBoardExamSchema.parse(req.body);
      const [newExam] = await db
        .insert(boardExams)
        .values({
          ...examData,
          tenantId: req.user!.tenantId!,
          createdBy: req.user!.id
        })
        .returning();

      res.status(201).json(newExam);
    } catch (error) {
      res.status(400).json({ message: "Failed to create board exam" });
    }
  });

  app.post("/api/board-exams/:examId/generate-questions", authenticateToken, requireFaculty, loadTenant, async (req, res) => {
    try {
      const { examId } = req.params;
      const { count, subject, topics, difficulty } = req.body;

      const objectives = await db
        .select()
        .from(standardObjectives)
        .innerJoin(standards, eq(standardObjectives.standardId, standards.id))
        .where(eq(standards.tenantId, req.user!.tenantId!));

      // Board questions generation will be handled by dedicated AI endpoints
      const questions = []; // Placeholder for now

      // Save generated questions
      const savedQuestions = await db.insert(examQuestions).values(
        questions.map((q: any) => ({
          tenantId: req.user!.tenantId!,
          boardExamId: examId,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          subject: q.subject,
          topic: q.topic
        }))
      ).returning();

      res.json(savedQuestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  // LMS Integration
  app.get("/api/lms-integrations", authenticateToken, requireSchoolAdmin, loadTenant, async (req, res) => {
    try {
      const integrations = await db
        .select()
        .from(lmsIntegrations)
        .where(eq(lmsIntegrations.tenantId, req.user!.tenantId));

      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch LMS integrations" });
    }
  });

  app.post("/api/lms-integrations/:integrationId/sync", authenticateToken, requireSchoolAdmin, loadTenant, async (req, res) => {
    try {
      const { integrationId } = req.params;
      
      const [integration] = await db
        .select()
        .from(lmsIntegrations)
        .where(and(
          eq(lmsIntegrations.id, integrationId),
          eq(lmsIntegrations.tenantId, req.user!.tenantId)
        ));

      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      // Sync users and courses - convert null to undefined for accessToken
      const integrationForSync = {
        ...integration,
        accessToken: integration.accessToken || undefined,
        isActive: integration.isActive || undefined,
        lastSyncAt: integration.lastSyncAt || undefined,
        createdAt: integration.createdAt || undefined,
        updatedAt: integration.updatedAt || undefined
      };
      // LMS sync functionality will be implemented in Phase 4
      const lmsUsers: any[] = [];
      const lmsCourses: any[] = [];

      // Update last sync time
      await db
        .update(lmsIntegrations)
        .set({ lastSyncAt: new Date() })
        .where(eq(lmsIntegrations.id, integrationId));

      res.json({
        usersSync: lmsUsers.length,
        coursesSync: lmsCourses.length,
        syncedAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync LMS data" });
    }
  });

  // RAG Document Management
  app.post("/api/rag-documents", authenticateToken, requireFaculty, loadTenant, async (req, res) => {
    try {
      const documentData = insertRAGDocumentSchema.parse(req.body);
      const [newDocument] = await db
        .insert(ragDocuments)
        .values({
          ...documentData,
          tenantId: req.user!.tenantId!,
          uploadedBy: req.user!.id
        })
        .returning();

      res.status(201).json(newDocument);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload document" });
    }
  });

  app.get("/api/rag-documents", authenticateToken, loadTenant, async (req, res) => {
    try {
      const documents = await db
        .select()
        .from(ragDocuments)
        .where(eq(ragDocuments.tenantId, req.user!.tenantId!))
        .orderBy(desc(ragDocuments.createdAt));

      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Student Progress
  app.get("/api/students/:studentId/progress", authenticateToken, loadTenant, async (req, res) => {
    try {
      const { studentId } = req.params;
      
      // Check if user has access to view this student's progress
      if (req.user!.role === "student" && req.user!.id !== studentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const attempts = await db
        .select()
        .from(studentExamAttempts)
        .where(eq(studentExamAttempts.studentId, studentId))
        .orderBy(desc(studentExamAttempts.startedAt));

      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student progress" });
    }
  });

  // Mount the new route modules
  app.use("/api/tenants", tenantRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/invitations", invitationRoutes);
  app.use("/api/standards", standardsRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/inbde", inbdeRoutes);
  app.use("/api/ai", aiRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
