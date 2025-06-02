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

// 在serverless环境中使用全局变量来模拟持久化
declare global {
  var jobsStore: Map<string, Job> | undefined;
}

// 获取全局作业存储
function getJobsStore(): Map<string, Job> {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.jobsStore) {
      globalThis.jobsStore = new Map<string, Job>();
    }
    return globalThis.jobsStore;
  }
  return new Map<string, Job>();
}

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
    
    const jobs = getJobsStore();
    jobs.set(job.id, job);
    
    // 同时在控制台输出，便于调试
    console.log(`Created job ${jobId}:`, job);
    
    return job;
  }
  
  static getJob(jobId: string): Job | undefined {
    const jobs = getJobsStore();
    const job = jobs.get(jobId);
    
    // 调试输出
    console.log(`Getting job ${jobId}:`, job || 'NOT FOUND');
    console.log('Current jobs in store:', Array.from(jobs.keys()));
    
    return job;
  }
  
  static updateJob(jobId: string, updates: Partial<Job>): void {
    const jobs = getJobsStore();
    const job = jobs.get(jobId);
    if (job) {
      const updatedJob = { ...job, ...updates };
      jobs.set(jobId, updatedJob);
      
      // 调试输出
      console.log(`Updated job ${jobId}:`, updatedJob);
    } else {
      console.log(`Job ${jobId} not found for update`);
    }
  }
  
  static deleteJob(jobId: string): void {
    const jobs = getJobsStore();
    jobs.delete(jobId);
  }
  
  static getAllJobs(): Job[] {
    const jobs = getJobsStore();
    return Array.from(jobs.values());
  }
} 