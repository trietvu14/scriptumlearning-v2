import { OpenAI } from 'openai';
import { db } from '../db';
import { 
  aiAgentSessions, 
  aiConversationMessages, 
  aiInsightsRequests,
  tenants,
  users,
  content,
  courses,
  standards,
  standardObjectives,
  contentStandardMappings,
  studentExamAttempts,
  studentAnswers,
  examQuestions,
  boardExams
} from '@shared/schema';
import { eq, and, sql, desc, count, avg, sum } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ConversationContext {
  sessionId: string;
  userId: string;
  tenantId: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: any;
  }>;
  dashboardConfig?: any;
  generatedAnalytics?: any;
}

export interface AnalyticsRequest {
  query: string;
  requestType: 'dashboard' | 'analytics' | 'insights' | 'reports';
  analysisScope?: {
    timeRange?: { start: Date; end: Date };
    dataTypes?: string[];
    filters?: any;
  };
}

export interface DashboardConfig {
  title: string;
  description: string;
  charts: Array<{
    id: string;
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'metric';
    title: string;
    dataSource: string;
    config: any;
  }>;
  metrics: Array<{
    id: string;
    title: string;
    value: number | string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
  }>;
}

export class AgenticAIService {
  /**
   * Create or resume AI conversation session
   */
  async createOrResumeSession(
    userId: string, 
    tenantId: string, 
    sessionId?: string
  ): Promise<ConversationContext> {
    try {
      let session;
      
      if (sessionId) {
        // Try to resume existing session
        const sessions = await db
          .select()
          .from(aiAgentSessions)
          .where(and(
            eq(aiAgentSessions.id, sessionId),
            eq(aiAgentSessions.userId, userId),
            eq(aiAgentSessions.tenantId, tenantId),
            eq(aiAgentSessions.isActive, true)
          ))
          .limit(1);
          
        session = sessions[0];
      }
      
      if (!session) {
        // Create new session
        const newSessions = await db
          .insert(aiAgentSessions)
          .values({
            tenantId,
            userId,
            sessionType: 'insights',
            title: 'AI Insights Conversation',
            context: {},
            conversationHistory: [],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          })
          .returning();
          
        session = newSessions[0];
      }
      
      // Load conversation history
      const messages = await db
        .select()
        .from(aiConversationMessages)
        .where(eq(aiConversationMessages.sessionId, session.id))
        .orderBy(aiConversationMessages.createdAt);
        
      const conversationHistory = messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        metadata: msg.metadata
      }));
      
      return {
        sessionId: session.id,
        userId: session.userId,
        tenantId: session.tenantId,
        conversationHistory,
        dashboardConfig: session.dashboardConfig as any,
        generatedAnalytics: session.generatedAnalytics as any
      };
    } catch (error: any) {
      console.error('Error creating/resuming session:', error);
      throw new Error(`Failed to create/resume session: ${error.message}`);
    }
  }
  
  /**
   * Process user message and generate AI response with analytics
   */
  async processMessage(
    context: ConversationContext,
    userMessage: string
  ): Promise<{
    response: string;
    dashboardConfig?: DashboardConfig;
    analytics?: any;
    updatedContext: ConversationContext;
  }> {
    try {
      // Save user message
      await this.saveMessage(context.sessionId, 'user', userMessage, 'text');
      
      // Analyze user intent and determine if analytics generation is needed
      const intent = await this.analyzeUserIntent(userMessage, context);
      
      let response: string;
      let dashboardConfig: DashboardConfig | undefined;
      let analytics: any;
      
      if (intent.requiresAnalytics) {
        // Generate analytics request
        const insightsRequest = await this.createInsightsRequest(
          context,
          userMessage,
          intent.requestType,
          intent.analysisScope
        );
        
        // Execute analytics generation
        const results = await this.executeAnalyticsRequest(insightsRequest);
        
        response = results.response;
        dashboardConfig = results.dashboardConfig;
        analytics = results.analytics;
        
        // Update session with generated analytics
        await this.updateSessionAnalytics(context.sessionId, dashboardConfig, analytics);
      } else {
        // Generate conversational response
        response = await this.generateConversationalResponse(userMessage, context);
      }
      
      // Save assistant response
      await this.saveMessage(context.sessionId, 'assistant', response, 
        dashboardConfig ? 'dashboard_generation' : 'text', 
        { dashboardConfig, analytics });
      
      // Update conversation history
      const updatedContext = {
        ...context,
        conversationHistory: [
          ...context.conversationHistory,
          {
            role: 'user' as const,
            content: userMessage,
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant' as const,
            content: response,
            timestamp: new Date().toISOString(),
            metadata: { dashboardConfig, analytics }
          }
        ],
        dashboardConfig: dashboardConfig || context.dashboardConfig,
        generatedAnalytics: analytics || context.generatedAnalytics
      };
      
      return {
        response,
        dashboardConfig,
        analytics,
        updatedContext
      };
    } catch (error: any) {
      console.error('Error processing message:', error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }
  
  /**
   * Analyze user intent to determine if analytics generation is needed
   */
  private async analyzeUserIntent(
    message: string, 
    context: ConversationContext
  ): Promise<{
    requiresAnalytics: boolean;
    requestType: 'dashboard' | 'analytics' | 'insights' | 'reports';
    analysisScope: any;
    confidence: number;
  }> {
    try {
      const prompt = `Analyze this user message in the context of an educational analytics platform:

User Message: "${message}"

Conversation Context: ${JSON.stringify(context.conversationHistory.slice(-3))}

Determine if this message requires analytics generation (dashboard, charts, metrics, reports) or is a general conversation.

Response with JSON:
{
  "requiresAnalytics": boolean,
  "requestType": "dashboard" | "analytics" | "insights" | "reports",
  "analysisScope": {
    "dataTypes": ["students", "courses", "content", "standards", "exams"],
    "timeRange": "last_30_days" | "last_semester" | "all_time",
    "metrics": ["performance", "engagement", "completion", "standards_mapping"]
  },
  "confidence": 0.0-1.0
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that analyzes user requests for educational analytics and insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });
      
      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        requiresAnalytics: analysis.requiresAnalytics || false,
        requestType: analysis.requestType || 'insights',
        analysisScope: analysis.analysisScope || {},
        confidence: analysis.confidence || 0.5
      };
    } catch (error: any) {
      console.error('Error analyzing user intent:', error);
      return {
        requiresAnalytics: false,
        requestType: 'insights',
        analysisScope: {},
        confidence: 0.0
      };
    }
  }
  
  /**
   * Create insights request for analytics generation
   */
  private async createInsightsRequest(
    context: ConversationContext,
    query: string,
    requestType: 'dashboard' | 'analytics' | 'insights' | 'reports',
    analysisScope: any
  ) {
    const requests = await db
      .insert(aiInsightsRequests)
      .values({
        sessionId: context.sessionId,
        tenantId: context.tenantId,
        userId: context.userId,
        requestType,
        query,
        analysisScope,
        status: 'pending'
      })
      .returning();
      
    return requests[0];
  }
  
  /**
   * Execute analytics request and generate dashboard/insights
   */
  private async executeAnalyticsRequest(request: any): Promise<{
    response: string;
    dashboardConfig?: DashboardConfig;
    analytics: any;
  }> {
    try {
      // Update status to processing
      await db
        .update(aiInsightsRequests)
        .set({ status: 'processing' })
        .where(eq(aiInsightsRequests.id, request.id));
      
      const startTime = Date.now();
      
      // Fetch relevant data based on analysis scope
      const data = await this.fetchAnalyticsData(request.tenantId, request.analysisScope);
      
      // Generate AI-powered insights and dashboard configuration
      const insights = await this.generateInsights(request.query, data);
      
      const processingTime = Date.now() - startTime;
      
      // Update request with results
      await db
        .update(aiInsightsRequests)
        .set({ 
          status: 'completed',
          results: insights,
          processingTime,
          completedAt: new Date()
        })
        .where(eq(aiInsightsRequests.id, request.id));
      
      return insights;
    } catch (error: any) {
      console.error('Error executing analytics request:', error);
      
      await db
        .update(aiInsightsRequests)
        .set({ 
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date()
        })
        .where(eq(aiInsightsRequests.id, request.id));
      
      throw error;
    }
  }
  
  /**
   * Fetch analytics data from database
   */
  private async fetchAnalyticsData(tenantId: string, analysisScope: any) {
    try {
      const data: any = {};
      
      // Student performance data
      if (analysisScope.dataTypes?.includes('students') || !analysisScope.dataTypes) {
        data.studentStats = await db
          .select({
            totalStudents: count(),
            averageScore: avg(studentExamAttempts.score)
          })
          .from(studentExamAttempts)
          .innerJoin(users, eq(users.id, studentExamAttempts.studentId))
          .where(eq(users.tenantId, tenantId));
      }
      
      // Course data
      if (analysisScope.dataTypes?.includes('courses') || !analysisScope.dataTypes) {
        data.courseStats = await db
          .select({
            totalCourses: count(),
            activeCourses: sum(sql`CASE WHEN ${courses.isActive} THEN 1 ELSE 0 END`)
          })
          .from(courses)
          .where(eq(courses.tenantId, tenantId));
      }
      
      // Content data
      if (analysisScope.dataTypes?.includes('content') || !analysisScope.dataTypes) {
        data.contentStats = await db
          .select({
            totalContent: count(),
            aiCategorized: sum(sql`CASE WHEN ${content.aiCategorized} THEN 1 ELSE 0 END`)
          })
          .from(content)
          .where(eq(content.tenantId, tenantId));
      }
      
      // Standards mapping data
      if (analysisScope.dataTypes?.includes('standards') || !analysisScope.dataTypes) {
        data.standardsStats = await db
          .select({
            totalMappings: count(),
            averageConfidence: avg(contentStandardMappings.confidence)
          })
          .from(contentStandardMappings)
          .innerJoin(content, eq(content.id, contentStandardMappings.contentId))
          .where(eq(content.tenantId, tenantId));
      }
      
      // Exam performance data
      if (analysisScope.dataTypes?.includes('exams') || !analysisScope.dataTypes) {
        data.examStats = await db
          .select({
            totalAttempts: count(),
            averageScore: avg(studentExamAttempts.score),
            completionRate: avg(sql`CASE WHEN ${studentExamAttempts.isCompleted} THEN 1.0 ELSE 0.0 END`)
          })
          .from(studentExamAttempts)
          .innerJoin(users, eq(users.id, studentExamAttempts.studentId))
          .where(eq(users.tenantId, tenantId));
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }
  }
  
  /**
   * Generate AI-powered insights and dashboard configuration
   */
  private async generateInsights(query: string, data: any): Promise<{
    response: string;
    dashboardConfig?: DashboardConfig;
    analytics: any;
  }> {
    try {
      const prompt = `Generate educational insights and dashboard configuration based on this data:

Query: "${query}"

Data: ${JSON.stringify(data, null, 2)}

Create a comprehensive response that includes:
1. Natural language insights answering the user's query
2. Dashboard configuration with relevant charts and metrics
3. Key analytics findings

Response with JSON:
{
  "response": "Natural language response with insights...",
  "dashboardConfig": {
    "title": "Dashboard Title",
    "description": "Dashboard description",
    "charts": [
      {
        "id": "chart1",
        "type": "bar|line|pie|metric",
        "title": "Chart Title",
        "dataSource": "studentStats|courseStats|contentStats|standardsStats|examStats",
        "config": { "xAxis": "...", "yAxis": "...", "data": [...] }
      }
    ],
    "metrics": [
      {
        "id": "metric1",
        "title": "Metric Title",
        "value": "value",
        "trend": "up|down|stable",
        "trendValue": 5.2
      }
    ]
  },
  "analytics": {
    "summary": "Key findings summary",
    "recommendations": ["rec1", "rec2"],
    "trends": {...},
    "insights": {...}
  }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational analytics expert that generates insights and dashboard configurations from institutional data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      
      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        response: result.response || "I've analyzed your data and generated insights.",
        dashboardConfig: result.dashboardConfig,
        analytics: result.analytics || {}
      };
    } catch (error: any) {
      console.error('Error generating insights:', error);
      throw new Error(`Failed to generate insights: ${error.message}`);
    }
  }
  
  /**
   * Generate conversational response for non-analytics queries
   */
  private async generateConversationalResponse(
    message: string, 
    context: ConversationContext
  ): Promise<string> {
    try {
      const conversationHistory = context.conversationHistory.slice(-10); // Last 10 messages
      
      const prompt = `You are an AI assistant for an educational curriculum management platform called Scriptum Learning. 

Conversation history:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User: ${message}

Provide a helpful response about curriculum management, analytics, standards mapping, or educational insights. Be conversational and helpful.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for educational institutions using Scriptum Learning platform."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return response.choices[0].message.content || "I'm here to help with your educational analytics and curriculum management needs.";
    } catch (error: any) {
      console.error('Error generating conversational response:', error);
      return "I'm having trouble processing your request right now. Please try again.";
    }
  }
  
  /**
   * Save conversation message to database
   */
  private async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    messageType: string,
    metadata?: any
  ) {
    await db.insert(aiConversationMessages).values({
      sessionId,
      role,
      content,
      messageType,
      metadata: metadata || {}
    });
  }
  
  /**
   * Update session with generated analytics
   */
  private async updateSessionAnalytics(
    sessionId: string,
    dashboardConfig?: DashboardConfig,
    analytics?: any
  ) {
    const updates: any = { updatedAt: new Date() };
    
    if (dashboardConfig) {
      updates.dashboardConfig = dashboardConfig;
    }
    
    if (analytics) {
      updates.generatedAnalytics = analytics;
    }
    
    await db
      .update(aiAgentSessions)
      .set(updates)
      .where(eq(aiAgentSessions.id, sessionId));
  }
  
  /**
   * Get session history with analytics
   */
  async getSessionHistory(sessionId: string, userId: string): Promise<ConversationContext | null> {
    try {
      const sessions = await db
        .select()
        .from(aiAgentSessions)
        .where(and(
          eq(aiAgentSessions.id, sessionId),
          eq(aiAgentSessions.userId, userId),
          eq(aiAgentSessions.isActive, true)
        ))
        .limit(1);
        
      if (sessions.length === 0) {
        return null;
      }
      
      const session = sessions[0];
      
      const messages = await db
        .select()
        .from(aiConversationMessages)
        .where(eq(aiConversationMessages.sessionId, sessionId))
        .orderBy(aiConversationMessages.createdAt);
        
      const conversationHistory = messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        metadata: msg.metadata
      }));
      
      return {
        sessionId: session.id,
        userId: session.userId,
        tenantId: session.tenantId,
        conversationHistory,
        dashboardConfig: session.dashboardConfig as any,
        generatedAnalytics: session.generatedAnalytics as any
      };
    } catch (error: any) {
      console.error('Error getting session history:', error);
      return null;
    }
  }
  
  /**
   * List user's active sessions
   */
  async getUserSessions(userId: string, tenantId: string) {
    try {
      const sessions = await db
        .select({
          id: aiAgentSessions.id,
          title: aiAgentSessions.title,
          sessionType: aiAgentSessions.sessionType,
          createdAt: aiAgentSessions.createdAt,
          updatedAt: aiAgentSessions.updatedAt
        })
        .from(aiAgentSessions)
        .where(and(
          eq(aiAgentSessions.userId, userId),
          eq(aiAgentSessions.tenantId, tenantId),
          eq(aiAgentSessions.isActive, true)
        ))
        .orderBy(desc(aiAgentSessions.updatedAt))
        .limit(20);
        
      return sessions;
    } catch (error: any) {
      console.error('Error getting user sessions:', error);
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }
  
  /**
   * End session
   */
  async endSession(sessionId: string, userId: string) {
    await db
      .update(aiAgentSessions)
      .set({ 
        isActive: false, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(aiAgentSessions.id, sessionId),
        eq(aiAgentSessions.userId, userId)
      ));
  }
}

export const agenticAIService = new AgenticAIService();