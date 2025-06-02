import { Router, Request, Response } from 'express';
import { PosterProcessor } from '../services/posterProcessor';

export const uploadRouter = Router();

uploadRouter.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未找到上传的文件' });
    }

    if (!req.jobManager) {
      return res.status(500).json({ error: '服务未初始化' });
    }

    const { path: filePath, originalname, mimetype, size } = req.file;

    // 验证文件类型
    if (mimetype !== 'application/pdf') {
      return res.status(400).json({ error: '只支持PDF文件' });
    }

    // 验证文件大小 (50MB)
    if (size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: '文件大小不能超过50MB' });
    }

    // 创建处理作业
    const jobId = req.jobManager.createJob(filePath);
    
    // 启动异步处理
    const processor = new PosterProcessor(req.jobManager, req.outputDir!);
    processor.processAsync(jobId, filePath, originalname).catch((error) => {
      console.error('海报处理失败:', error);
      req.jobManager!.failJob(jobId, error.message || '处理失败');
    });

    res.json({
      success: true,
      jobId,
      message: '文件上传成功，开始处理',
      filename: originalname,
      size,
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ 
      error: '文件上传失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}); 