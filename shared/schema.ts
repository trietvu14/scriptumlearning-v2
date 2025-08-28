import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  uuid, 
  timestamp, 
  integer, 
  boolean, 
  jsonb, 
  decimal,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "school_admin", 
  "faculty",
  "administrative_support",
  "student"
]);

export const educationalAreaEnum = pgEnum("educational_area", [
  "medical_school",
  "dental_school", 
  "nursing_school",
  "physical_therapy_school",
  "law_school",
  "engineering_school"
]);

export const standardTypeEnum = pgEnum("standard_type", [
  "usmle",
  "lcme",
  "inbde", 
  "coda",
  "internal"
]);

export const contentTypeEnum = pgEnum("content_type", [
  "video",
  "document",
  "image", 
  "quiz",
  "lecture",
  "assignment"
]);

export const lmsTypeEnum = pgEnum("lms_type", [
  "canvas",
  "blackboard",
  "moodle"
]);

export const confidenceLevelEnum = pgEnum("confidence_level", [
  "confident",
  "somewhat_sure",
  "guessing"
]);

// Core Tables
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  educationalArea: educationalAreaEnum("educational_area").notNull(),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  email: text("email").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const userInvitations = pgTable("user_invitations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  invitedBy: uuid("invited_by").references(() => users.id).notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRoleEnum("role").notNull(),
  invitationToken: text("invitation_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  isAccepted: boolean("is_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const standards = pgTable("standards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  type: standardTypeEnum("type").notNull(),
  description: text("description"),
  version: text("version"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const standardObjectives = pgTable("standard_objectives", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  standardId: uuid("standard_id").references(() => standards.id).notNull(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow()
});

export const lmsIntegrations = pgTable("lms_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  type: lmsTypeEnum("type").notNull(),
  apiUrl: text("api_url").notNull(),
  accessToken: text("access_token"),
  settings: jsonb("settings"),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  lmsIntegrationId: uuid("lms_integration_id").references(() => lmsIntegrations.id),
  externalId: text("external_id"),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"),
  term: text("term"),
  year: integer("year"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // instructor, student, ta
  enrolledAt: timestamp("enrolled_at").defaultNow()
});

export const content = pgTable("content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id),
  lmsIntegrationId: uuid("lms_integration_id").references(() => lmsIntegrations.id),
  externalId: text("external_id"),
  title: text("title").notNull(),
  description: text("description"),
  type: contentTypeEnum("type").notNull(),
  content: jsonb("content"), // Stores actual content or metadata
  fileUrl: text("file_url"),
  embedding: text("embedding"), // Vector embedding as text for pgvector
  aiCategorized: boolean("ai_categorized").default(false),
  aiMetadata: jsonb("ai_metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const contentStandardMappings = pgTable("content_standard_mappings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: uuid("content_id").references(() => content.id).notNull(),
  standardObjectiveId: uuid("standard_objective_id").references(() => standardObjectives.id).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const boardExams = pgTable("board_exams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalQuestions: integer("total_questions").notNull(),
  timeLimit: integer("time_limit"), // in minutes
  settings: jsonb("settings"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const examQuestions = pgTable("exam_questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  boardExamId: uuid("board_exam_id").references(() => boardExams.id),
  contentId: uuid("content_id").references(() => content.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty"),
  subject: text("subject"),
  topic: text("topic"),
  createdAt: timestamp("created_at").defaultNow()
});

export const examQuestionStandardMappings = pgTable("exam_question_standard_mappings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").references(() => examQuestions.id).notNull(),
  standardObjectiveId: uuid("standard_objective_id").references(() => standardObjectives.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// New Educational Standards Framework System
// Educational standards frameworks (USMLE, LCME, NBDE, etc.)
export const standardsFrameworks = pgTable("standards_frameworks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  educationalArea: text("educational_area").notNull(), // medical_school, dental_school, etc.
  frameworkType: text("framework_type").notNull(), // board_exam, accreditation, internal
  isOfficial: boolean("is_official").default(true), // true for official standards, false for custom
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // null for official standards
  version: text("version").default("1.0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Standards subjects (top level categories)
export const standardsSubjects = pgTable("standards_subjects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkId: uuid("framework_id").notNull().references(() => standardsFrameworks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"), // Subject code like "ANAT" for Anatomy
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Standards topics (second level)
export const standardsTopics = pgTable("standards_topics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: uuid("subject_id").notNull().references(() => standardsSubjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"), // Topic code
  learningObjectives: text("learning_objectives").array().default(sql`'{}'::text[]`),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Standards subtopics (third level)
export const standardsSubtopics = pgTable("standards_subtopics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: uuid("topic_id").notNull().references(() => standardsTopics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"), // Subtopic code
  learningObjectives: text("learning_objectives").array().default(sql`'{}'::text[]`),
  competencyLevel: text("competency_level"), // beginner, intermediate, advanced
  assessmentCriteria: text("assessment_criteria").array().default(sql`'{}'::text[]`),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Document uploads for AI-powered standards creation
export const standardsDocuments = pgTable("standards_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  frameworkId: uuid("framework_id").references(() => standardsFrameworks.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
  processingStatus: text("processing_status").default("pending"), // pending, processing, completed, failed
  extractedContent: text("extracted_content"),
  aiAnalysis: jsonb("ai_analysis"), // AI-generated structure and content
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const studentExamAttempts = pgTable("student_exam_attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => users.id).notNull(),
  boardExamId: uuid("board_exam_id").references(() => boardExams.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: decimal("score", { precision: 5, scale: 2 }),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  timeSpent: integer("time_spent"), // in minutes
  isCompleted: boolean("is_completed").default(false)
});

export const studentAnswers = pgTable("student_answers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptId: uuid("attempt_id").references(() => studentExamAttempts.id).notNull(),
  questionId: uuid("question_id").references(() => examQuestions.id).notNull(),
  selectedAnswer: text("selected_answer"),
  confidenceLevel: confidenceLevelEnum("confidence_level"),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"), // in seconds
  answeredAt: timestamp("answered_at").defaultNow()
});

export const ragDocuments = pgTable("rag_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  documentType: text("document_type").notNull(), // standards, course_specific, internal
  courseId: uuid("course_id").references(() => courses.id), // for course-specific documents
  isProcessed: boolean("is_processed").default(false),
  chunks: jsonb("chunks"), // Processed text chunks
  embeddings: jsonb("embeddings"), // Vector embeddings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const aiAgentSessions = pgTable("ai_agent_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sessionType: text("session_type").notNull(), // categorization, student_support, analysis
  context: jsonb("context"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const studentProgress = pgTable("student_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => users.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  standardObjectiveId: uuid("standard_objective_id").references(() => standardObjectives.id).notNull(),
  masteryLevel: decimal("mastery_level", { precision: 3, scale: 2 }),
  lastAccessedAt: timestamp("last_accessed_at"),
  totalTimeSpent: integer("total_time_spent"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Notifications system for super admin and tenant notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: uuid("from_user_id").references(() => users.id).notNull(),
  toUserId: uuid("to_user_id").references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id), // For tenant-wide notifications
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "info", "warning", "deadline", "action_required", "system"
  priority: text("priority").notNull().default("normal"), // "low", "normal", "high", "urgent"
  isRead: boolean("is_read").default(false),
  emailSent: boolean("email_sent").default(false),
  actionUrl: text("action_url"), // Optional URL for actions
  expiresAt: timestamp("expires_at"), // For deadline notifications
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at")
});

// Notification Recipients table for bulk notifications
export const notificationRecipients = pgTable("notification_recipients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationId: uuid("notification_id").references(() => notifications.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  isRead: boolean("is_read").default(false),
  emailSent: boolean("email_sent").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// System Analytics table for super admin dashboard metrics
export const systemAnalytics = pgTable("system_analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  metricType: text("metric_type").notNull(), // "user_login", "framework_created", "content_mapped", etc.
  metricValue: integer("metric_value").default(1),
  metadata: jsonb("metadata"), // Additional context data
  recordedAt: timestamp("recorded_at").defaultNow()
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  standards: many(standards),
  lmsIntegrations: many(lmsIntegrations),
  courses: many(courses),
  content: many(content),
  boardExams: many(boardExams),
  ragDocuments: many(ragDocuments),
  aiAgentSessions: many(aiAgentSessions)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id]
  }),
  courseEnrollments: many(courseEnrollments),
  createdBoardExams: many(boardExams),
  examAttempts: many(studentExamAttempts),
  uploadedDocuments: many(ragDocuments),
  aiSessions: many(aiAgentSessions),
  progress: many(studentProgress)
}));

export const standardsRelations = relations(standards, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [standards.tenantId],
    references: [tenants.id]
  }),
  objectives: many(standardObjectives)
}));

export const standardObjectivesRelations = relations(standardObjectives, ({ one, many }) => ({
  standard: one(standards, {
    fields: [standardObjectives.standardId],
    references: [standards.id]
  }),
  parent: one(standardObjectives, {
    fields: [standardObjectives.parentId],
    references: [standardObjectives.id]
  }),
  children: many(standardObjectives),
  contentMappings: many(contentStandardMappings),
  questionMappings: many(examQuestionStandardMappings),
  studentProgress: many(studentProgress)
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [courses.tenantId],
    references: [tenants.id]
  }),
  lmsIntegration: one(lmsIntegrations, {
    fields: [courses.lmsIntegrationId],
    references: [lmsIntegrations.id]
  }),
  enrollments: many(courseEnrollments),
  content: many(content),
  boardExams: many(boardExams),
  ragDocuments: many(ragDocuments),
  studentProgress: many(studentProgress)
}));

export const contentRelations = relations(content, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [content.tenantId],
    references: [tenants.id]
  }),
  course: one(courses, {
    fields: [content.courseId],
    references: [courses.id]
  }),
  lmsIntegration: one(lmsIntegrations, {
    fields: [content.lmsIntegrationId],
    references: [lmsIntegrations.id]
  }),
  standardMappings: many(contentStandardMappings),
  examQuestions: many(examQuestions)
}));

