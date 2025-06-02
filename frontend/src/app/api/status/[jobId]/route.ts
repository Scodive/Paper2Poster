import { NextRequest, NextResponse } from 'next/server';
import { JobManager } from '@/lib/jobManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json({ error: '缺少jobId参数' }, { status: 400 });
    }
    
    const job = JobManager.getJob(jobId);
    
    if (!job) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      downloadUrl: job.downloadUrl,
      createdAt: job.createdAt
    });
    
  } catch (error) {
    console.error('状态查询错误:', error);
    return NextResponse.json(
      { error: '查询状态失败' },
      { status: 500 }
    );
  }
} 