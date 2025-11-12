# 🎓 大学学生门户系统 (Student Portal Web)

一个现代化的学生和家长门户系统，使用 React + Vite + Tailwind CSS 构建，集成了 Google Gemini AI 助手功能。

## ✨ 功能特性

### 学生端
- 📊 **首页** - 今日课程、待办事项、成绩概览
- 📚 **学业** - 课程详情、成绩管理、学分统计
- 📅 **日历** - 课程表、作业截止日期、活动安排
- 💪 **健康** - 健康指标、预约挂号、医疗记录
- 🤖 **AI 助手** - 基于 Google Gemini 的智能学业助手
- 📧 **邮件** - 学校邮件管理
- ⚙️ **设置** - 个人设置、数据共享控制

### 家长端
- 🏠 **首页** - 孩子学习概览、待办事项、活动动态
- 🎯 **学业** - 成绩查看、课程进度、学业分析
- 📆 **日历** - 重要事件、截止日期提醒
- ❤️ **健康** - 健康数据查看（需学生授权）
- 💡 **AI 助手** - 智能家长助手，了解孩子学习生活
- ✉️ **邮件** - 学校通知、教师沟通
- ⚙️ **设置** - 语言切换、通知管理

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```
访问 http://localhost:5174

### 生产环境构建
```bash
npm run build
```
构建产物输出到 `dist/` 目录

## 🔑 Google AI API 配置

1. 复制 `.env.example` 为 `.env`
```bash
cp .env.example .env
```

2. 在 `.env` 文件中配置你的 Google AI API Key
```
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

3. 获取 API Key: https://makersuite.google.com/app/apikey

> 注意：`.env` 文件已添加到 `.gitignore`，不会被提交到 git

## 📁 项目结构

```
uniapp_web/
├── src/
│   ├── main.jsx                          # 应用入口
│   ├── styles.css                        # 全局样式
│   └── components/
│       ├── StudentDashboardView.jsx      # 学生端主组件
│       ├── parentsALL.jsx               # 家长端主组件
│       └── LoginView.jsx                # 登录页面
├── .env                                 # 环境变量（不提交）
├── .env.example                         # 环境变量示例
├── .gitignore                           # Git 忽略文件
├── package.json                         # 项目配置
├── vite.config.js                       # Vite 配置
└── tailwind.config.cjs                  # Tailwind 配置
```

## 🎨 技术栈

- **框架**: React 18.2.0
- **构建工具**: Vite 5.4.21
- **样式**: Tailwind CSS 3.4.0
- **图标**: Lucide React 0.294.0
- **AI**: Google Generative AI (@google/generative-ai)

## 🌐 部署

### Netlify 部署
1. 连接 GitHub 仓库到 Netlify
2. 构建命令: `npm run build`
3. 发布目录: `dist`
4. 在 Netlify 环境变量中配置 `VITE_GOOGLE_AI_API_KEY`

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 框架预设: Vite
3. 在 Vercel 环境变量中配置 `VITE_GOOGLE_AI_API_KEY`

## 🔧 已修复的问题

✅ 修复了重复的 App 组件声明  
✅ 修复了家长端缺失的 mockDemoConversations 数据  
✅ 修复了学业页面缺失的 mockCompletedCourses 和 mockOngoingCourses 数据  
✅ 集成了 Google Gemini AI API  
✅ 添加了环境变量支持  
✅ 优化了 AI 助手的上下文提示  

## 📝 使用说明

### 登录
- 点击"学生示例登录"或"家长示例登录"快速体验
- 或使用任意账号密码登录（Demo 模式）

### AI 助手
- 学生端：询问课程、成绩、截止日期等学业相关问题
- 家长端：了解孩子的学习、生活、活动情况
- AI 使用 Google Gemini Pro 模型，具备上下文理解能力

### 数据共享
- 学生可在设置中控制与家长的数据共享
- 家长只能查看学生授权的数据

## 🐛 故障排除

### 白屏问题
所有已知的白屏问题已修复：
- 确保所有 mock 数据已定义
- 检查组件是否有重复声明
- 查看浏览器控制台的错误信息

### AI 功能不工作
- 检查 `.env` 文件中的 API Key 是否正确
- 确认 Google AI API 配额是否充足
- 查看浏览器控制台的错误信息
- AI 调用失败会自动回退到 Demo 数据

## 📄 License

MIT

## 👨‍💻 开发者

Built with ❤️ by Azusa
