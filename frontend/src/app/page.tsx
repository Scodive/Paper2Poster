'use client';

import React, { useState } from 'react';
import { Upload, Download, Sparkles, FileText, Palette, Zap } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ProcessingStatus from '../components/ProcessingStatus';
import ResultDisplay from '../components/ResultDisplay';

interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  jobId?: string;
}

export default function Home() {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [resultData, setResultData] = useState<any>(null);

  const handleFileUpload = async (file: File) => {
    setProcessingState({
      status: 'uploading',
      progress: 10,
      message: '正在上传文件...',
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      
      setProcessingState({
        status: 'processing',
        progress: 30,
        message: '正在处理论文...',
        jobId: data.jobId,
      });

      // 轮询处理状态
      pollProcessingStatus(data.jobId);
    } catch (error) {
      setProcessingState({
        status: 'error',
        progress: 0,
        message: '上传失败，请重试',
      });
    }
  };

  const pollProcessingStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        const data = await response.json();

        setProcessingState(prev => ({
          ...prev,
          progress: data.progress,
          message: data.message,
        }));

        if (data.status === 'completed') {
          clearInterval(interval);
          setProcessingState({
            status: 'completed',
            progress: 100,
            message: '海报生成完成！',
            jobId,
          });
          setResultData(data.result);
        } else if (data.status === 'error') {
          clearInterval(interval);
          setProcessingState({
            status: 'error',
            progress: 0,
            message: data.error || '处理失败',
          });
        }
      } catch (error) {
        clearInterval(interval);
        setProcessingState({
          status: 'error',
          progress: 0,
          message: '状态查询失败',
        });
      }
    }, 2000);
  };

  const resetState = () => {
    setProcessingState({
      status: 'idle',
      progress: 0,
      message: '',
    });
    setResultData(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative z-10 border-b border-blue-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Paper2Poster</h1>
                <p className="text-blue-200">AI驱动的科研海报生成器</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                <span>快速 • 智能 • 专业</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {processingState.status === 'idle' && (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <h2 className="text-5xl font-bold mb-4">
                  将论文转化为精美海报
                </h2>
              </div>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                只需上传PDF论文，AI将自动提取关键信息，生成专业的学术海报，支持多种布局和样式
              </p>
              
              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">智能解析</h3>
                  <p className="text-gray-300">自动提取论文标题、摘要、图表等关键信息</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <Palette className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">美观设计</h3>
                  <p className="text-gray-300">AI优化布局，确保信息层次清晰，视觉效果专业</p>
                </div>
                <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                  <Zap className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">快速生成</h3>
                  <p className="text-gray-300">几分钟内完成从论文到海报的转换</p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}

        {(processingState.status === 'uploading' || 
          processingState.status === 'processing') && (
          <ProcessingStatus 
            status={processingState.status}
            progress={processingState.progress}
            message={processingState.message}
          />
        )}

        {processingState.status === 'completed' && resultData && (
          <ResultDisplay 
            result={resultData}
            onReset={resetState}
            jobId={processingState.jobId}
          />
        )}

        {processingState.status === 'error' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-8">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-white mb-2">处理失败</h3>
              <p className="text-gray-300 mb-6">{processingState.message}</p>
              <button
                onClick={resetState}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                重新开始
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-blue-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Paper2Poster. 基于前沿AI技术构建</p>
            <p className="mt-2 text-sm">支持PDF格式论文，推荐文件大小小于50MB</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 