import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paper2Poster - AI科研论文海报生成器",
  description: "使用AI技术将科研论文自动转换为精美海报，支持多种布局和主题",
  keywords: "AI, 论文, 海报, 科研, 学术, 自动化, Paper2Poster",
  authors: [{ name: "Paper2Poster Team" }],
  openGraph: {
    title: "Paper2Poster - AI科研论文海报生成器",
    description: "使用AI技术将科研论文自动转换为精美海报",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
            }}
          />
        </div>
      </body>
    </html>
  );
} 