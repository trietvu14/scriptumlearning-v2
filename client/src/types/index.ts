export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "school_admin" | "faculty" | "administrative_support" | "student";
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  educationalArea: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  contentMapped: number;
  totalContent: number;
  boardReadiness: number;
  aiInsights: number;
}

export interface Standard {
  id: string;
  name: string;
  type: "usmle" | "lcme" | "inbde" | "coda" | "internal";
  description?: string;
  version?: string;
  isActive: boolean;
}

export interface StandardObjective {
  id: string;
  standardId: string;
  code: string;
  title: string;
  description?: string;
  parentId?: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: "video" | "document" | "image" | "quiz" | "lecture" | "assignment";
  content?: any;
  fileUrl?: string;
  aiCategorized: boolean;
  aiMetadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ContentMapping {
  id: string;
  contentId: string;
  standardObjectiveId: string;
  confidence: number;
  isAiGenerated: boolean;
}

export interface BoardExam {
  id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  timeLimit?: number;
  settings?: any;
  isActive: boolean;
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  subject?: string;
  topic?: string;
}

export interface LMSIntegration {
  id: string;
  name: string;
  type: "canvas" | "blackboard" | "moodle";
  apiUrl: string;
  isActive: boolean;
  lastSyncAt?: string;
}

export interface Activity {
  id: string;
  type: "content_mapped" | "exam_generated" | "lms_sync" | "user_action";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconColor: string;
}
