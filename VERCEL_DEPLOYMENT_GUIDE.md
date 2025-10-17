# 🚀 PlanetSwap Vercel 部署指南

## 📋 部署前准备

### 1. 检查项目结构
✅ Next.js 项目 - 已配置  
✅ package.json - 已配置  
✅ next.config.js - 已配置  
✅ .gitignore - 已创建  
✅ 环境变量模板 - 已创建  

## 🔧 第一步：获取 WalletConnect Project ID

1. 访问 [WalletConnect Cloud](https://walletconnect.com/)
2. 注册/登录账户
3. 创建新项目
4. 复制 Project ID

## 📁 第二步：创建Git仓库

### 方式1：GitHub Desktop (推荐)
```bash
1. 打开 GitHub Desktop
2. File -> Add Local Repository
3. 选择 PlanetSwap-FrontEnd 文件夹
4. 点击 "create a repository"
5. Repository name: planetswap-frontend
6. 点击 "Create Repository"
7. 点击 "Publish repository" 发布到GitHub
```

### 方式2：命令行
```bash
cd PlanetSwap-FrontEnd
git init
git add .
git commit -m "Initial commit: PlanetSwap Frontend"
git branch -M main

# 在GitHub创建仓库后
git remote add origin https://github.com/你的用户名/planetswap-frontend.git
git push -u origin main
```

## ☁️ 第三步：部署到Vercel

### 1. 访问Vercel
- 打开 [vercel.com](https://vercel.com)
- 点击 "Sign up" 或 "Log in"
- 选择 "Continue with GitHub"

### 2. 导入项目
- 点击 "Add New..." -> "Project"
- 找到你的 `planetswap-frontend` 仓库
- 点击 "Import"

### 3. 配置项目
- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `./` (默认)
- **Build Command**: `npm run build` (自动)
- **Output Directory**: `.next` (自动)
- **Install Command**: `npm install` (自动)

### 4. 环境变量配置
在 "Environment Variables" 部分添加：

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | 你的WalletConnect Project ID |
| `NEXT_PUBLIC_PLANET_TOKEN_XLAYER` | `0x0000000000000000000000000000000000000000` |
| `NEXT_PUBLIC_WOKB_XLAYER` | `0xFCF165C4C8925682aE5facEC596D474eB36CE825` |
| `NEXT_PUBLIC_PLANET_FACTORY_XLAYER` | `0x5D94f4c717F3D69A837DFC36D91e1a87b8F1aE40` |
| `NEXT_PUBLIC_PLANET_ROUTER_XLAYER` | `0x1e1561ec8F1F83E36B8BfC3f8D5c01e2587Fbcb6` |

### 5. 部署
- 点击 "Deploy" 按钮
- 等待构建完成（通常2-5分钟）

## 🎯 第四步：验证部署

### 检查清单
- [ ] 网站能正常访问
- [ ] 钱包连接功能正常
- [ ] Swap页面加载正常
- [ ] 流动性页面正常
- [ ] 池子页面正常
- [ ] 网络切换到X Layer正常

## 🔧 常见问题解决

### 构建失败
```bash
# 本地测试构建
npm run build

# 如果失败，检查错误信息并修复
npm run lint
```

### 环境变量问题
1. 检查Vercel项目设置
2. 确保所有 `NEXT_PUBLIC_` 变量都已设置
3. 重新部署项目

### 钱包连接问题
1. 确认WalletConnect Project ID正确
2. 检查域名是否在WalletConnect项目中配置

## 🌐 第五步：自定义域名（可选）

### 1. 在Vercel项目设置中
- 进入 "Domains" 标签
- 添加你的域名
- 按照指示配置DNS

### 2. SSL证书
- Vercel自动提供HTTPS
- 无需额外配置

## 📊 第六步：监控和分析

### Vercel Analytics
- 自动提供基础分析
- 可以看到访问量和性能指标

### 性能监控
- Vercel自动监控Web Vitals
- 在项目dashboard查看性能指标

## 🔄 后续更新流程

### 自动部署
1. 推送代码到GitHub main分支
2. Vercel自动检测并部署
3. 部署完成后自动上线

### 手动部署
1. 在Vercel dashboard点击 "Redeploy"
2. 等待部署完成

## 🎉 完成！

你的PlanetSwap前端现在已经部署到Vercel！

- **生产环境**: https://你的项目名.vercel.app
- **性能**: 全球CDN加速
- **SSL**: 自动HTTPS
- **成本**: 免费！

## 📞 获得帮助

如果遇到问题：
1. 检查Vercel部署日志
2. 查看浏览器开发者工具控制台
3. 检查GitHub仓库提交历史
