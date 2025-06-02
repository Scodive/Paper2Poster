# 🎓 Paper2Poster Web应用

这是一个基于原Paper2Poster项目的Web界面，能够将学术论文一键转换为精美的PPT海报。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Paper2Poster原有依赖
pip install -r requirements.txt

# 安装Web应用额外依赖
pip install -r requirements_web.txt
```

### 2. 配置API密钥

创建 `.env` 文件并添加您的OpenAI API密钥：

```bash
OPENAI_API_KEY=你的openai_api_密钥
```

### 3. 启动Web应用

```bash
python app.py
```

应用将在 `http://localhost:5000` 启动。

## 📋 支持的模型

### 文本模型 (LLM)
- **GPT-4o**: 最高质量，需要OpenAI API
- **Qwen-2.5-7B**: 开源模型，需要本地部署vLLM

### 视觉模型 (VLM)  
- **GPT-4o**: 最高质量，需要OpenAI API
- **Qwen-VL**: 开源模型，需要本地部署vLLM

## 🔧 本地模型部署 (可选)

如果要使用开源模型，需要先部署vLLM服务：

### 部署Qwen-2.5-7B (文本)
```bash
python -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen2.5-7B-Instruct \
    --port 8000
```

### 部署Qwen-VL (视觉)
```bash
python -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen2.5-VL-7B-Instruct \
    --port 7000
```

## 🎯 使用流程

1. **选择模型**: 根据您的需求和资源选择LLM和VLM
2. **上传PDF**: 拖拽或点击上传您的学术论文PDF文件
3. **生成海报**: 点击"生成海报"按钮开始处理
4. **下载结果**: 生成完成后下载可编辑的PPT文件

## 💡 模型推荐

### 高性能推荐 (需要OpenAI API)
- LLM: GPT-4o
- VLM: GPT-4o

### 经济型推荐 (混合)
- LLM: Qwen-2.5-7B (本地)
- VLM: GPT-4o (API)

### 完全本地化 (需要本地部署)
- LLM: Qwen-2.5-7B
- VLM: Qwen-VL

## 📁 输出文件

生成的海报将保存为：
- **主文件**: `poster.pptx` - 可编辑的PowerPoint文件
- **预览图**: `poster_slide_1.png` - 海报预览图像

## ⚙️ 技术架构

- **前端**: HTML + CSS + JavaScript
- **后端**: Flask + Python
- **AI模型**: 支持OpenAI API和本地vLLM
- **海报生成**: 基于原Paper2Poster的PosterAgent多智能体系统

## 🔍 故障排除

### 生成失败
1. 检查API密钥是否正确配置
2. 确认网络连接正常
3. 检查PDF文件是否完整且小于16MB

### 本地模型无法连接
1. 确认vLLM服务正在运行
2. 检查端口配置是否正确 (在 `utils/wei_utils.py` 中)
3. 确认模型已正确下载

## 📞 技术支持

如遇问题，请检查：
1. 控制台错误信息
2. 浏览器开发者工具
3. 服务器日志输出

基于原Paper2Poster项目: https://github.com/Paper2Poster/Paper2Poster 