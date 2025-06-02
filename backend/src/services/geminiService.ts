import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export class GeminiService {
  private readonly apiKey: string;
  private readonly modelName: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDy9pYAEW7e2Ewk__9TCHAD5X_G1VhCtVw';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
  }

  /**
   * 调用Gemini API生成文本
   */
  async generateText(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      const request: GeminiRequest = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2048,
          topK: 40,
          topP: 0.95,
        }
      };

      const response = await axios.post<GeminiResponse>(this.baseUrl, request, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60秒超时
      });

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('Gemini API返回空结果');
      }

      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Gemini API返回格式错误');
      }

      return candidate.content.parts[0].text;
    } catch (error) {
      console.error('Gemini API调用失败:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('API调用频率超限，请稍后重试');
        } else if (error.response?.status === 401) {
          throw new Error('API密钥无效');
        } else if (error.response?.status === 403) {
          throw new Error('API访问被拒绝');
        }
      }
      throw new Error(`AI服务调用失败: ${error.message}`);
    }
  }

  /**
   * 调用Gemini API处理带图片的请求
   */
  async generateWithImage(prompt: string, imagePath: string): Promise<string> {
    try {
      // 读取图片文件
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const request: GeminiRequest = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topK: 40,
          topP: 0.95,
        }
      };

      const response = await axios.post<GeminiResponse>(this.baseUrl, request, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2分钟超时
      });

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('Gemini API返回空结果');
      }

      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Gemini API返回格式错误');
      }

      return candidate.content.parts[0].text;
    } catch (error) {
      console.error('Gemini API图片处理失败:', error);
      throw new Error(`AI图片处理失败: ${error.message}`);
    }
  }

  /**
   * 获取文件MIME类型
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      case '.pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateText('Hello, test connection.', { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error('Gemini API连接测试失败:', error);
      return false;
    }
  }
} 