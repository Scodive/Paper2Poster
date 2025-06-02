import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra';

export const downloadRouter = Router();

downloadRouter.get('/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!req.outputDir) {
      return res.status(500).json({ error: '输出目录未配置' });
    }

    // 查找对应的输出文件
    const outputPath = path.join(req.outputDir, `${jobId}.pptx`);
    
    // 检查文件是否存在
    if (!await fs.pathExists(outputPath)) {
      return res.status(404).json({ error: '文件不存在或尚未生成' });
    }

    // 获取文件信息
    const stats = await fs.stat(outputPath);
    const filename = `poster_${jobId}.pptx`;

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');

    // 创建读取流并传输文件
    const fileStream = fs.createReadStream(outputPath);
    
    fileStream.on('error', (error) => {
      console.error('文件读取错误:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: '文件读取失败' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('文件下载失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: '文件下载失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
});

// 获取文件预览图片
downloadRouter.get('/:jobId/preview', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!req.outputDir) {
      return res.status(500).json({ error: '输出目录未配置' });
    }

    // 查找预览图片
    const previewPath = path.join(req.outputDir, `${jobId}_preview.png`);
    
    if (!await fs.pathExists(previewPath)) {
      return res.status(404).json({ error: '预览图片不存在' });
    }

    // 获取文件信息
    const stats = await fs.stat(previewPath);

    // 设置响应头
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时

    // 创建读取流并传输文件
    const fileStream = fs.createReadStream(previewPath);
    
    fileStream.on('error', (error) => {
      console.error('预览图片读取错误:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: '预览图片读取失败' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('预览图片获取失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: '预览图片获取失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}); 