// Insert Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true
});

export const insertStandardSchema = createInsertSchema(standards).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBoardExamSchema = createInsertSchema(boardExams).omit({
  id: true,
  createdAt: true
});

export const insertExamQuestionSchema = createInsertSchema(examQuestions).omit({
  id: true,
  createdAt: true
});

export const insertRAGDocumentSchema = createInsertSchema(ragDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserInvitationSchema = createInsertSchema(userInvitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  isAccepted: true
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserInvitation = typeof userInvitations.$inferSelect;
export type InsertUserInvitation = z.infer<typeof insertUserInvitationSchema>;

export type Standard = typeof standards.$inferSelect;
export type InsertStandard = z.infer<typeof insertStandardSchema>;

export type StandardObjective = typeof standardObjectives.$inferSelect;

export type Course = typeof courses.$inferSelect;

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type BoardExam = typeof boardExams.$inferSelect;
export type InsertBoardExam = z.infer<typeof insertBoardExamSchema>;

export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = z.infer<typeof insertExamQuestionSchema>;

export type StudentExamAttempt = typeof studentExamAttempts.$inferSelect;

// Standards Framework schemas
export const insertStandardsFrameworkSchema = createInsertSchema(standardsFrameworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertStandardsFramework = z.infer<typeof insertStandardsFrameworkSchema>;
export type SelectStandardsFramework = typeof standardsFrameworks.$inferSelect;

export const insertStandardsSubjectSchema = createInsertSchema(standardsSubjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertStandardsSubject = z.infer<typeof insertStandardsSubjectSchema>;
export type SelectStandardsSubject = typeof standardsSubjects.$inferSelect;

export const insertStandardsTopicSchema = createInsertSchema(standardsTopics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertStandardsTopic = z.infer<typeof insertStandardsTopicSchema>;
export type SelectStandardsTopic = typeof standardsTopics.$inferSelect;

export const insertStandardsSubtopicSchema = createInsertSchema(standardsSubtopics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertStandardsSubtopic = z.infer<typeof insertStandardsSubtopicSchema>;
export type SelectStandardsSubtopic = typeof standardsSubtopics.$inferSelect;

export const insertStandardsDocumentSchema = createInsertSchema(standardsDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertStandardsDocument = z.infer<typeof insertStandardsDocumentSchema>;
export type SelectStandardsDocument = typeof standardsDocuments.$inferSelect;

// Notification schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  emailSent: true,
  readAt: true,
  createdAt: true
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SelectNotification = typeof notifications.$inferSelect;

export const insertNotificationRecipientSchema = createInsertSchema(notificationRecipients).omit({
  id: true,
  isRead: true,
  emailSent: true,
  readAt: true,
  createdAt: true
});
export type InsertNotificationRecipient = z.infer<typeof insertNotificationRecipientSchema>;
export type SelectNotificationRecipient = typeof notificationRecipients.$inferSelect;

// System Analytics schemas
export const insertSystemAnalyticsSchema = createInsertSchema(systemAnalytics).omit({
  id: true,
  recordedAt: true
});
export type InsertSystemAnalytics = z.infer<typeof insertSystemAnalyticsSchema>;
export type SelectSystemAnalytics = typeof systemAnalytics.$inferSelect;

export type RAGDocument = typeof ragDocuments.$inferSelect;
export type InsertRAGDocument = z.infer<typeof insertRAGDocumentSchema>;
