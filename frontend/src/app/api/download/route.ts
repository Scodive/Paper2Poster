import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, fileName } = body;
    
    if (!content) {
      return NextResponse.json({ error: '没有内容可下载' }, { status: 400 });
    }
    
    const safeFileName = fileName || '科研海报';
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeFileName}.txt"`,
      },
    });
    
  } catch (error) {
    console.error('下载错误:', error);
    return NextResponse.json(
      { error: '下载失败' },
      { status: 500 }
    );
  }
} 