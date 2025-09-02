import OpenAI from 'openai';
import { db } from '../db';
import { 
  content, 
  standardObjectives, 
  aiCategorizationJobs, 
  aiTrainingData,
  ragDocuments,
  contentStandardMappings,
  inbdeContentMappings,
  inbdeFoundationKnowledge,
  inbdeClinicalContent
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CategorizationSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  useRAGContext?: boolean;
  confidenceThreshold?: number;
  standardsFramework?: string[];
}

export interface ContentAnalysis {
  contentId: string;
  standardMappings: {
    standardId: string;
    confidence: number;
    reasoning: string;
  }[];
  inbdeMappings?: {
    fkId: string;
    ccId: string;
    alignmentStrength: number;
    reasoning: string;
  }[];
  extractedTopics: string[];
  suggestedTags: string[];
  confidenceScore: number;
}

export interface RAGContext {
  documents: string[];
  relevantStandards: string[];
  institutionContext: string;
}

export class AIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
  }

  /**
   * Analyze content and suggest standards mappings using AI
   */
  async analyzeContent(
    contentId: string, 
    tenantId: string, 
    settings: CategorizationSettings = {}
  ): Promise<ContentAnalysis> {
    try {
      // Get content data
      const [contentData] = await db
        .select()
        .from(content)
        .where(and(eq(content.id, contentId), eq(content.tenantId, tenantId)));

      if (!contentData) {
        throw new Error('Content not found');
      }

      // Get available standards for this tenant
      const availableStandards = await db
        .select()
        .from(standardObjectives)
        .limit(50); // Limit for context window

      // Build context for AI analysis
      const context = await this.buildAnalysisContext(tenantId, settings);
      
      // Create analysis prompt
      const prompt = this.buildContentAnalysisPrompt(
        contentData, 
        availableStandards,
        context,
        settings
      );

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: settings.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content analyst specializing in curriculum mapping to educational standards. Analyze the provided content and suggest appropriate standards mappings with confidence scores.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: settings.temperature || 0.3,
        max_tokens: settings.maxTokens || 2000,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        contentId,
        standardMappings: analysis.standardMappings || [],
        inbdeMappings: analysis.inbdeMappings || [],
        extractedTopics: analysis.extractedTopics || [],
        suggestedTags: analysis.suggestedTags || [],
        confidenceScore: analysis.overallConfidence || 0.5
      };

    } catch (error) {
      console.error('AI content analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze content specifically for INBDE matrix mapping
   */
  async analyzeForINBDEMapping(
    contentId: string,
    tenantId: string,
    settings: CategorizationSettings = {}
  ): Promise<ContentAnalysis> {
    try {
      // Get content data
      const [contentData] = await db
        .select()
        .from(content)
        .where(and(eq(content.id, contentId), eq(content.tenantId, tenantId)));

      if (!contentData) {
        throw new Error('Content not found');
      }

      // Get INBDE Foundation Knowledge areas
      const foundationKnowledge = await db
        .select()
        .from(inbdeFoundationKnowledge)
        .where(eq(inbdeFoundationKnowledge.isActive, true));

      // Get INBDE Clinical Content areas
      const clinicalContent = await db
        .select()
        .from(inbdeClinicalContent)
        .where(eq(inbdeClinicalContent.isActive, true));

      // Build INBDE-specific analysis prompt
      const prompt = this.buildINBDEAnalysisPrompt(
        contentData,
        foundationKnowledge,
        clinicalContent,
        settings
      );

      // Call OpenAI API with INBDE-specific instructions
      const completion = await openai.chat.completions.create({
        model: settings.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert dental education analyst specializing in INBDE (Integrated National Board Dental Examinations) curriculum mapping. Map dental content to Foundation Knowledge (FK) and Clinical Content (CC) areas with alignment strengths.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: settings.temperature || 0.2,
        max_tokens: settings.maxTokens || 1500,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        contentId,
        standardMappings: [],
        inbdeMappings: analysis.inbdeMappings || [],
        extractedTopics: analysis.extractedTopics || [],
        suggestedTags: analysis.suggestedTags || [],
        confidenceScore: analysis.overallConfidence || 0.5
      };

    } catch (error) {
      console.error('INBDE AI analysis failed:', error);
      throw new Error(`INBDE AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a bulk categorization job
   */
  async createCategorizationJob(
    tenantId: string,
    initiatedBy: string,
    jobType: 'single_content' | 'bulk_content' | 'document_analysis',
    contentIds: string[],
    settings: CategorizationSettings = {}
  ): Promise<string> {
    try {
      const [job] = await db
        .insert(aiCategorizationJobs)
        .values({
          tenantId,
          initiatedBy,
          jobType,
          totalItems: contentIds.length,
          settings: settings as any,
          status: 'pending'
        })
        .returning();

      // Start processing in background (in a real app, this would be a queue)
      this.processCategorizationJob(job.id, contentIds, settings).catch(console.error);

      return job.id;
    } catch (error) {
      console.error('Failed to create categorization job:', error);
      throw error;
    }
  }

  /**
   * Process a categorization job
   */
  private async processCategorizationJob(
    jobId: string,
    contentIds: string[],
    settings: CategorizationSettings
  ): Promise<void> {
    try {
      // Update job status to processing
      await db
        .update(aiCategorizationJobs)
        .set({ 
          status: 'processing', 
          startedAt: new Date() 
        })
        .where(eq(aiCategorizationJobs.id, jobId));

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Get job details
      const [job] = await db
        .select()
        .from(aiCategorizationJobs)
        .where(eq(aiCategorizationJobs.id, jobId));

      // Process each content item
      for (const contentId of contentIds) {
        try {
          const analysis = await this.analyzeContent(contentId, job.tenantId, settings);
          
          // Save standard mappings
          for (const mapping of analysis.standardMappings) {
            await db.insert(contentStandardMappings).values({
              contentId,
              standardObjectiveId: mapping.standardId,
              confidence: mapping.confidence.toString(),
              isAiGenerated: true
            });
          }

          // Save INBDE mappings if available
          for (const mapping of analysis.inbdeMappings || []) {
            await db.insert(inbdeContentMappings).values({
              tenantId: job.tenantId,
              contentId,
              fkId: mapping.fkId,
              ccId: mapping.ccId,
              alignmentStrength: mapping.alignmentStrength.toString(),
              isAiGenerated: true
            });
          }

          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Content ${contentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Update progress
        await db
          .update(aiCategorizationJobs)
          .set({
            processedItems: successCount + failedCount,
            successItems: successCount,
            failedItems: failedCount,
            errorMessages: errors,
            updatedAt: new Date()
          })
          .where(eq(aiCategorizationJobs.id, jobId));
      }

      // Mark job as completed
      await db
        .update(aiCategorizationJobs)
        .set({
          status: 'completed',
          completedAt: new Date(),
          results: {
            totalProcessed: contentIds.length,
            successful: successCount,
            failed: failedCount,
            errorSummary: errors.slice(0, 10) // Keep first 10 errors
          }
        })
        .where(eq(aiCategorizationJobs.id, jobId));

    } catch (error) {
      console.error('Categorization job failed:', error);
      
      // Mark job as failed
      await db
        .update(aiCategorizationJobs)
        .set({
          status: 'failed',
          completedAt: new Date(),
          errorMessages: [error instanceof Error ? error.message : 'Unknown error']
        })
        .where(eq(aiCategorizationJobs.id, jobId));
    }
  }

  /**
   * Get categorization job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    const [job] = await db
      .select()
      .from(aiCategorizationJobs)
      .where(eq(aiCategorizationJobs.id, jobId));

    return job;
  }

  /**
   * Build analysis context using RAG documents
   */
  private async buildAnalysisContext(
    tenantId: string, 
    settings: CategorizationSettings
  ): Promise<RAGContext> {
    if (!settings.useRAGContext) {
      return { documents: [], relevantStandards: [], institutionContext: '' };
    }

    // Get relevant training documents
    const documents = await db
      .select()
      .from(ragDocuments)
      .where(eq(ragDocuments.tenantId, tenantId))
      .orderBy(desc(ragDocuments.createdAt))
      .limit(5);

    return {
      documents: documents.map(doc => doc.chunks as string || '').filter(Boolean),
      relevantStandards: [],
      institutionContext: `Institution-specific context for tenant ${tenantId}`
    };
  }

  /**
   * Build content analysis prompt for general standards
   */
  private buildContentAnalysisPrompt(
    contentData: any,
    availableStandards: any[],
    context: RAGContext,
    settings: CategorizationSettings
  ): string {
    const standardsContext = availableStandards
      .map(std => `${std.id}: ${std.title} - ${std.description}`)
      .join('\n');

    return `
Analyze the following educational content and map it to appropriate standards:

CONTENT TO ANALYZE:
Title: ${contentData.title}
Description: ${contentData.description || 'No description'}
Content Type: ${contentData.type}
Content Data: ${JSON.stringify(contentData.content || {})}

AVAILABLE STANDARDS:
${standardsContext}

CONTEXT DOCUMENTS:
${context.documents.slice(0, 2).join('\n\n')}

Please analyze this content and return a JSON response with the following structure:
{
  "standardMappings": [
    {
      "standardId": "uuid-of-standard",
      "confidence": 0.85,
      "reasoning": "explanation of why this mapping is appropriate"
    }
  ],
  "extractedTopics": ["topic1", "topic2"],
  "suggestedTags": ["tag1", "tag2"],
  "overallConfidence": 0.75
}

Focus on high-confidence mappings (>0.6) and provide clear reasoning.
`;
  }

  /**
   * Build INBDE-specific analysis prompt
   */
  private buildINBDEAnalysisPrompt(
    contentData: any,
    foundationKnowledge: any[],
    clinicalContent: any[],
    settings: CategorizationSettings
  ): string {
    const fkContext = foundationKnowledge
      .map(fk => `FK${fk.fkNumber}: ${fk.name} - ${fk.description}`)
      .join('\n');

    const ccContext = clinicalContent
      .map(cc => `CC${cc.ccNumber}: ${cc.name} - ${cc.description}`)
      .join('\n');

    return `
Analyze this dental educational content for INBDE (Integrated National Board Dental Examinations) mapping:

CONTENT TO ANALYZE:
Title: ${contentData.title}
Description: ${contentData.description || 'No description'}
Content Type: ${contentData.type}
Content Data: ${JSON.stringify(contentData.content || {})}

FOUNDATION KNOWLEDGE AREAS (FK):
${fkContext}

CLINICAL CONTENT AREAS (CC):
${ccContext}

Map this content to the most relevant FK and CC combinations. Return JSON:
{
  "inbdeMappings": [
    {
      "fkId": "uuid-of-fk-area",
      "ccId": "uuid-of-cc-area", 
      "alignmentStrength": 0.85,
      "reasoning": "why this FK×CC combination fits this content"
    }
  ],
  "extractedTopics": ["dental topic1", "dental topic2"],
  "suggestedTags": ["tag1", "tag2"],
  "overallConfidence": 0.75
}

Consider dental-specific terminology and procedures. Alignment strength should reflect how well the content matches the FK×CC intersection.
`;
  }
}

// Export singleton instance
export const aiService = new AIService();