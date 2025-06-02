'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    setError('');
    
    if (file.type !== 'application/pdf') {
      setError('请上传PDF格式的文件');
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
      setError('文件大小不能超过50MB');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10 scale-105'
            : 'border-gray-600 hover:border-gray-500'
        } ${error ? 'border-red-500 bg-red-500/10' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-input"
        />
        
        <div className="space-y-4">
          {error ? (
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
          ) : (
            <div className="relative">
              <Upload className={`h-16 w-16 mx-auto transition-colors ${
                isDragOver ? 'text-blue-400' : 'text-gray-400'
              }`} />
              <div className="absolute -top-2 -right-2">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          )}
          
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${
              error ? 'text-red-400' : 'text-white'
            }`}>
              {error || '上传您的PDF论文'}
            </h3>
            
            {!error && (
              <>
                <p className="text-gray-300 mb-4">
                  拖放文件到这里，或点击选择文件
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• 支持PDF格式</p>
                  <p>• 最大文件大小50MB</p>
                  <p>• 支持中英文论文</p>
                </div>
              </>
            )}
          </div>
          
          <label
            htmlFor="file-input"
            className={`inline-block px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 ${
              error
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
            }`}
          >
            {error ? '重新选择文件' : '选择PDF文件'}
          </label>
        </div>
      </div>
      
      {/* Tips */}
      <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-3">💡 使用提示</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p>• 推荐上传带有图表的论文</p>
            <p>• 确保PDF文本可以复制</p>
          </div>
          <div>
            <p>• 处理时间约2-5分钟</p>
            <p>• 生成的海报为PPT格式</p>
          </div>
        </div>
      </div>
    </div>
  );
} 