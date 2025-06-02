import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

import { uploadRouter } from './routes/upload';
import { statusRouter } from './routes/status';
import { downloadRouter } from './routes/download';
import { JobManager } from './services/jobManager';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化作业管理器
const jobManager = new JobManager();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 允许内联样式和脚本
}));

// 跨域设置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true,
}));

// 压缩中间件
app.use(compression());

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个IP最多10次请求
  message: {
    error: '请求过于频繁，请稍后再试',
  },
});
app.use('/api/', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 创建上传目录
const uploadDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../outputs');
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(outputDir);

// 配置multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('只支持PDF文件'));
      return;
    }
    cb(null, true);
  },
});

// 将必要的依赖注入到路由中
app.use('/api/upload', upload.single('file'), (req, res, next) => {
  req.jobManager = jobManager;
  req.uploadDir = uploadDir;
  req.outputDir = outputDir;
  next();
}, uploadRouter);

app.use('/api/status', (req, res, next) => {
  req.jobManager = jobManager;
  next();
}, statusRouter);

app.use('/api/download', (req, res, next) => {
  req.outputDir = outputDir;
  next();
}, downloadRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 错误处理中间件
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制（50MB）' });
    }
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : error.message 
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 上传目录: ${uploadDir}`);
  console.log(`📁 输出目录: ${outputDir}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 扩展Express请求类型
declare global {
  namespace Express {
    interface Request {
      jobManager?: JobManager;
      uploadDir?: string;
      outputDir?: string;
    }
  }
} 