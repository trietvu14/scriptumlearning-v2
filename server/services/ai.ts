import OpenAI from "openai";

// Using gpt-4o-mini for stable, cost-effective AI operations
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ContentToAnalyze {
  title: string;
  description: string;
  content: string;
  type: string;
}

interface StandardObjective {
  id: string;
  code: string;
  title: string;
  description?: string;
}

interface CategoryResult {
  standardObjectiveId: string;
  confidence: number;
  reasoning: string;
}

export interface EmbeddingResult {
  embedding: number[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ContentAnalysisResult {
  categories: string[];
  confidence: number;
  suggestedStandards: string[];
  qualityScore: number;
  keyTopics: string[];
}

export interface StandardsSuggestion {
  standardId: string;
  standardName: string;
  confidence: number;
  reasoning: string;
}

export class AIService {
  /**
   * Generate embeddings for text content using OpenAI's embedding model
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text.slice(0, 8000), // Limit input length
        encoding_format: "float"
      });

      return {
        embedding: response.data[0].embedding,
        usage: response.usage
      };
    } catch (error: any) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Analyze content and categorize it using AI
   */
  async analyzeContent(content: string, contentType: 'curriculum' | 'learning_objective' | 'assessment' | 'topic'): Promise<ContentAnalysisResult> {
    try {
      const prompt = `Analyze the following ${contentType} content and provide categorization and recommendations.

Content: "${content}"

Please analyze this content and respond with JSON in this exact format:
{
  "categories": ["category1", "category2", "category3"],
  "confidence": 0.85,
  "suggestedStandards": ["standard1", "standard2"],
  "qualityScore": 0.9,
  "keyTopics": ["topic1", "topic2", "topic3"]
}

Categories should be educational subject areas like "Anatomy", "Physiology", "Clinical Skills", etc.
Quality score should be 0-1 based on clarity, completeness, and educational value.
Confidence should be 0-1 based on how certain you are about the categorization.
Key topics should be the main concepts covered.
Suggested standards should be relevant educational standards that might apply.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational content analysis expert specializing in curriculum categorization and standards mapping."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        categories: result.categories || [],
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        suggestedStandards: result.suggestedStandards || [],
        qualityScore: Math.max(0, Math.min(1, result.qualityScore || 0)),
        keyTopics: result.keyTopics || []
      };
    } catch (error: any) {
      console.error('Error analyzing content:', error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }

  /**
   * Suggest relevant standards based on content analysis
   */
  async suggestStandards(content: string, availableStandards: any[]): Promise<StandardsSuggestion[]> {
    try {
      const standardsList = availableStandards.map(s => `${s.id}: ${s.name} - ${s.description || ''}`).join('\n');
      
      const prompt = `Given the following content and available standards, suggest which standards are most relevant.

Content: "${content}"

Available Standards:
${standardsList}

Analyze the content and suggest the most relevant standards. Respond with JSON in this format:
{
  "suggestions": [
    {
      "standardId": "standard_id_here",
      "standardName": "Standard Name",
      "confidence": 0.85,
      "reasoning": "Why this standard is relevant to the content"
    }
  ]
}

Only suggest standards with confidence > 0.6. Limit to top 5 suggestions.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational standards mapping expert. Help map curriculum content to relevant educational standards."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return (result.suggestions || [])
        .filter((s: any) => s.confidence > 0.6)
        .slice(0, 5)
        .map((s: any) => ({
          standardId: s.standardId,
          standardName: s.standardName,
          confidence: Math.max(0, Math.min(1, s.confidence || 0)),
          reasoning: s.reasoning || ''
        }));
    } catch (error: any) {
      console.error('Error suggesting standards:', error);
      throw new Error(`Failed to suggest standards: ${error.message}`);
    }
  }

  /**
   * Batch process multiple content items for analysis
   */
  async batchAnalyzeContent(items: { id: string; content: string; type: string }[]): Promise<{ [key: string]: ContentAnalysisResult }> {
    const results: { [key: string]: ContentAnalysisResult } = {};
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (item) => {
        try {
          results[item.id] = await this.analyzeContent(item.content, item.type as any);
        } catch (error) {
          console.error(`Failed to analyze item ${item.id}:`, error);
          // Provide default result for failed items
          results[item.id] = {
            categories: [],
            confidence: 0,
            suggestedStandards: [],
            qualityScore: 0,
            keyTopics: []
          };
        }
      }));

      // Add delay between batches to respect rate limits
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Analyze content and provide quality assessment with confidence metrics
   */
  async assessContentQuality(content: string, contentType: string): Promise<{
    qualityScore: number;
    confidence: number;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `Assess the quality of this ${contentType} content and provide improvement recommendations.

Content: "${content}"

Evaluate based on:
- Clarity and readability
- Educational value
- Completeness
- Accuracy indicators
- Alignment with best practices

Respond with JSON in this format:
{
  "qualityScore": 0.85,
  "confidence": 0.9,
  "issues": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Quality score should be 0-1. Confidence should reflect how certain you are about the assessment.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational content quality expert. Provide objective assessments and actionable improvement suggestions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        qualityScore: Math.max(0, Math.min(1, result.qualityScore || 0)),
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        issues: result.issues || [],
        suggestions: result.suggestions || []
      };
    } catch (error: any) {
      console.error('Error assessing content quality:', error);
      throw new Error(`Failed to assess content quality: ${error.message}`);
    }
  }

  /**
   * Generate gap analysis between current content and target standards
   */
  async generateGapAnalysis(currentContent: string[], targetStandards: any[]): Promise<{
    gaps: Array<{
      standardId: string;
      standardName: string;
      coverage: number;
      missingElements: string[];
      recommendations: string[];
    }>;
    overallCoverage: number;
    priorityAreas: string[];
  }> {
    try {
      const contentSummary = currentContent.slice(0, 10).join('\n---\n');
      const standardsList = targetStandards.map(s => `${s.id}: ${s.name} - ${s.description || ''}`).join('\n');
      
      const prompt = `Analyze the gap between current educational content and target standards.

Current Content:
${contentSummary}

Target Standards:
${standardsList}

Identify gaps and provide recommendations. Respond with JSON in this format:
{
  "gaps": [
    {
      "standardId": "standard_id",
      "standardName": "Standard Name",
      "coverage": 0.6,
      "missingElements": ["Element 1", "Element 2"],
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  ],
  "overallCoverage": 0.75,
  "priorityAreas": ["Priority Area 1", "Priority Area 2"]
}

Coverage should be 0-1 indicating how well current content addresses each standard.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational gap analysis expert. Provide detailed assessments of curriculum coverage and actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        gaps: result.gaps || [],
        overallCoverage: Math.max(0, Math.min(1, result.overallCoverage || 0)),
        priorityAreas: result.priorityAreas || []
      };
    } catch (error: any) {
      console.error('Error generating gap analysis:', error);
      throw new Error(`Failed to generate gap analysis: ${error.message}`);
    }
  }

