import { Router, Request, Response } from 'express';

export const statusRouter = Router();

statusRouter.get('/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!req.jobManager) {
      return res.status(500).json({ error: '服务未初始化' });
    }

    const job = req.jobManager.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: '作业不存在' });
    }

    // 返回作业状态信息
    res.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });

  } catch (error) {
    console.error('获取作业状态失败:', error);
    res.status(500).json({ 
      error: '获取状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取所有作业统计信息
statusRouter.get('/', (req: Request, res: Response) => {
  try {
    if (!req.jobManager) {
      return res.status(500).json({ error: '服务未初始化' });
    }

    const stats = req.jobManager.getStats();
    const jobs = req.jobManager.getAllJobs().map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));

    res.json({
      stats,
      jobs,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('获取作业统计失败:', error);
    res.status(500).json({ 
      error: '获取统计信息失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
}); 