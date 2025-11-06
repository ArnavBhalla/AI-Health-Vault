import { RecordMetadata } from '@/lib/types';
import Anthropic from '@anthropic-ai/sdk';

export interface AIExplanationResponse {
  summary: string;
  trend: 'up' | 'down' | 'stable' | 'normal';
  severity: -1 | 0 | 1; // -1 = low, 0 = normal, 1 = high
  education: string;
  model: string;
}

/**
 * Mock AI service for generating lab explanations
 * Replace with actual Claude/OpenAI calls in production
 */
export class AIService {
  static async explainLab(metadata: RecordMetadata): Promise<AIExplanationResponse> {
    const provider = process.env.AI_PROVIDER || 'mock';

    if (provider === 'mock') {
      return this.mockExplain(metadata);
    }

    if (provider === 'anthropic' || provider === 'claude') {
      return this.claudeExplain(metadata);
    }

    // Default to mock if provider not recognized
    return this.mockExplain(metadata);
  }

  /**
   * Mock explanation generator
   */
  private static mockExplain(metadata: RecordMetadata): AIExplanationResponse {
    const { labName, value, range, unit } = metadata;

    // Parse range to determine if value is normal
    const severity = this.determineSeverity(value, range);
    const trend = this.mockTrend();

    // Generate mock explanation
    const explanations: Record<number, string> = {
      [-1]: `Your ${labName} is ${value} ${unit}, which is slightly below the normal range (${range}). This is usually not concerning and can be due to various factors like recent activity or diet. Monitor your next results.`,
      [0]: `Your ${labName} is ${value} ${unit}, which is within the normal range (${range}). This is a healthy result. Continue your current health practices.`,
      [1]: `Your ${labName} is ${value} ${unit}, which is slightly above the normal range (${range}). Mild elevations can occur after exercise, stress, or certain medications. Track your next results and consult your provider if it remains elevated.`,
    };

    const educationTexts: Record<string, string> = {
      ALT: 'ALT (Alanine Aminotransferase) is a liver enzyme. Levels can temporarily rise after exercise, alcohol consumption, or certain medications.',
      'Cholesterol': 'Cholesterol is a fatty substance in your blood. High levels increase heart disease risk. Diet, exercise, and genetics all play a role.',
      'Glucose': 'Blood glucose measures sugar in your blood. High levels may indicate prediabetes or diabetes. Regular monitoring is important.',
      'Default': `${labName} is an important biomarker for health monitoring. Values can fluctuate based on various lifestyle and biological factors.`,
    };

    return {
      summary: explanations[severity] || explanations[0],
      trend,
      severity,
      education: educationTexts[labName || 'Default'] || educationTexts['Default'],
      model: 'mock-v1',
    };
  }

  /**
   * Determine severity based on value and range
   */
  private static determineSeverity(
    value: number | undefined,
    range: string | undefined
  ): -1 | 0 | 1 {
    if (!value || !range) return 0;

    // Parse range like "10-40" or "10 - 40"
    const match = range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (!match) return 0;

    const [, minStr, maxStr] = match;
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    if (value < min) return -1;
    if (value > max) return 1;
    return 0;
  }

  /**
   * Mock trend determination
   */
  private static mockTrend(): 'up' | 'down' | 'stable' | 'normal' {
    const trends: Array<'up' | 'down' | 'stable' | 'normal'> = ['stable', 'normal', 'up', 'down'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  /**
   * De-identify metadata before sending to external AI
   * Removes dates, names, and other PHI
   */
  static deidentifyMetadata(metadata: RecordMetadata): RecordMetadata {
    const { labName, value, unit, range } = metadata;
    return { labName, value, unit, range };
  }

  /**
   * Claude AI integration for lab explanations
   */
  private static async claudeExplain(metadata: RecordMetadata): Promise<AIExplanationResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not set, falling back to mock');
      return this.mockExplain(metadata);
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const deidentified = this.deidentifyMetadata(metadata);
    const { labName, value, unit, range } = deidentified;

    const prompt = `You are a medical education assistant. A patient has received the following lab result:

Lab: ${labName || 'Unknown test'}
Value: ${value} ${unit || ''}
Normal Range: ${range || 'Not specified'}

Provide a response in the following JSON format:
{
  "summary": "A 2-3 sentence plain-language explanation for a non-medical person (max 80 words)",
  "trend": "normal|stable|up|down",
  "severity": -1 (below normal), 0 (normal), or 1 (above normal),
  "education": "1-2 sentences of educational context about what this test measures"
}

Important:
- Use simple, non-technical language
- Be encouraging but honest
- Do not provide medical advice
- Remind them to consult their healthcare provider if concerned
- Return ONLY valid JSON, no additional text`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Parse the JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || 'Unable to generate explanation',
        trend: parsed.trend || 'normal',
        severity: parsed.severity || 0,
        education: parsed.education || '',
        model: 'claude-3-5-sonnet-20241022',
      };
    } catch (error) {
      console.error('Claude API error:', error);
      // Fall back to mock on error
      return this.mockExplain(metadata);
    }
  }
}
