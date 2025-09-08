// Gemini API integration for image-to-text and video prompt generation

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Convert image to base64 format
   */
  private async imageToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data:image/...;base64, prefix
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  /**
   * Generate video prompt from image using Gemini
   */
  async generateVideoPrompt(imageUrl: string): Promise<string> {
    try {
      const base64Image = await this.imageToBase64(imageUrl);
      
      const prompt = `Analyze this generated image and create a cinematic video prompt that will make the person or character come alive in a 6-second video. The prompt should:

1. Describe natural movements that would make the character appear to be "going live"
2. Include environmental interactions (walking, gesturing, interacting with surroundings)
3. Add cinematic elements like camera movements or lighting changes
4. Keep the character's appearance and style consistent
5. Make it feel dynamic and engaging
6. Limit to 600 characters maximum

Focus on creating a prompt that would work well for image-to-video generation, making the scene feel alive and cinematic while maintaining the original character's essence.

Return only the video prompt, nothing else.`;

      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 32,
          topP: 1,
          maxOutputTokens: 200,
        }
      };

      const response = await fetch(
        `${this.baseUrl}/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Ensure the prompt is within 600 characters
      return generatedText.length > 600 
        ? generatedText.substring(0, 597) + '...'
        : generatedText;
        
    } catch (error) {
      console.error('Error generating video prompt:', error);
      throw error;
    }
  }

  /**
   * Analyze image and extract context for video generation
   */
  async analyzeImageContext(imageUrl: string): Promise<{
    description: string;
    setting: string;
    character: string;
    mood: string;
  }> {
    try {
      const base64Image = await this.imageToBase64(imageUrl);
      
      const prompt = `Analyze this image and provide a structured analysis for video generation:

1. Description: Brief description of what's happening in the image
2. Setting: The environment/background/location
3. Character: Description of the main person/character
4. Mood: The overall mood/atmosphere

Format your response as JSON with these exact keys: description, setting, character, mood`;

      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 300,
        }
      };

      const response = await fetch(
        `${this.baseUrl}/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        return JSON.parse(responseText);
      } catch {
        // Fallback if JSON parsing fails
        return {
          description: "Generated image analysis",
          setting: "Dynamic environment",
          character: "Main subject",
          mood: "Engaging and cinematic"
        };
      }
    } catch (error) {
      console.error('Error analyzing image context:', error);
      throw error;
    }
  }
}