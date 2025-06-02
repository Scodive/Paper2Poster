import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  filePath?: string;
  outputPath?: string;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class JobManager extends EventEmitter {
  private jobs: Map<string, Job> = new Map();
  private readonly maxJobs = 100; // 最大保存的作业数量
  private readonly jobTimeout = 30 * 60 * 1000; // 30分钟超时

  constructor() {
    super();
    this.startCleanupTimer();
  }

  /**
   * 创建新作业
   */
  createJob(filePath: string): string {
    const jobId = uuidv4();
    const job: Job = {
      id: jobId,
      status: 'pending',
      progress: 0,
      message: '准备处理...',
      filePath,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.emit('jobCreated', job);
    
    // 清理超出限制的作业
    this.cleanupOldJobs();
    
    return jobId;
  }

  /**
   * 获取作业状态
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * 更新作业状态
   */
  updateJob(jobId: string, updates: Partial<Job>): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    Object.assign(job, updates, { updatedAt: new Date() });
    this.jobs.set(jobId, job);
    this.emit('jobUpdated', job);
    
    return true;
  }

  /**
   * 设置作业为处理中
   */
  startProcessing(jobId: string, message: string = '开始处理...'): boolean {
    return this.updateJob(jobId, {
      status: 'processing',
      progress: 10,
      message,
    });
  }

  /**
   * 更新处理进度
   */
  updateProgress(jobId: string, progress: number, message: string): boolean {
    return this.updateJob(jobId, {
      progress: Math.min(progress, 100),
      message,
    });
  }

  /**
   * 设置作业完成
   */
  completeJob(jobId: string, result: any, outputPath: string): boolean {
    return this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      message: '处理完成',
      result,
      outputPath,
    });
  }

  /**
   * 设置作业失败
   */
  failJob(jobId: string, error: string): boolean {
    return this.updateJob(jobId, {
      status: 'error',
      progress: 0,
      message: '处理失败',
      error,
    });
  }

  /**
   * 删除作业
   */
  deleteJob(jobId: string): boolean {
    const deleted = this.jobs.delete(jobId);
    if (deleted) {
      this.emit('jobDeleted', jobId);
    }
    return deleted;
  }

  /**
   * 获取所有作业
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * 获取作业统计信息
   */
  getStats() {
    const jobs = this.getAllJobs();
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      error: jobs.filter(j => j.status === 'error').length,
    };
  }

  /**
   * 清理过期作业
   */
  private cleanupOldJobs(): void {
    const now = new Date();
    const jobsToDelete: string[] = [];

    for (const [jobId, job] of this.jobs) {
      const age = now.getTime() - job.updatedAt.getTime();
      
      // 删除超时的作业或超出最大数量限制的作业
      if (age > this.jobTimeout || this.jobs.size > this.maxJobs) {
        jobsToDelete.push(jobId);
      }
    }

    // 按时间排序，删除最旧的作业
    if (this.jobs.size > this.maxJobs) {
      const sortedJobs = Array.from(this.jobs.entries())
        .sort(([, a], [, b]) => a.updatedAt.getTime() - b.updatedAt.getTime());
      
      const excess = this.jobs.size - this.maxJobs;
      for (let i = 0; i < excess; i++) {
        jobsToDelete.push(sortedJobs[i][0]);
      }
    }

    jobsToDelete.forEach(jobId => {
      this.deleteJob(jobId);
    });
  }

  /**
   * 启动定时清理
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupOldJobs();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }
} 