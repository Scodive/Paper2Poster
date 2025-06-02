# 🎓 Paper2Poster Web应用

基于Paper2Poster项目的Web应用版本，使用AI技术将科研论文自动转换为精美海报。

## ✨ 功能特性

- 📄 **PDF论文上传**: 支持拖拽上传，最大50MB
- 🤖 **AI智能解析**: 使用Gemini 2.5 Flash提取关键信息
- 🎨 **自动布局设计**: AI优化的专业海报布局
- 📱 **响应式界面**: 现代化科技风格UI
- ⚡ **实时进度**: 处理状态实时更新
- 💾 **文件下载**: 生成可编辑的PPT格式海报

## 🛠️ 技术栈

### 前端
- **Next.js 14** - React框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **React Hot Toast** - 通知组件

### 后端
- **Express.js** - Node.js服务器
- **TypeScript** - 类型安全
- **Multer** - 文件上传
- **PDF-Parse** - PDF解析
- **Gemini API** - AI文本生成

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd paper2poster-web
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制环境变量文件：
```bash
cp env.example .env
```

编辑 `.env` 文件，配置你的Gemini API密钥：
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-preview-05-20
```

### 4. 开发模式运行
```bash
npm run dev
```

应用将在以下地址启动：
- 前端: http://localhost:3000
- 后端API: http://localhost:3001

## 📦 部署到Vercel

### ⚠️ 重要说明
由于Vercel免费计划限制，serverless函数执行时间最大为60秒。为了在此限制内完成海报生成，系统已进行以下优化：

- **快速处理模式**: 限制PDF页数和文本长度
- **简化AI处理**: 减少token使用，提高响应速度
- **超时处理**: 50秒内完成处理，避免超时

### 🔧 升级选项
如需处理大型论文或获得更好的AI处理效果，可考虑：
1. **升级Vercel计划**: 获得更长的执行时间 (最高900秒)
2. **部署到其他平台**: 如AWS Lambda、Google Cloud Functions
3. **本地部署**: 无时间限制，完整AI处理能力

### 1. 准备部署
确保所有文件已提交到Git仓库。

### 2. 连接Vercel
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的Git仓库

### 3. 配置环境变量
在Vercel项目设置中添加环境变量：

| 变量名 | 值 | 描述 |
|--------|-----|------|
| `GEMINI_API_KEY` | `GEMINI_API_KEY` | Gemini API密钥 |
| `GEMINI_MODEL` | `gemini-2.5-flash-preview-05-20` | Gemini模型名称 |
| `NODE_ENV` | `production` | 环境标识 |

### 4. 部署设置
Vercel会自动检测到 `vercel.json` 配置文件并按照配置进行部署。

### 5. 自定义域名（可选）
在Vercel项目设置中可以配置自定义域名。

## 🔧 项目结构

```
paper2poster-web/
├── frontend/                 # Next.js前端应用
│   ├── src/
│   │   ├── app/             # App Router页面
│   │   ├── components/      # React组件
│   │   └── styles/          # 样式文件
│   ├── package.json
│   └── next.config.js
├── backend/                  # Express.js后端API
│   ├── src/
│   │   ├── routes/          # API路由
│   │   ├── services/        # 业务逻辑服务
│   │   └── server.ts        # 服务器入口
│   ├── package.json
│   └── tsconfig.json
├── vercel.json              # Vercel部署配置
├── package.json             # 根目录依赖
└── README-WEB.md           # 项目文档
```

## 🔌 API接口

### 文件上传
```
POST /api/upload
Content-Type: multipart/form-data

Body: file (PDF文件)
```

### 查询状态
```
GET /api/status/:jobId
```

### 下载海报
```
GET /api/download/:jobId
```

### 预览图片
```
GET /api/download/:jobId/preview
```

## 🎨 界面预览

### 主页面
- 科技风格的深色主题
- 渐变背景和玻璃效果
- 拖拽上传区域
- 功能特性展示

### 处理状态页面
- 实时进度条
- 步骤状态指示器
- 处理提示信息

### 结果展示页面
- 海报预览图
- 下载和分享按钮
- 使用建议提示

## ⚙️ 配置说明

### Gemini API配置
```typescript
// backend/src/services/geminiService.ts
const API_KEY = 'GEMINI_API_KEY';
const MODEL_NAME = 'gemini-2.5-flash-preview-05-20';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
```

### 文件上传限制
- 支持格式: PDF
- 最大大小: 50MB
- 上传目录: `backend/uploads/`
- 输出目录: `backend/outputs/`

## 🔍 故障排除

### 常见问题

1. **API密钥错误**
   - 检查 `.env` 文件中的 `GEMINI_API_KEY` 是否正确
   - 确认API密钥有效且有足够配额

2. **文件上传失败**
   - 检查文件格式是否为PDF
   - 确认文件大小不超过50MB
   - 检查服务器磁盘空间

3. **部署失败**
   - 检查 `vercel.json` 配置
   - 确认环境变量已正确设置
   - 查看Vercel部署日志

### 开发调试
```bash
# 查看前端日志
npm run dev:frontend

# 查看后端日志
npm run dev:backend

# 构建检查
npm run build
```

## 📝 许可证

本项目基于原Paper2Poster项目，遵循相同的开源许可证。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📞 支持

如有问题，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至项目维护者

---

**注意**: 这是Paper2Poster项目的Web应用版本，核心算法逻辑基于原项目实现。当前版本为演示版本，实际生产使用需要进一步集成完整的Paper2Poster核心逻辑。 