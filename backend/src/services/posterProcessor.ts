import path from 'path';
import fs from 'fs-extra';
import { JobManager } from './jobManager';
import { GeminiService } from './geminiService';
import pdfParse from 'pdf-parse';

export class PosterProcessor {
  private jobManager: JobManager;
  private outputDir: string;
  private geminiService: GeminiService;

  constructor(jobManager: JobManager, outputDir: string) {
    this.jobManager = jobManager;
    this.outputDir = outputDir;
    this.geminiService = new GeminiService();
  }

  /**
   * 异步处理海报生成
   */
  async processAsync(jobId: string, filePath: string, originalName: string): Promise<void> {
    try {
      this.jobManager.startProcessing(jobId, '开始解析PDF...');

      // 步骤1: 解析PDF
      const pdfContent = await this.parsePDF(filePath);
      this.jobManager.updateProgress(jobId, 20, '正在提取论文内容...');

      // 步骤2: 使用Gemini提取关键信息
      const extractedInfo = await this.extractKeyInformation(pdfContent);
      this.jobManager.updateProgress(jobId, 40, '正在生成海报布局...');

      // 步骤3: 生成海报布局
      const layout = await this.generateLayout(extractedInfo);
      this.jobManager.updateProgress(jobId, 60, '正在生成海报内容...');

      // 步骤4: 生成海报内容
      const posterContent = await this.generatePosterContent(extractedInfo, layout);
      this.jobManager.updateProgress(jobId, 80, '正在渲染海报...');

      // 步骤5: 生成最终海报文件
      const outputPath = await this.generatePosterFile(jobId, posterContent, originalName);
      this.jobManager.updateProgress(jobId, 90, '正在生成预览图...');

      // 步骤6: 生成预览图
      const previewPath = await this.generatePreview(outputPath, jobId);
      this.jobManager.updateProgress(jobId, 100, '海报生成完成！');

      // 完成作业
      const result = {
        posterUrl: `/api/download/${jobId}`,
        posterPreview: `/api/download/${jobId}/preview`,
        metadata: {
          title: extractedInfo.title || '科研海报',
          processingTime: Math.round((Date.now() - new Date(this.jobManager.getJob(jobId)!.createdAt).getTime()) / 1000),
          dimensions: '48x36 inches',
        },
      };

      this.jobManager.completeJob(jobId, result, outputPath);

    } catch (error) {
      console.error('海报处理失败:', error);
      this.jobManager.failJob(jobId, error instanceof Error ? error.message : '处理失败');
    }
  }

