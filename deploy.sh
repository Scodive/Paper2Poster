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

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量
echo "🔧 检查环境配置..."
if [ ! -f ".env" ]; then
    echo "⚠️  未找到.env文件，从示例文件创建..."
    cp env.example .env
    echo "✅ 已创建.env文件，请编辑并添加你的API密钥"
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
    echo "4. 配置环境变量："
    echo "   - GEMINI_API_KEY: GEMINI_API_KEY"
    echo "   - GEMINI_MODEL: gemini-2.5-flash-preview-05-20"
    echo "   - NODE_ENV: production"
    echo "5. 点击部署"
fi

echo ""
echo "🎯 部署完成！"
echo "📚 查看README-WEB.md获取更多信息" 