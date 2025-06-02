'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Eye, Share2, Star } from 'lucide-react';

interface ResultDisplayProps {
  result: {
    posterUrl: string;
    posterPreview: string;
    metadata: {
      title: string;
      processingTime: number;
      dimensions: string;
    };
  };
  onReset: () => void;
  jobId?: string;
}

export default function ResultDisplay({ result, onReset, jobId }: ResultDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
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
      a.download = `${result.metadata.title || '科研海报'}.pptx`;
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Paper2Poster - AI生成的科研海报',
          text: `我使用AI生成了一张科研海报：${result.metadata.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('分享取消');
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Star className="h-10 w-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">🎉 海报生成成功！</h2>
        <p className="text-gray-300">
          处理时间: {result.metadata.processingTime}秒 | 尺寸: {result.metadata.dimensions}
        </p>
      </div>

      {/* Poster Preview */}
      <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/80 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">海报预览</h3>
          <span className="text-sm text-gray-400">点击图片查看大图</span>
        </div>
        
        <div className="relative group cursor-pointer">
          <img
            src={result.posterPreview}
            alt="生成的海报预览"
            className="w-full h-auto rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-105"
            onClick={() => window.open(result.posterPreview, '_blank')}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center">
            <Eye className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2">{result.metadata.title}</h4>
          <p className="text-sm text-gray-400">
            这是您论文的AI生成海报预览。海报包含了论文的关键信息，并进行了专业的布局设计。
          </p>
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
              <span>下载海报 (PPT)</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3 group"
        >
          <Share2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span>分享海报</span>
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
        <h4 className="text-lg font-semibold text-white mb-4">📝 使用建议</h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h5 className="font-semibold text-purple-300 mb-2">海报编辑</h5>
            <ul className="space-y-1">
              <li>• 下载的PPT文件可以进一步编辑</li>
              <li>• 可以调整颜色、字体和布局</li>
              <li>• 建议在PowerPoint中打开</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-blue-300 mb-2">打印建议</h5>
            <ul className="space-y-1">
              <li>• 推荐使用A0或A1尺寸打印</li>
              <li>• 选择高质量打印设置</li>
              <li>• 检查图片分辨率是否清晰</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 