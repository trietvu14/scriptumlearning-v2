import { apiRequest } from "./queryClient";

export const api = {
  // Authentication
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  register: async (userData: any) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await apiRequest("GET", "/api/dashboard/stats");
    return response.json();
  },

  // Standards
  getStandards: async () => {
    const response = await apiRequest("GET", "/api/standards");
    return response.json();
  },

  createStandard: async (standardData: any) => {
    const response = await apiRequest("POST", "/api/standards", standardData);
    return response.json();
  },

  // Content
  getContent: async (courseId?: string) => {
    const url = courseId ? `/api/content?courseId=${courseId}` : "/api/content";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  createContent: async (contentData: any) => {
    const response = await apiRequest("POST", "/api/content", contentData);
    return response.json();
  },

  // Board Exams
  getBoardExams: async () => {
    const response = await apiRequest("GET", "/api/board-exams");
    return response.json();
  },

  createBoardExam: async (examData: any) => {
    const response = await apiRequest("POST", "/api/board-exams", examData);
    return response.json();
  },

  generateQuestions: async (examId: string, specs: any) => {
    const response = await apiRequest("POST", `/api/board-exams/${examId}/generate-questions`, specs);
    return response.json();
  },

  // LMS Integrations
  getLMSIntegrations: async () => {
    const response = await apiRequest("GET", "/api/lms-integrations");
    return response.json();
  },

  syncLMS: async (integrationId: string) => {
    const response = await apiRequest("POST", `/api/lms-integrations/${integrationId}/sync`);
    return response.json();
  },

  // RAG Documents
  getRAGDocuments: async () => {
    const response = await apiRequest("GET", "/api/rag-documents");
    return response.json();
  },

  uploadRAGDocument: async (documentData: any) => {
    const response = await apiRequest("POST", "/api/rag-documents", documentData);
    return response.json();
  },

  // Student Progress
  getStudentProgress: async (studentId: string) => {
    const response = await apiRequest("GET", `/api/students/${studentId}/progress`);
    return response.json();
  }
};
