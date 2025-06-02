// 作业状态管理器
export interface Job {
  id: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  fileName: string;
  filePath: string;
  createdAt: string;
  message: string;
  downloadUrl?: string;
  outputPath?: string;
}

// 全局作业存储
const jobs = new Map<string, Job>();

export class JobManager {
  static createJob(jobId: string, fileName: string, filePath: string): Job {
    const job: Job = {
      id: jobId,
      status: 'processing',
      progress: 0,
      fileName,
      filePath,
      createdAt: new Date().toISOString(),
      message: '开始处理文件...'
    };
    
    jobs.set(job.id, job);
    return job;
  }
  
  static getJob(jobId: string): Job | undefined {
    return jobs.get(jobId);
  }
  
  static updateJob(jobId: string, updates: Partial<Job>): void {
    const job = jobs.get(jobId);
    if (job) {
      const updatedJob = { ...job, ...updates };
      jobs.set(jobId, updatedJob);
    }
  }
  
  static deleteJob(jobId: string): void {
    jobs.delete(jobId);
  }
  
  static getAllJobs(): Job[] {
    return Array.from(jobs.values());
  }
} 