  /**
   * 解析PDF文件
   */
  private async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 使用Gemini提取关键信息
   */
  private async extractKeyInformation(pdfContent: string): Promise<any> {
    const prompt = `
请分析以下科研论文内容，提取关键信息用于生成学术海报。请以JSON格式返回结果：

{
  "title": "论文标题",
  "authors": ["作者1", "作者2"],
  "abstract": "摘要内容",
  "introduction": "引言要点",
  "methodology": "方法论要点",
  "results": "主要结果",
  "conclusion": "结论要点",
  "keywords": ["关键词1", "关键词2"],
  "figures": ["图表描述1", "图表描述2"],
  "key_contributions": ["贡献点1", "贡献点2"]
}

论文内容：
${pdfContent.substring(0, 8000)} // 限制长度避免超出token限制
`;

    try {
      const response = await this.geminiService.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 2048,
      });

      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI返回格式不正确');
      }
    } catch (error) {
      throw new Error(`信息提取失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 生成海报布局
   */
  private async generateLayout(extractedInfo: any): Promise<any> {
    const prompt = `
基于以下论文信息，设计一个学术海报的布局结构。请以JSON格式返回布局配置：

{
  "layout": {
    "title_section": {"x": 0, "y": 0, "width": 100, "height": 15},
    "authors_section": {"x": 0, "y": 15, "width": 100, "height": 5},
    "abstract_section": {"x": 0, "y": 20, "width": 45, "height": 25},
    "introduction_section": {"x": 0, "y": 45, "width": 45, "height": 25},
    "methodology_section": {"x": 50, "y": 20, "width": 50, "height": 25},
    "results_section": {"x": 50, "y": 45, "width": 50, "height": 25},
    "conclusion_section": {"x": 0, "y": 70, "width": 100, "height": 15},
    "references_section": {"x": 0, "y": 85, "width": 100, "height": 15}
  },
  "color_scheme": {
    "primary": "#2563eb",
    "secondary": "#1e40af",
    "accent": "#3b82f6",
    "text": "#1f2937",
    "background": "#ffffff"
  }
}

论文信息：
标题: ${extractedInfo.title}
主要内容: ${extractedInfo.abstract}
`;

    try {
      const response = await this.geminiService.generateText(prompt, {
        temperature: 0.5,
        maxTokens: 1024,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // 返回默认布局
        return this.getDefaultLayout();
      }
    } catch (error) {
      console.warn('布局生成失败，使用默认布局:', error);
      return this.getDefaultLayout();
    }
  }

  /**
   * 生成海报内容
   */
  private async generatePosterContent(extractedInfo: any, layout: any): Promise<any> {
    return {
      title: extractedInfo.title,
      authors: extractedInfo.authors?.join(', ') || '',
      sections: {
        abstract: {
          title: '摘要 / Abstract',
          content: extractedInfo.abstract,
          position: layout.layout.abstract_section,
        },
        introduction: {
          title: '引言 / Introduction',
          content: extractedInfo.introduction,
          position: layout.layout.introduction_section,
        },
        methodology: {
          title: '方法 / Methodology',
          content: extractedInfo.methodology,
          position: layout.layout.methodology_section,
        },
        results: {
          title: '结果 / Results',
          content: extractedInfo.results,
          position: layout.layout.results_section,
        },
        conclusion: {
          title: '结论 / Conclusion',
          content: extractedInfo.conclusion,
          position: layout.layout.conclusion_section,
        },
      },
      colorScheme: layout.color_scheme,
      keywords: extractedInfo.keywords || [],
    };
  }

  /**
   * 生成海报文件 (简化版本，实际应该调用Paper2Poster的核心逻辑)
   */
  private async generatePosterFile(jobId: string, posterContent: any, originalName: string): Promise<string> {
    const outputPath = path.join(this.outputDir, `${jobId}.pptx`);
    
    // 这里应该集成Paper2Poster的核心逻辑
    // 目前创建一个简单的示例文件
    const mockPosterData = {
      title: posterContent.title,
      content: posterContent,
      timestamp: new Date().toISOString(),
    };

    // 创建一个简单的文本文件作为示例（实际应该生成PPTX）
    await fs.writeFile(outputPath.replace('.pptx', '.json'), JSON.stringify(mockPosterData, null, 2));
    
    // 复制一个示例PPTX文件或创建基本的PPTX
    await this.createBasicPPTX(outputPath, posterContent);
    
    return outputPath;
  }

  /**
   * 生成预览图
   */
  private async generatePreview(posterPath: string, jobId: string): Promise<string> {
    const previewPath = path.join(this.outputDir, `${jobId}_preview.png`);
    
    // 这里应该将PPTX转换为PNG预览图
    // 目前创建一个简单的占位图片
    const placeholderImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    await fs.writeFile(previewPath, placeholderImage);
    return previewPath;
  }

  /**
   * 创建基本的PPTX文件
   */
  private async createBasicPPTX(outputPath: string, posterContent: any): Promise<void> {
    // 这里应该使用PowerPoint库创建真正的PPTX文件
    // 目前创建一个简单的文件作为占位符
    const basicContent = `Paper2Poster Generated File\n\nTitle: ${posterContent.title}\n\nGenerated at: ${new Date().toISOString()}`;
    await fs.writeFile(outputPath, basicContent);
  }

  /**
   * 获取默认布局
   */
  private getDefaultLayout(): any {
    return {
      layout: {
        title_section: { x: 0, y: 0, width: 100, height: 15 },
        authors_section: { x: 0, y: 15, width: 100, height: 5 },
        abstract_section: { x: 0, y: 20, width: 45, height: 25 },
        introduction_section: { x: 0, y: 45, width: 45, height: 25 },
        methodology_section: { x: 50, y: 20, width: 50, height: 25 },
        results_section: { x: 50, y: 45, width: 50, height: 25 },
        conclusion_section: { x: 0, y: 70, width: 100, height: 15 },
        references_section: { x: 0, y: 85, width: 100, height: 15 },
      },
      color_scheme: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff',
      },
    };
  }
} 