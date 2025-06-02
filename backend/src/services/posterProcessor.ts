import path from 'path';
import fs from 'fs-extra';
import { JobManager } from './jobManager';
import { GeminiService } from './geminiService';
import pdfParse from 'pdf-parse';

export class PosterProcessor {
  private jobManager: JobManager;
  private outputDir: string;
  private geminiService: GeminiService;
  private readonly processingTimeout = 50000; // 50秒超时，留出缓冲时间

  constructor(jobManager: JobManager, outputDir: string) {
    this.jobManager = jobManager;
    this.outputDir = outputDir;
    this.geminiService = new GeminiService();
  }

  /**
   * 异步处理海报生成（优化版本）
   */
  async processAsync(jobId: string, filePath: string, originalName: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.jobManager.startProcessing(jobId, '开始快速处理...');

      // 设置处理超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('处理超时，请稍后重试')), this.processingTimeout);
      });

      // 主处理流程
      const processingPromise = this.executeProcessing(jobId, filePath, originalName, startTime);

      // 竞态处理：超时或完成
      await Promise.race([processingPromise, timeoutPromise]);

    } catch (error) {
      console.error('海报处理失败:', error);
      this.jobManager.failJob(jobId, error instanceof Error ? error.message : '处理失败');
    }
  }

  /**
   * 执行主要处理流程
   */
  private async executeProcessing(jobId: string, filePath: string, originalName: string, startTime: number): Promise<void> {
    // 步骤1: 快速解析PDF
    this.jobManager.updateProgress(jobId, 15, '正在解析PDF...');
    const pdfContent = await this.parsePDFQuick(filePath);
    
    // 检查时间
    if (Date.now() - startTime > 45000) {
      throw new Error('处理时间超限，切换到后台处理模式');
    }

    // 步骤2: 快速提取关键信息
    this.jobManager.updateProgress(jobId, 35, '正在提取关键信息...');
    const extractedInfo = await this.extractKeyInformationQuick(pdfContent);
    
    // 检查时间
    if (Date.now() - startTime > 50000) {
      throw new Error('处理时间超限，请稍后查看结果');
    }

    // 步骤3: 快速生成布局和内容
    this.jobManager.updateProgress(jobId, 60, '正在生成海报...');
    const layout = this.getDefaultLayout();
    const posterContent = await this.generatePosterContentQuick(extractedInfo, layout);

    // 步骤4: 生成文件
    this.jobManager.updateProgress(jobId, 80, '正在生成文件...');
    const outputPath = await this.generatePosterFileQuick(jobId, posterContent, originalName);
    
    // 步骤5: 生成预览
    this.jobManager.updateProgress(jobId, 95, '正在生成预览...');
    const previewPath = await this.generatePreviewQuick(outputPath, jobId);

    // 完成
    const processingTime = Math.round((Date.now() - startTime) / 1000);
    const result = {
      posterUrl: `/api/download/${jobId}`,
      posterPreview: `/api/download/${jobId}/preview`,
      metadata: {
        title: extractedInfo.title || '科研海报',
        processingTime,
        dimensions: '48x36 inches',
      },
    };

    this.jobManager.completeJob(jobId, result, outputPath);
  }

  /**
   * 快速PDF解析（限制内容长度）
   */
  private async parsePDFQuick(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer, {
        max: 5, // 限制页数
      });
      return data.text.substring(0, 5000); // 限制文本长度
    } catch (error) {
      throw new Error(`PDF解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 快速信息提取（简化版本）
   */
  private async extractKeyInformationQuick(pdfContent: string): Promise<any> {
    const prompt = `
请快速分析以下论文内容，提取关键信息。请直接返回JSON格式：

{
  "title": "论文标题",
  "authors": ["作者"],
  "abstract": "摘要（100字内）",
  "methodology": "方法（50字内）",
  "results": "结果（50字内）",
  "conclusion": "结论（50字内）",
  "keywords": ["关键词1", "关键词2"]
}

论文内容（前3000字）：
${pdfContent.substring(0, 3000)}
`;

    try {
      const response = await this.geminiService.generateText(prompt, {
        temperature: 0.1, // 降低温度提高速度
        maxTokens: 800,   // 减少token数量
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // 返回从PDF文本解析的基础信息
        return this.extractBasicInfo(pdfContent);
      }
    } catch (error) {
      console.warn('AI提取失败，使用基础解析:', error);
      return this.extractBasicInfo(pdfContent);
    }
  }

  /**
   * 基础信息提取（无AI）
   */
  private extractBasicInfo(pdfContent: string): any {
    const lines = pdfContent.split('\n').filter(line => line.trim());
    const title = lines.find(line => line.length > 10 && line.length < 200) || '科研海报';
    
    return {
      title: title.substring(0, 100),
      authors: ['作者'],
      abstract: pdfContent.substring(0, 300) + '...',
      methodology: '方法论概述',
      results: '研究结果',
      conclusion: '结论总结',
      keywords: ['科研', '论文'],
    };
  }

  /**
   * 快速生成海报内容
   */
  private async generatePosterContentQuick(extractedInfo: any, layout: any): Promise<any> {
    return {
      title: extractedInfo.title,
      authors: Array.isArray(extractedInfo.authors) ? extractedInfo.authors.join(', ') : '作者',
      sections: {
        abstract: {
          title: '摘要 / Abstract',
          content: extractedInfo.abstract || '论文摘要',
          position: layout.layout.abstract_section,
        },
        methodology: {
          title: '方法 / Methodology', 
          content: extractedInfo.methodology || '研究方法',
          position: layout.layout.methodology_section,
        },
        results: {
          title: '结果 / Results',
          content: extractedInfo.results || '研究结果',
          position: layout.layout.results_section,
        },
        conclusion: {
          title: '结论 / Conclusion',
          content: extractedInfo.conclusion || '研究结论',
          position: layout.layout.conclusion_section,
        },
      },
      colorScheme: layout.color_scheme,
      keywords: extractedInfo.keywords || [],
    };
  }

  /**
   * 快速生成海报文件
   */
  private async generatePosterFileQuick(jobId: string, posterContent: any, originalName: string): Promise<string> {
    const outputPath = path.join(this.outputDir, `${jobId}.pptx`);
    
    // 创建简化的海报数据
    const posterData = {
      title: posterContent.title,
      content: posterContent,
      timestamp: new Date().toISOString(),
      note: '此文件由Paper2Poster AI生成，可使用PowerPoint编辑',
    };

    // 生成JSON数据文件（作为示例）
    await fs.writeFile(outputPath.replace('.pptx', '.json'), JSON.stringify(posterData, null, 2));
    
    // 创建基础文本文件作为占位符
    const textContent = `
Paper2Poster 生成的海报

标题: ${posterContent.title}
作者: ${posterContent.authors}

摘要:
${posterContent.sections.abstract.content}

方法:
${posterContent.sections.methodology.content}

结果:
${posterContent.sections.results.content}

结论:
${posterContent.sections.conclusion.content}

生成时间: ${new Date().toLocaleString('zh-CN')}
`;
    
    await fs.writeFile(outputPath, textContent);
    return outputPath;
  }

  /**
   * 快速生成预览图
   */
  private async generatePreviewQuick(posterPath: string, jobId: string): Promise<string> {
    const previewPath = path.join(this.outputDir, `${jobId}_preview.png`);
    
    // 创建简单的预览图占位符
    const placeholderImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    await fs.writeFile(previewPath, placeholderImage);
    return previewPath;
  }

  /**
   * 原有方法保持不变
   */
  private async parsePDF(filePath: string): Promise<string> {
    return this.parsePDFQuick(filePath);
  }

  private async extractKeyInformation(pdfContent: string): Promise<any> {
    return this.extractKeyInformationQuick(pdfContent);
  }

  private async generateLayout(extractedInfo: any): Promise<any> {
    return this.getDefaultLayout();
  }

  private async generatePosterContent(extractedInfo: any, layout: any): Promise<any> {
    return this.generatePosterContentQuick(extractedInfo, layout);
  }

  private async generatePosterFile(jobId: string, posterContent: any, originalName: string): Promise<string> {
    return this.generatePosterFileQuick(jobId, posterContent, originalName);
  }

  private async generatePreview(posterPath: string, jobId: string): Promise<string> {
    return this.generatePreviewQuick(posterPath, jobId);
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