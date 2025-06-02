# 🚀 Paper2Poster Web应用 - 快速启动指南

## 📋 前置要求

- Node.js 18+ 
- npm 或 yarn
- Git

## ⚡ 5分钟快速部署

### 1. 克隆并安装
```bash
git clone <your-repo-url>
cd paper2poster-web
npm install
```

### 2. 配置环境
```bash
cp env.example .env
```

编辑 `.env` 文件：
```env
GEMINI_API_KEY=GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash-preview-05-20
```

### 3. 本地运行
```bash
npm run dev
```

访问: http://localhost:3000

### 4. 部署到Vercel

#### 方法一：使用脚本（推荐）
```bash
./deploy.sh
```

#### 方法二：手动部署
1. 推送代码到GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入项目
4. 添加环境变量：
   - `GEMINI_API_KEY`: `GEMINI_API_KEY`
   - `GEMINI_MODEL`: `gemini-2.5-flash-preview-05-20`
5. 部署

## 🎯 使用流程

1. **上传PDF论文** - 拖拽或点击上传
2. **等待处理** - AI自动解析和生成
3. **下载海报** - 获取PPT格式海报文件

## 🔧 自定义配置

### 修改API密钥
编辑 `.env` 文件或在Vercel中更新环境变量。

### 调整文件大小限制
修改 `backend/src/server.ts` 中的 `fileSize` 配置。

### 更改UI主题
编辑 `frontend/tailwind.config.js` 中的颜色配置。

## 📞 获取帮助

- 查看 `README-WEB.md` 获取详细文档
- 检查控制台错误信息
- 确认API密钥有效性

## 🎉 完成！

你的Paper2Poster Web应用现在已经可以使用了！ 