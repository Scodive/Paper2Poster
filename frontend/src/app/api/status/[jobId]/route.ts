import { NextRequest, NextResponse } from 'next/server';
import { JobManager } from '@/lib/jobManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    console.log(`Status request for jobId: ${jobId}`);
    
    if (!jobId) {
      console.log('Missing jobId parameter');
      return NextResponse.json({ error: '缺少jobId参数' }, { status: 400 });
    }
    
    const job = JobManager.getJob(jobId);
    
    if (!job) {
      console.log(`Job ${jobId} not found`);
      
      // 返回一个默认的"处理中"状态，避免404
      return NextResponse.json({
        id: jobId,
        status: 'processing',
        progress: 5,
        message: '正在查找作业信息...',
        createdAt: new Date().toISOString()
      });
    }
    
    console.log(`Found job ${jobId}:`, job);
    
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