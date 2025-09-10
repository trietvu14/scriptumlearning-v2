import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { aiService } from '../services/ai';
import { authenticateToken, requireRole } from '../middleware/auth';
import { 
  aiCategorizationJobs,
  content,
  aiTrainingData,
  contentStandardMappings,
  inbdeContentMappings,
  ragDocuments,
  contentEmbeddings
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

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
    // For super admin, allow querying any tenant; otherwise use user's tenant
    const tenantId = req.user?.role === 'super_admin' && req.query.tenantId 
      ? req.query.tenantId as string 
      : req.user?.tenantId;
    
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

// RAG document management endpoints

// Schema for RAG document creation
const ragDocumentSchema = z.object({
  frameworkId: z.string().uuid().optional(),
  documentType: z.enum(['curriculum', 'standards', 'learning_materials', 'assessments']),
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  sourceDocument: z.string().optional(),
  metadata: z.record(z.any()).default({})
});

// Create RAG document with automatic chunking and embedding
router.post('/rag/documents', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const validated = ragDocumentSchema.parse(req.body);
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    // Chunk large content into smaller pieces for better RAG performance
    const chunks = aiService.chunkText(validated.content, 800); // ~800 chars per chunk
    const documents = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding for this chunk
      const embedding = await aiService.generateEmbedding(chunk);
      
      // Store document chunk with embedding
      const [document] = await db.insert(ragDocuments).values({
        tenantId: req.user.tenantId,
        frameworkId: validated.frameworkId || null,
        documentType: validated.documentType,
        title: `${validated.title} (Chunk ${i + 1}/${chunks.length})`,
        content: chunk,
        sourceUrl: validated.sourceUrl,
        sourceDocument: validated.sourceDocument,
        chunkIndex: i,
        totalChunks: chunks.length,
        embedding: embedding.embedding, // Store as proper vector array
        metadata: { ...validated.metadata, originalTitle: validated.title }
      }).returning();

      documents.push(document);
    }

    res.json({
      success: true,
      documents,
      message: `Created ${chunks.length} document chunks with embeddings`
    });

  } catch (error) {
    console.error('RAG document creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create RAG documents', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search RAG documents using semantic similarity
router.post('/rag/search', authenticateToken, async (req, res) => {
  try {
    const { query, documentType, limit = 10, threshold = 0.7 } = req.body;
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query text is required' });
    }

    // Generate embedding for search query
    const queryEmbedding = await aiService.generateEmbedding(query);
    
    // Build where conditions properly
    const whereConditions = [eq(ragDocuments.tenantId, req.user.tenantId)];
    if (documentType) {
      whereConditions.push(eq(ragDocuments.documentType, documentType));
    }

    // Use pgvector similarity search directly in database with threshold
    const queryEmbeddingVector = `[${queryEmbedding.embedding.join(',')}]`;
    const maxDistance = 1 - threshold; // Convert similarity threshold to distance
    
    // Add distance threshold to where conditions
    whereConditions.push(sql`${ragDocuments.embedding} <-> ${queryEmbeddingVector}::vector <= ${maxDistance}`);
    
    const results = await db
      .select({
        id: ragDocuments.id,
        title: ragDocuments.title,
        content: ragDocuments.content,
        documentType: ragDocuments.documentType,
        sourceUrl: ragDocuments.sourceUrl,
        metadata: ragDocuments.metadata,
        similarity: sql<number>`1 - (${ragDocuments.embedding} <-> ${queryEmbeddingVector}::vector)`
      })
      .from(ragDocuments)
      .where(and(...whereConditions))
      .orderBy(sql`${ragDocuments.embedding} <-> ${queryEmbeddingVector}::vector`)
      .limit(limit);

    res.json({
      success: true,
      query,
      results,
      totalDocuments: results.length,
      message: `Found ${results.length} similar documents`
    });

  } catch (error) {
    console.error('RAG search error:', error);
    res.status(500).json({ 
      error: 'Failed to search documents', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate content embedding
router.post('/embeddings/generate', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const { contentId, contentType, text } = req.body;
    
    if (!req.user?.tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    // Generate embedding
    const embedding = await aiService.generateEmbedding(text);
    
    // Store in content embeddings table
    const [storedEmbedding] = await db.insert(contentEmbeddings).values({
      contentId: contentId || null,
      contentType: contentType || 'unknown',
      contentText: text.substring(0, 2000), // Truncate for storage
      embedding: embedding.embedding, // Store as proper vector array
      metadata: { 
        model: embedding.model,
        usage: embedding.usage,
        generatedAt: new Date().toISOString()
      }
    }).returning();

    res.json({
      success: true,
      embedding: storedEmbedding,
      message: 'Embedding generated and stored successfully'
    });

  } catch (error) {
    console.error('Embedding generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate embedding', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Content quality assessment with RAG context
router.post('/assess-quality', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const { content, contentType = 'curriculum' } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Use AI service to assess content quality
    const assessment = await aiService.assessContentQuality(content, contentType);

    res.json({
      success: true,
      assessment,
      message: 'Content quality assessed successfully'
    });

  } catch (error) {
    console.error('Quality assessment error:', error);
    res.status(500).json({ 
      error: 'Failed to assess content quality', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Gap analysis with RAG context
router.post('/gap-analysis', authenticateToken, requireRole(['super_admin', 'school_admin', 'faculty']), async (req, res) => {
  try {
    const { currentContent, targetStandards } = req.body;
    
    if (!Array.isArray(currentContent) || !Array.isArray(targetStandards)) {
      return res.status(400).json({ 
        error: 'Current content and target standards must be arrays' 
      });
    }

    // Use AI service to generate gap analysis
    const gapAnalysis = await aiService.generateGapAnalysis(currentContent, targetStandards);

    res.json({
      success: true,
      analysis: gapAnalysis,
      message: 'Gap analysis completed successfully'
    });

  } catch (error) {
    console.error('Gap analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to perform gap analysis', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;