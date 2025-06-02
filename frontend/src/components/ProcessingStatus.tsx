'use client';

import React from 'react';
import { Loader2, FileText, Palette, Download } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'uploading' | 'processing';
  progress: number;
  message: string;
}

export default function ProcessingStatus({ status, progress, message }: ProcessingStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <FileText className="h-8 w-8 text-blue-400 animate-pulse" />;
      case 'processing':
        return <Palette className="h-8 w-8 text-purple-400 animate-pulse" />;
      default:
        return <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'uploading':
        return '正在上传';
      case 'processing':
        return '正在生成海报';
      default:
        return '处理中';
    }
  };

  const getSteps = () => {
    const steps = [
      { id: 1, label: '上传文件', progress: 20 },
      { id: 2, label: '解析论文', progress: 40 },
      { id: 3, label: '生成布局', progress: 60 },
      { id: 4, label: '渲染海报', progress: 80 },
      { id: 5, label: '完成处理', progress: 100 },
    ];

    return steps.map(step => ({
      ...step,
      isCompleted: progress >= step.progress,
      isActive: progress >= step.progress - 20 && progress < step.progress,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/80 backdrop-blur-sm border border-blue-500/20 rounded-xl p-8">
        {/* Status Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            {getStatusIcon()}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{getStatusTitle()}</h3>
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>进度</span>
            <span>{progress}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {getSteps().map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 transition-all duration-300 ${
                step.isCompleted
                  ? 'text-green-400'
                  : step.isActive
                  ? 'text-blue-400'
                  : 'text-gray-500'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step.isCompleted
                    ? 'bg-green-500 text-white'
                    : step.isActive
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {step.isCompleted ? '✓' : step.id}
              </div>
              <span className="font-medium">{step.label}</span>
              {step.isActive && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">🔄 处理中...</h4>
          <p className="text-xs text-gray-400">
            AI正在分析您的论文内容，提取关键信息并设计最佳布局。这个过程可能需要几分钟时间，请耐心等待。
          </p>
        </div>
      </div>
    </div>
  );
} 