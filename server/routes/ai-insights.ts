import express from 'express';
import { agenticAIService } from '../services/agentic-ai';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

// Request schemas
const sessionRequestSchema = z.object({
  sessionId: z.string().uuid().optional()
});

const messageRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(10000)
});

const sessionIdSchema = z.object({
  sessionId: z.string().uuid()
});

/**
 * Create or resume AI Insights conversation session
 * POST /api/ai-insights/sessions
 */
router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const { sessionId } = sessionRequestSchema.parse(req.body);
    const { user } = req as any;
    
    const context = await agenticAIService.createOrResumeSession(
      user.id,
      user.tenantId,
      sessionId
    );
    
    res.json({
      success: true,
      session: {
        sessionId: context.sessionId,
        conversationHistory: context.conversationHistory,
        dashboardConfig: context.dashboardConfig,
        generatedAnalytics: context.generatedAnalytics
      }
    });
  } catch (error: any) {
    console.error('Error creating/resuming session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create or resume session',
      details: error.message
    });
  }
});

/**
 * Send message to AI Insights and get response
 * POST /api/ai-insights/message
 */
router.post('/message', requireAuth, async (req, res) => {
  try {
    const { sessionId, message } = messageRequestSchema.parse(req.body);
    const { user } = req as any;
    
    // Create or resume session if sessionId not provided
    let context;
    if (sessionId) {
      context = await agenticAIService.getSessionHistory(sessionId, user.id);
      if (!context) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
    } else {
      context = await agenticAIService.createOrResumeSession(user.id, user.tenantId);
    }
    
    // Process the message with AI
    const result = await agenticAIService.processMessage(context, message);
    
    res.json({
      success: true,
      sessionId: result.updatedContext.sessionId,
      response: result.response,
      dashboardConfig: result.dashboardConfig,
      analytics: result.analytics,
      conversationHistory: result.updatedContext.conversationHistory.slice(-10) // Last 10 messages
    });
  } catch (error: any) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * Get session history and analytics
 * GET /api/ai-insights/sessions/:sessionId
 */
router.get('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = sessionIdSchema.parse({ sessionId: req.params.sessionId });
    const { user } = req as any;
    
    const context = await agenticAIService.getSessionHistory(sessionId, user.id);
    
    if (!context) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: {
        sessionId: context.sessionId,
        conversationHistory: context.conversationHistory,
        dashboardConfig: context.dashboardConfig,
        generatedAnalytics: context.generatedAnalytics
      }
    });
  } catch (error: any) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
      details: error.message
    });
  }
});

/**
 * List user's AI Insights sessions
 * GET /api/ai-insights/sessions
 */
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const { user } = req as any;
    
    const sessions = await agenticAIService.getUserSessions(user.id, user.tenantId);
    
    res.json({
      success: true,
      sessions
    });
  } catch (error: any) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
      details: error.message
    });
  }
});

/**
 * End AI Insights session
 * DELETE /api/ai-insights/sessions/:sessionId
 */
router.delete('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = sessionIdSchema.parse({ sessionId: req.params.sessionId });
    const { user } = req as any;
    
    await agenticAIService.endSession(sessionId, user.id);
    
    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error: any) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end session',
      details: error.message
    });
  }
});

/**
 * Get AI Insights dashboard with real-time analytics
 * GET /api/ai-insights/dashboard
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { user } = req as any;
    
    // Create a temporary context for dashboard generation
    const context = await agenticAIService.createOrResumeSession(user.id, user.tenantId);
    
    // Generate default dashboard with key institutional metrics
    const result = await agenticAIService.processMessage(
      context,
      "Show me a comprehensive dashboard with key performance metrics for our institution including student performance, content analysis, and curriculum mapping statistics"
    );
    
    res.json({
      success: true,
      dashboardConfig: result.dashboardConfig,
      analytics: result.analytics,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error generating dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate dashboard',
      details: error.message
    });
  }
});

/**
 * Generate custom analytics based on natural language query
 * POST /api/ai-insights/analytics
 */
router.post('/analytics', requireAuth, async (req, res) => {
  try {
    const { query } = z.object({
      query: z.string().min(1).max(1000)
    }).parse(req.body);
    
    const { user } = req as any;
    
    // Create a temporary context for analytics generation
    const context = await agenticAIService.createOrResumeSession(user.id, user.tenantId);
    
    // Process the analytics query
    const result = await agenticAIService.processMessage(context, query);
    
    res.json({
      success: true,
      query,
      response: result.response,
      dashboardConfig: result.dashboardConfig,
      analytics: result.analytics,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics',
      details: error.message
    });
  }
});

/**
 * Health check for AI Insights service
 * GET /api/ai-insights/health
 */
router.get('/health', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      service: 'AI Insights',
      timestamp: new Date().toISOString(),
      features: {
        agenticAI: true,
        contextualMemory: true,
        analyticsGeneration: true,
        dashboardCreation: true
      }
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;