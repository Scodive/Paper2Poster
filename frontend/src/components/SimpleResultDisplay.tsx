'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, FileText, CheckCircle } from 'lucide-react';

interface SimpleResultDisplayProps {
  onReset: () => void;
  jobId?: string;
  message?: string;
}

export default function SimpleResultDisplay({ onReset, jobId, message }: SimpleResultDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!jobId) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/download/${jobId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `科研海报-${jobId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">🎉 海报生成成功！</h2>
        <p className="text-gray-300">
          {message || '您的学术海报已经生成完成，可以下载查看。'}
        </p>
      </div>

      {/* Poster Info */}
      <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/80 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <FileText className="h-16 w-16 text-blue-400" />
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">学术海报文本内容</h3>
          <p className="text-gray-300 mb-4">
            AI已经分析了您的论文内容，生成了结构化的海报文本。
          </p>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">📄 包含内容</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 论文标题和作者信息</li>
              <li>• 研究背景和主要贡献</li>
              <li>• 实验结果和关键发现</li>
              <li>• 结论和未来工作展望</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3 group"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>下载中...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>下载海报内容</span>
            </>
          )}
        </button>
        
        <button
          onClick={onReset}
          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3 group"
        >
          <RefreshCw className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span>生成新海报</span>
        </button>
      </div>

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">💡 使用建议</h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h5 className="font-semibold text-purple-300 mb-2">内容编辑</h5>
            <ul className="space-y-1">
              <li>• 可以复制文本到设计软件中</li>
              <li>• 建议使用PowerPoint或Canva</li>
              <li>• 根据需要调整布局和样式</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-blue-300 mb-2">设计提示</h5>
            <ul className="space-y-1">
              <li>• 选择合适的字体和颜色</li>
              <li>• 添加图表和可视化元素</li>
              <li>• 确保内容层次清晰明确</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 