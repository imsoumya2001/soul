// Fal.ai Seedance API integration for image-to-video conversion
import { fal } from '@fal-ai/client';

interface FalVideoRequest {
  image_url: string;
  prompt: string;
  duration: number;
  resolution: string;
}

interface FalVideoResponse {
  video: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  seed: number;
  timings: {
    inference: number;
  };
}

export class FalService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Configure the Fal.ai client with the API key
    fal.config({
      credentials: apiKey
    });
  }

  /**
   * Generate video from image using Fal.ai Seedance API
   */
  async generateVideo({
    imageUrl,
    prompt,
    duration = 6,
    resolution = '720p'
  }: {
    imageUrl: string;
    prompt: string;
    duration?: number;
    resolution?: string;
  }): Promise<string> {
    try {
      console.log('Sending request to Fal.ai:', {
        image_url: imageUrl.substring(0, 50) + '...',
        prompt: prompt.substring(0, 100) + '...',
        duration,
        resolution
      });

      const result = await fal.subscribe('fal-ai/bytedance/seedance/v1/lite/image-to-video', {
         input: {
           image_url: imageUrl,
           prompt: prompt,
           duration: duration as any,
           resolution: resolution as any
         },
         logs: true,
         onQueueUpdate: (update) => {
           if (update.status === 'IN_PROGRESS') {
             console.log('Video generation in progress...');
           }
         }
       });

       if (!result.data || !result.data.video || !result.data.video.url) {
         throw new Error('No video URL returned from Fal.ai API');
       }

       console.log('Video generated successfully:', {
         url: result.data.video.url,
         fileSize: result.data.video.file_size
       });

       return result.data.video.url;
    } catch (error) {
      console.error('Error generating video with Fal.ai:', error);
      throw error;
    }
  }

  /**
   * Validate API key by checking if it's properly formatted
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Basic validation - check if API key exists and has proper format
      if (!this.apiKey || this.apiKey.trim().length === 0) {
        return false;
      }
      
      // For now, we'll assume the key is valid if it's provided
      // A real validation would require making a test API call
      return true;
    } catch (error) {
      console.error('Error validating Fal.ai API key:', error);
      return false;
    }
  }

  /**
   * Get supported resolutions for video generation
   */
  getSupportedResolutions(): string[] {
    return ['720p', '1080p', '480p'];
  }

  /**
   * Get supported duration range
   */
  getSupportedDurations(): { min: number; max: number; default: number } {
    return {
      min: 1,
      max: 10,
      default: 6
    };
  }

  /**
   * Validate video generation parameters
   */
  validateParameters({
    imageUrl,
    prompt,
    duration,
    resolution
  }: {
    imageUrl: string;
    prompt: string;
    duration: number;
    resolution: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:'))) {
      errors.push('Valid image URL is required');
    }

    if (!prompt || prompt.trim().length === 0) {
      errors.push('Video prompt is required');
    }

    if (prompt && prompt.length > 600) {
      errors.push('Prompt must be 600 characters or less');
    }

    const supportedDurations = this.getSupportedDurations();
    if (duration < supportedDurations.min || duration > supportedDurations.max) {
      errors.push(`Duration must be between ${supportedDurations.min} and ${supportedDurations.max} seconds`);
    }

    const supportedResolutions = this.getSupportedResolutions();
    if (!supportedResolutions.includes(resolution)) {
      errors.push(`Resolution must be one of: ${supportedResolutions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}