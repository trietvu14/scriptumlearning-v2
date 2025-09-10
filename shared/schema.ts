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
  pgEnum,
  vector
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
  tenantId: uuid("tenant_id").references(() => tenants.id), // Nullable for super_admin users
  email: text("email").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRoleEnum("role").notNull(),
  title: text("title"), // Job title/position
  department: text("department"), // Department or division
  phoneNumber: text("phone_number"), // Contact phone
  officeLocation: text("office_location"), // Office or room number
  bio: text("bio"), // Brief professional bio
  profileImageUrl: text("profile_image_url"), // Profile picture URL
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
  embedding: vector("embedding", { dimensions: 3072 }), // OpenAI text-embedding-3-large dimensions
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

// Standards topics (second level) - Now supports nested hierarchy
export const standardsTopics: any = pgTable("standards_topics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: uuid("subject_id").notNull().references(() => standardsSubjects.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): any => standardsTopics.id, { onDelete: "cascade" }), // For nested subtopics
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"), // Topic code
  level: integer("level").default(1), // 1=Topic, 2=Subtopic, 3=Sub-subtopic, etc.
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

// Content embeddings for AI similarity search
export const contentEmbeddings = pgTable("content_embeddings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: uuid("content_id").notNull(), // Reference to topic, subtopic, or document
  contentType: text("content_type").notNull(), // 'topic', 'subtopic', 'document', 'learning_objective'
  contentText: text("content_text").notNull(),
  embedding: vector("embedding", { dimensions: 3072 }).notNull(), // OpenAI text-embedding-3-large dimensions
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// RAG document stores for different content types
export const ragDocuments = pgTable("rag_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  frameworkId: uuid("framework_id").references(() => standardsFrameworks.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(), // 'curriculum', 'standards', 'learning_materials', 'assessments'
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  sourceDocument: text("source_document"),
  chunkIndex: integer("chunk_index").default(0), // For large documents split into chunks
  totalChunks: integer("total_chunks").default(1),
  embedding: vector("embedding", { dimensions: 3072 }), // OpenAI text-embedding-3-large dimensions
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// AI analysis results for content categorization
export const aiAnalysisResults = pgTable("ai_analysis_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: uuid("content_id").notNull(),
  contentType: text("content_type").notNull(), // 'topic', 'subtopic', 'document', 'curriculum'
  analysisType: text("analysis_type").notNull(), // 'categorization', 'standards_mapping', 'quality_assessment'
  categories: text("categories").array().default(sql`'{}'::text[]`),
  suggestedStandards: text("suggested_standards").array().default(sql`'{}'::text[]`),
  keyTopics: text("key_topics").array().default(sql`'{}'::text[]`),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.00"),
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }).default("0.00"),
  analysisMetadata: jsonb("analysis_metadata").default(sql`'{}'::jsonb`),
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


export const aiAgentSessions = pgTable("ai_agent_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sessionType: text("session_type").notNull(), // categorization, student_support, analysis, insights
  title: text("title"),
  context: jsonb("context"),
  conversationHistory: jsonb("conversation_history").default(sql`'[]'::jsonb`),
  dashboardConfig: jsonb("dashboard_config"),
  generatedAnalytics: jsonb("generated_analytics"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// AI Insights conversation messages for short-term memory
export const aiConversationMessages = pgTable("ai_conversation_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").references(() => aiAgentSessions.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  messageType: text("message_type").notNull(), // 'text', 'analytics_request', 'dashboard_generation', 'data_query'
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  toolCalls: jsonb("tool_calls"),
  toolResults: jsonb("tool_results"),
  createdAt: timestamp("created_at").defaultNow()
});

// AI Insights analytics requests and generated dashboards
export const aiInsightsRequests = pgTable("ai_insights_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").references(() => aiAgentSessions.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  requestType: text("request_type").notNull(), // 'dashboard', 'analytics', 'insights', 'reports'
  query: text("query").notNull(),
  processedQuery: text("processed_query"),
  analysisScope: jsonb("analysis_scope"), // What data to analyze
  generatedConfig: jsonb("generated_config"), // Dashboard/chart configuration
  executionPlan: jsonb("execution_plan"), // Steps to generate the insights
  results: jsonb("results"),
  status: text("status").default("pending"), // pending, processing, completed, failed
  processingTime: integer("processing_time"), // in milliseconds
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// AI Categorization Jobs for batch processing
export const aiCategorizationJobs = pgTable("ai_categorization_jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  initiatedBy: uuid("initiated_by").references(() => users.id).notNull(),
  jobType: text("job_type").notNull(), // single_content, bulk_content, document_analysis
  status: text("status").default("pending"), // pending, processing, completed, failed, cancelled
  totalItems: integer("total_items").default(0),
  processedItems: integer("processed_items").default(0),
  successItems: integer("success_items").default(0),
  failedItems: integer("failed_items").default(0),
  settings: jsonb("settings"), // AI categorization preferences and parameters
  results: jsonb("results"), // Summary of categorization results
  errorMessages: text("error_messages").array().default(sql`'{}'::text[]`),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// AI Training Data for improving categorization accuracy
export const aiTrainingData = pgTable("ai_training_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  contentId: uuid("content_id").references(() => content.id),
  standardObjectiveId: uuid("standard_objective_id").references(() => standardObjectives.id),
  humanLabel: text("human_label").notNull(), // Human-verified classification
  aiPrediction: text("ai_prediction"), // AI's prediction
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // AI confidence score
  isCorrect: boolean("is_correct"), // Whether AI prediction matches human label
  feedback: text("feedback"), // Additional human feedback
  trainingContext: jsonb("training_context"), // Context used for training
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// AI Model Performance tracking
export const aiModelMetrics = pgTable("ai_model_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  modelVersion: text("model_version").notNull(),
  metricType: text("metric_type").notNull(), // accuracy, precision, recall, f1_score
  metricValue: decimal("metric_value", { precision: 5, scale: 4 }).notNull(),
  category: text("category"), // content_type, educational_area, etc.
  sampleSize: integer("sample_size"),
  evaluationDate: timestamp("evaluation_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
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

// INBDE-specific curriculum mapping tables
export const inbdeFoundationKnowledge = pgTable("inbde_foundation_knowledge", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fkNumber: integer("fk_number").notNull(), // 1-10
  name: text("name").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const inbdeClinicalContent = pgTable("inbde_clinical_content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ccNumber: integer("cc_number").notNull(), // 1-56
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "Diagnosis and Treatment Planning", "Oral Health Management", "Practice and Profession"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Content mapping to INBDE matrix (FK x CC)
export const inbdeContentMappings = pgTable("inbde_content_mappings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  contentId: uuid("content_id").references(() => content.id).notNull(),
  fkId: uuid("fk_id").references(() => inbdeFoundationKnowledge.id).notNull(),
  ccId: uuid("cc_id").references(() => inbdeClinicalContent.id).notNull(),
  alignmentStrength: decimal("alignment_strength", { precision: 3, scale: 2 }).default("1.00"), // 0.00-1.00
  isAiGenerated: boolean("is_ai_generated").default(false),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Curriculum mapping statistics cache for performance
export const inbdeMappingStats = pgTable("inbde_mapping_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id),
  fkId: uuid("fk_id").references(() => inbdeFoundationKnowledge.id).notNull(),
  ccId: uuid("cc_id").references(() => inbdeClinicalContent.id).notNull(),
  contentCount: integer("content_count").default(0),
  totalContentCount: integer("total_content_count").default(0),
  coveragePercentage: decimal("coverage_percentage", { precision: 5, scale: 2 }).default("0.00"),
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
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

// INBDE types and schemas
export const insertINBDEFoundationKnowledgeSchema = createInsertSchema(inbdeFoundationKnowledge).omit({
  id: true,
  createdAt: true
});

export const insertINBDEClinicalContentSchema = createInsertSchema(inbdeClinicalContent).omit({
  id: true,
  createdAt: true
});

export const insertINBDEContentMappingSchema = createInsertSchema(inbdeContentMappings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type INBDEFoundationKnowledge = typeof inbdeFoundationKnowledge.$inferSelect;
export type InsertINBDEFoundationKnowledge = z.infer<typeof insertINBDEFoundationKnowledgeSchema>;

export type INBDEClinicalContent = typeof inbdeClinicalContent.$inferSelect;
export type InsertINBDEClinicalContent = z.infer<typeof insertINBDEClinicalContentSchema>;

export type INBDEContentMapping = typeof inbdeContentMappings.$inferSelect;
export type InsertINBDEContentMapping = z.infer<typeof insertINBDEContentMappingSchema>;

export type INBDEMappingStats = typeof inbdeMappingStats.$inferSelect;

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

// AI Categorization Job schemas
export const insertAICategorizationJobSchema = createInsertSchema(aiCategorizationJobs).omit({
  id: true,
  processedItems: true,
  successItems: true,
  failedItems: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true
});
export type InsertAICategorizationJob = z.infer<typeof insertAICategorizationJobSchema>;
export type SelectAICategorizationJob = typeof aiCategorizationJobs.$inferSelect;

// AI Training Data schemas
export const insertAITrainingDataSchema = createInsertSchema(aiTrainingData).omit({
  id: true,
  createdAt: true
});
export type InsertAITrainingData = z.infer<typeof insertAITrainingDataSchema>;
export type SelectAITrainingData = typeof aiTrainingData.$inferSelect;

// AI Model Metrics schemas
export const insertAIModelMetricsSchema = createInsertSchema(aiModelMetrics).omit({
  id: true,
  evaluationDate: true,
  createdAt: true
});
export type InsertAIModelMetrics = z.infer<typeof insertAIModelMetricsSchema>;
export type SelectAIModelMetrics = typeof aiModelMetrics.$inferSelect;

// AI Agent Session schemas
export const insertAIAgentSessionSchema = createInsertSchema(aiAgentSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertAIAgentSession = z.infer<typeof insertAIAgentSessionSchema>;
export type SelectAIAgentSession = typeof aiAgentSessions.$inferSelect;

// AI Conversation Message schemas
export const insertAIConversationMessageSchema = createInsertSchema(aiConversationMessages).omit({
  id: true,
  createdAt: true
});
export type InsertAIConversationMessage = z.infer<typeof insertAIConversationMessageSchema>;
export type SelectAIConversationMessage = typeof aiConversationMessages.$inferSelect;

// AI Insights Request schemas
export const insertAIInsightsRequestSchema = createInsertSchema(aiInsightsRequests).omit({
  id: true,
  processingTime: true,
  createdAt: true,
  completedAt: true
});
export type InsertAIInsightsRequest = z.infer<typeof insertAIInsightsRequestSchema>;
export type SelectAIInsightsRequest = typeof aiInsightsRequests.$inferSelect;
