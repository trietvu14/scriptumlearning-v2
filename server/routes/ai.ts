import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { aiService } from '../services/ai-service';
import { authenticateToken, requireRole } from '../middleware/auth';
import { 
  aiCategorizationJobs,
  content,
  aiTrainingData,
  contentStandardMappings,
  inbdeContentMappings
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Schema for AI categorization request
const categorizationRequestSchema = z.object({
  contentIds: z.array(z.string()),
  jobType: z.enum(['single_content', 'bulk_content', 'document_analysis']).default('bulk_content'),
  settings: z.object({
    model: z.string().default('gpt-4o-mini'),
    temperature: z.number().min(0).max(2).default(0.3),
    maxTokens: z.number().min(100).max(4000).default(2000),
    useRAGContext: z.boolean().default(true),
    confidenceThreshold: z.number().min(0).max(1).default(0.6),
    standardsFramework: z.array(z.string()).default([])
  }).default({})
});

const inbdeCategorizationSchema = z.object({
  contentIds: z.array(z.string()),
  settings: z.object({
    model: z.string().default('gpt-4o-mini'),
    temperature: z.number().min(0).max(2).default(0.2),
    maxTokens: z.number().min(100).max(2000).default(1500),
    confidenceThreshold: z.number().min(0).max(1).default(0.6)
  }).default({})
});

// Single content analysis endpoint
router.post('/analyze-content/:contentId', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const { contentId } = req.params;
    const { settings = {} } = req.body;
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    // Verify content exists and user has access
    const [contentData] = await db
      .select()
      .from(content)
      .where(and(
        eq(content.id, contentId),
        eq(content.tenantId, req.user.tenantId)
      ));

    if (!contentData) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const analysis = await aiService.analyzeContent(contentId, req.user.tenantId, settings);
    
    res.json({
      success: true,
      analysis,
      message: 'Content analyzed successfully'
    });

  } catch (error) {
    console.error('Content analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// INBDE-specific content analysis
router.post('/analyze-inbde/:contentId', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const { contentId } = req.params;
    const { settings = {} } = req.body;
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const analysis = await aiService.analyzeForINBDEMapping(contentId, req.user.tenantId, settings);
    
    res.json({
      success: true,
      analysis,
      message: 'INBDE analysis completed successfully'
    });

  } catch (error) {
    console.error('INBDE analysis error:', error);
    res.status(500).json({ 
      error: 'INBDE analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Bulk content categorization
router.post('/categorize', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const validatedData = categorizationRequestSchema.parse(req.body);
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    // Verify all content exists and user has access
    const contentData = await db
      .select({ id: content.id })
      .from(content)
      .where(and(
        eq(content.tenantId, req.user.tenantId)
      ));

    const accessibleContentIds = contentData.map(c => c.id);
    const requestedContentIds = validatedData.contentIds.filter(id => 
      accessibleContentIds.includes(id)
    );

    if (requestedContentIds.length === 0) {
      return res.status(400).json({ error: 'No accessible content found' });
    }

    const jobId = await aiService.createCategorizationJob(
      req.user.tenantId,
      req.user.id,
      validatedData.jobType,
      requestedContentIds,
      validatedData.settings
    );

    res.json({
      success: true,
      jobId,
      message: `Categorization job created for ${requestedContentIds.length} items`,
      processedCount: requestedContentIds.length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }

    console.error('Bulk categorization error:', error);
    res.status(500).json({ 
      error: 'Categorization failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// INBDE bulk categorization
router.post('/categorize-inbde', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const validatedData = inbdeCategorizationSchema.parse(req.body);
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    // Process INBDE categorization for each content item
    const results = [];
    for (const contentId of validatedData.contentIds) {
      try {
        const analysis = await aiService.analyzeForINBDEMapping(
          contentId, 
          req.user.tenantId, 
          validatedData.settings
        );

        // Save INBDE mappings
        for (const mapping of analysis.inbdeMappings || []) {
          await db.insert(inbdeContentMappings).values({
            tenantId: req.user.tenantId,
            contentId,
            fkId: mapping.fkId,
            ccId: mapping.ccId,
            alignmentStrength: mapping.alignmentStrength.toString(),
            isAiGenerated: true
          });
        }

        results.push({
          contentId,
          success: true,
          mappingsCount: analysis.inbdeMappings?.length || 0
        });

      } catch (error) {
        results.push({
          contentId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      results,
      summary: {
        total: validatedData.contentIds.length,
        successful: successCount,
        failed: validatedData.contentIds.length - successCount
      },
      message: `INBDE categorization completed: ${successCount}/${validatedData.contentIds.length} successful`
    });

  } catch (error) {
    console.error('INBDE bulk categorization error:', error);
    res.status(500).json({ 
      error: 'INBDE categorization failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get categorization job status
router.get('/jobs/:jobId', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await aiService.getJobStatus(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user has access to this job
    if (req.user?.tenantId !== job.tenantId && req.user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: {
          total: job.totalItems,
          processed: job.processedItems,
          successful: job.successItems,
          failed: job.failedItems,
          percentage: (job.totalItems ?? 0) > 0 ? ((job.processedItems ?? 0) / (job.totalItems ?? 0)) * 100 : 0
        },
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        results: job.results,
        errors: job.errorMessages
      }
    });

  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ 
      error: 'Failed to get job status', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get tenant's categorization jobs
router.get('/jobs', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const tenantId = req.user?.role === 'super_admin' ? req.query.tenantId as string : req.user?.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const jobs = await db
      .select()
      .from(aiCategorizationJobs)
      .where(eq(aiCategorizationJobs.tenantId, tenantId))
      .orderBy(desc(aiCategorizationJobs.createdAt))
      .limit(20);

    res.json({
      success: true,
      jobs: jobs.map(job => ({
        id: job.id,
        jobType: job.jobType,
        status: job.status,
        progress: {
          total: job.totalItems,
          processed: job.processedItems,
          successful: job.successItems,
          failed: job.failedItems,
          percentage: (job.totalItems ?? 0) > 0 ? ((job.processedItems ?? 0) / (job.totalItems ?? 0)) * 100 : 0
        },
        createdAt: job.createdAt,
        completedAt: job.completedAt
      }))
    });

  } catch (error) {
    console.error('Jobs list error:', error);
    res.status(500).json({ 
      error: 'Failed to get jobs', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Submit training data for AI improvement
router.post('/training-feedback', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const { contentId, standardId, humanLabel, aiPrediction, isCorrect, feedback } = req.body;
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    await db.insert(aiTrainingData).values({
      tenantId: req.user.tenantId,
      contentId: contentId || null,
      standardObjectiveId: standardId || null,
      humanLabel,
      aiPrediction: aiPrediction || null,
      isCorrect: isCorrect || null,
      feedback: feedback || null,
      createdBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Training feedback submitted successfully'
    });

  } catch (error) {
    console.error('Training feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiRoutes };