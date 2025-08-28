import OpenAI from "openai";

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

export class AIService {
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
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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