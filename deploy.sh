#!/bin/bash

# Paper2Poster Web应用部署脚本

echo "🚀 开始部署Paper2Poster Web应用..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node_version=$(node -v)
echo "当前Node.js版本: $node_version"

if [[ ! "$node_version" =~ ^v1[8-9]\.|^v[2-9][0-9]\. ]]; then
    echo "❌ 需要Node.js 18或更高版本"
    exit 1
fi

# 进入frontend目录
cd frontend

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量
echo "🔧 检查环境配置..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  未找到.env.local文件，从示例文件创建..."
    cat > .env.local << EOL
# Gemini API 配置
GEMINI_API_KEY=AIzaSyDy9pYAEW7e2Ewk__9TCHAD5X_G1VhCtVw
GEMINI_MODEL=gemini-2.5-flash-preview-05-20

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
EOL
    echo "✅ 已创建.env.local文件，请编辑并添加你的API密钥"
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败"
    exit 1
fi

# 返回根目录
cd ..

# 部署到Vercel（如果安装了Vercel CLI）
if command -v vercel &> /dev/null; then
    echo "🌐 检测到Vercel CLI，开始部署..."
    
    # 设置环境变量
    echo "🔑 配置环境变量..."
    vercel env add GEMINI_API_KEY production
    vercel env add GEMINI_MODEL production
    vercel env add NODE_ENV production
    
    # 部署
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 部署成功！"
        echo "📱 你的应用已部署到Vercel"
    else
        echo "❌ 部署失败"
        exit 1
    fi
else
    echo "📝 Vercel CLI未安装，请手动部署："
    echo "1. 访问 https://vercel.com/dashboard"
    echo "2. 点击 'New Project'"
    echo "3. 导入你的Git仓库"
    echo "4. 设置构建配置："
    echo "   - Framework Preset: Next.js"
    echo "   - Build Command: cd frontend && npm install && npm run build"
    echo "   - Output Directory: frontend/.next"
    echo "   - Install Command: cd frontend && npm install"
    echo "5. 配置环境变量："
    echo "   - GEMINI_API_KEY: AIzaSyDy9pYAEW7e2Ewk__9TCHAD5X_G1VhCtVw"
    echo "   - GEMINI_MODEL: gemini-2.5-flash-preview-05-20"
    echo "   - NODE_ENV: production"
    echo "6. 点击部署"
fi

echo ""
echo "🎯 部署完成！"
echo "📚 查看README-WEB.md获取更多信息"
echo ""
echo "🔧 应用特性："
echo "• 📄 PDF文件上传（最大50MB）"
echo "• 🤖 AI内容分析（Gemini 2.5 Flash）"
echo "• 📊 实时处理进度显示"
echo "• 📥 海报文件下载"
echo "• 💻 响应式现代UI设计"
echo ""
echo "📖 技术栈："
echo "• Next.js 14 (App Router)"
echo "• TypeScript"
echo "• Tailwind CSS"
echo "• Gemini AI API"
echo "• Vercel 部署" 