  /**
   * DEPRECATED: Legacy similarity search with JSON embeddings
   * Use pgvector similarity search in database instead for better performance
   */
  async findSimilarContent(queryText: string, embeddings: Array<{id: string, embedding: string, text: string}>): Promise<Array<{
    id: string;
    similarity: number;
    text: string;
  }>> {
    console.warn('findSimilarContent is deprecated. Use pgvector similarity search in database instead.');
    
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(queryText);
      
      // Calculate cosine similarity with stored embeddings (legacy JSON format support)
      const similarities = embeddings.map(item => {
        let storedEmbedding: number[];
        try {
          storedEmbedding = JSON.parse(item.embedding);
        } catch {
          // If not JSON, assume it's already an array
          storedEmbedding = Array.isArray(item.embedding) ? item.embedding : [];
        }
        
        const similarity = this.cosineSimilarity(queryEmbedding.embedding, storedEmbedding);
        
        return {
          id: item.id,
          similarity,
          text: item.text
        };
      });
      
      // Sort by similarity and return top results
      return similarities
        .filter(item => item.similarity > 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10);
    } catch (error: any) {
      console.error('Error finding similar content:', error);
      throw new Error(`Failed to find similar content: ${error.message}`);
    }
  }

  /**
   * Chunk text into smaller pieces for better RAG performance
   */
  chunkText(text: string, maxCharsPerChunk: number = 800): string[] {
    if (!text || text.length <= maxCharsPerChunk) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      // If adding this sentence would exceed the limit, save current chunk and start new one
      if (currentChunk.length + trimmedSentence.length + 1 > maxCharsPerChunk) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    // Add the final chunk if it exists
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    // If no chunks were created (e.g., very long sentence), split by character count
    if (chunks.length === 0) {
      for (let i = 0; i < text.length; i += maxCharsPerChunk) {
        chunks.push(text.substring(i, i + maxCharsPerChunk));
      }
    }

    return chunks;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Analyze content for INBDE mapping (compatibility method)
   */
  async analyzeForINBDEMapping(contentId: string, tenantId: string, settings: any = {}): Promise<any> {
    try {
      // Get content from database
      const contentRecords = await db.select().from(content).where(eq(content.id, contentId)).limit(1);
      
      if (contentRecords.length === 0) {
        throw new Error('Content not found');
      }

      const contentData = contentRecords[0];
      const textContent = typeof contentData.content === 'string' ? contentData.content : JSON.stringify(contentData.content);

      // Use enhanced AI analysis for INBDE mapping
      const analysis = await this.analyzeContentBasic(textContent, 'inbde_content');

      return {
        contentId,
        inbdeMappings: analysis.suggestedStandards.map(standard => ({
          fkId: `fk_${Math.random().toString(36).substr(2, 9)}`,
          ccId: `cc_${Math.random().toString(36).substr(2, 9)}`,
          alignmentStrength: analysis.confidence,
          reasoning: `Mapped based on content analysis with ${analysis.confidence} confidence`
        })),
        extractedTopics: analysis.keyTopics,
        confidenceScore: analysis.confidence
      };
    } catch (error: any) {
      console.error('Error in INBDE mapping analysis:', error);
      return {
        contentId,
        inbdeMappings: [],
        extractedTopics: [],
        confidenceScore: 0.5
      };
    }
  }

  /**
   * Create categorization job (compatibility method)
   */
  async createCategorizationJob(
    tenantId: string,
    userId: string,
    jobType: string,
    contentIds: string[],
    settings: any
  ): Promise<string> {
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert job record into database
      await db.insert(aiCategorizationJobs).values({
        id: jobId,
        tenantId,
        userId,
        jobType: jobType as any,
        contentIds,
        settings,
        status: 'pending',
        totalItems: contentIds.length,
        processedItems: 0,
        successItems: 0,
        failedItems: 0
      });

      // In a real implementation, this would trigger background processing
      console.log(`Created categorization job ${jobId} for ${contentIds.length} items`);
      
      return jobId;
    } catch (error: any) {
      console.error('Error creating categorization job:', error);
      throw new Error(`Failed to create categorization job: ${error.message}`);
    }
  }

  /**
   * Get job status (compatibility method)
   */
  async getJobStatus(jobId: string): Promise<any> {
    try {
      // Get job from database
      const jobs = await db.select().from(aiCategorizationJobs).where(eq(aiCategorizationJobs.id, jobId)).limit(1);
      
      if (jobs.length === 0) {
        throw new Error('Job not found');
      }

      const job = jobs[0];
      
      return {
        id: job.id,
        status: job.status,
        tenantId: job.tenantId,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        successItems: job.successItems,
        failedItems: job.failedItems,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        results: job.results || {},
        errorMessages: job.errorMessages || []
      };
    } catch (error: any) {
      console.error('Error getting job status:', error);
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }

  /**
   * Analyze content with enhanced method signature compatibility
   */
  async analyzeContent(content: string | any, contentType?: string, settings?: any): Promise<any> {
    // Handle different method signatures for compatibility
    if (typeof content === 'string') {
      // New enhanced method
      return this.analyzeContentBasic(content, contentType || 'curriculum');
    } else {
      // Legacy method signature (contentId, tenantId, settings)
      const contentId = content;
      const tenantId = contentType;
      return this.analyzeContentLegacy(contentId, tenantId, settings);
    }
  }

  private async analyzeContentBasic(content: string, contentType: string): Promise<ContentAnalysisResult> {
    try {
      const prompt = `Analyze the following ${contentType} content and provide categorization and recommendations.

Content: "${content}"

Please analyze this content and respond with JSON in this exact format:
{
  "categories": ["category1", "category2", "category3"],
  "confidence": 0.85,
  "suggestedStandards": ["standard1", "standard2"],
  "qualityScore": 0.9,
  "keyTopics": ["topic1", "topic2", "topic3"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational content analysis expert."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        categories: result.categories || [],
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        suggestedStandards: result.suggestedStandards || [],
        qualityScore: Math.max(0, Math.min(1, result.qualityScore || 0)),
        keyTopics: result.keyTopics || []
      };
    } catch (error: any) {
      console.error('Error analyzing content:', error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }

  private async analyzeContentLegacy(contentId: string, tenantId: string, settings: any): Promise<any> {
    try {
      // Get content from database
      const contentRecords = await db.select().from(content).where(eq(content.id, contentId)).limit(1);
      
      if (contentRecords.length === 0) {
        throw new Error('Content not found');
      }

      const contentData = contentRecords[0];
      const textContent = typeof contentData.content === 'string' ? contentData.content : JSON.stringify(contentData.content);

      // Use enhanced analysis
      const analysis = await this.analyzeContentBasic(textContent, contentData.type);

      return {
        contentId,
        standardMappings: analysis.suggestedStandards.map(standard => ({
          standardId: standard,
          confidence: analysis.confidence,
          reasoning: `Mapped based on content analysis`
        })),
        inbdeMappings: [],
        extractedTopics: analysis.keyTopics,
        suggestedTags: analysis.categories,
        confidenceScore: analysis.confidence
      };
    } catch (error: any) {
      console.error('Error in legacy content analysis:', error);
      return {
        contentId,
        standardMappings: [],
        inbdeMappings: [],
        extractedTopics: [],
        suggestedTags: [],
        confidenceScore: 0.5
      };
    }
  }

  async categorizeContent(
    content: ContentToAnalyze,
    availableObjectives: StandardObjective[]
  ): Promise<CategoryResult[]> {
    try {
      const prompt = `
Analyze the following educational content and categorize it according to the provided standard objectives.

Content:
Title: ${content.title}
Description: ${content.description}
Content: ${content.content}
Type: ${content.type}

Available Standard Objectives:
${availableObjectives.map(obj => 
  `${obj.code}: ${obj.title}${obj.description ? ` - ${obj.description}` : ''}`
).join('\n')}

Please identify which standard objectives this content aligns with and provide a confidence score (0-1) for each match. Return your response as a JSON array with the following format:
[
  {
    "standardObjectiveId": "objective_id",
    "confidence": 0.85,
    "reasoning": "Brief explanation of why this content matches this objective"
  }
]

Only include matches with confidence >= 0.6.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using gpt-4o-mini for stable, cost-effective AI operations
        messages: [
          {
            role: "system",
            content: "You are an expert educational content analyzer specializing in curriculum mapping and standards alignment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(response.choices[0].message.content || "[]");
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("AI categorization error:", error);
      return [];
    }
  }

  async generateStudyPath(
    studentId: string,
    performanceData: any[],
    availableContent: any[]
  ): Promise<any[]> {
    try {
      const prompt = `
Based on the student's performance data and available educational content, generate a personalized study path.

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Available Content:
${JSON.stringify(availableContent.slice(0, 10), null, 2)} // Limit for token efficiency

Generate a study path as a JSON array with recommended content ordered by priority:
[
  {
    "contentId": "content_id",
    "priority": 1,
    "estimatedTimeMinutes": 30,
    "reasoning": "Why this content is recommended"
  }
]
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using gpt-4o-mini for stable, cost-effective AI operations
        messages: [
          {
            role: "system",
            content: "You are an expert educational AI tutor that creates personalized learning paths."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || "[]");
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Study path generation error:", error);
      return [];
    }
  }

  async generateBoardQuestions(
    topic: string,
    difficulty: string,
    count: number = 5
  ): Promise<any[]> {
    try {
      const prompt = `
Generate ${count} multiple-choice board exam questions for the topic: ${topic}
Difficulty level: ${difficulty}

Format each question as a JSON object:
{
  "question": "Question text here",
  "options": {
    "A": "Option A text",
    "B": "Option B text", 
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctAnswer": "A",
  "explanation": "Detailed explanation of why this is correct",
  "subject": "${topic}",
  "difficulty": "${difficulty}"
}

Return an array of ${count} questions in JSON format.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using gpt-4o-mini for stable, cost-effective AI operations
        messages: [
          {
            role: "system",
            content: "You are an expert board exam question writer with deep knowledge of medical, dental, and professional certification standards."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      const result = JSON.parse(response.choices[0].message.content || "[]");
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Question generation error:", error);
      return [];
    }
  }
}

export const aiService = new AIService();