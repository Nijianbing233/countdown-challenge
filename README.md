# 目标倒计时挑战应用

一个简单而强大的倒计时挑战应用，帮助你实现目标，无需登录，保护隐私。

## 🚀 功能特性

- **添加任务** - 输入"目标 + 时间段"创建倒计时
- **实时倒计时** - Vue页面显示多个倒计时，实时更新
- **完成记录** - 用户本地记录成就/时间线（可导出）
- **后台统计** - Node管理全局统计：热门目标、完成人数等
- **后台管理** - 管理员系统，任务管理、数据统计、用户管理
- **无登录设计** - 不储存隐私，本地存储为主

## 🛠️ 技术栈

- **前端**: Vue 3 + Pinia + Vite + Tailwind CSS
- **后端**: Node.js + Express + MongoDB + Mongoose
- **后台管理**: Vue 3 + Element Plus + Vite

## 🚀 快速部署

### 1. 环境准备

确保您的系统已安装：
- Node.js (版本 16+)
- MongoDB (本地或远程)
- npm 或 pnpm

### 2. 克隆项目

```bash
git clone <repository-url>
cd countdown-challenge
```

### 3. 安装依赖

```bash
# 前端应用
cd client
npm install

# 后端API
cd ../server
npm install

# 后台管理系统
cd ../back
npm install
```

### 4. 环境配置

在 `server` 目录下创建 `.env` 文件：

```bash
cd ../server
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
MONGODB_URI=mongodb://localhost:27017/countdown-challenge
PORT=5001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 5. 启动应用

```bash
# 启动后端API (端口5001)
cd server
npm run dev

# 启动前端应用 (端口3000)
cd ../client
npm run dev

# 启动后台管理系统 (端口5173)
cd ../back
npm run dev
```

### 6. 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5001
- **后台管理系统**: http://localhost:5173

### 7. 后台管理系统登录

后台管理系统默认登录信息：
- **账号**: admin
- **密码**: 123456

## 📊 主要功能

### 前端应用
1. **任务管理** - 创建、编辑、完成、删除倒计时任务
2. **实时倒计时** - 精确到秒的倒计时显示
3. **数据导出** - 支持JSON格式数据导出
4. **统计功能** - 全局和用户个人统计
5. **响应式设计** - 支持桌面和移动设备

### 后台管理系统
1. **任务管理** - 查看、创建、编辑、删除所有任务
2. **数据统计** - 总任务数、完成率、热门目标等统计
3. **状态管理** - 任务状态筛选和批量操作
4. **搜索功能** - 按标题和描述搜索任务
5. **分页显示** - 支持大量数据的分页浏览

## 🎯 使用指南

### 前端应用使用
1. 点击"添加目标"创建新任务
2. 设置目标名称、天数和描述
3. 查看实时倒计时
4. 完成任务或删除任务
5. 导出数据备份

### 后台管理系统使用
1. 访问 http://localhost:5173
2. 使用管理员账号登录 (admin/123456)
3. 在任务管理页面查看所有任务
4. 在统计页面查看数据分析
5. 使用搜索和筛选功能快速找到目标任务

## 🔧 生产环境部署

### 构建应用

```bash
# 构建前端应用
cd client
npm run build

# 构建后台管理系统
cd ../back
npm run build

# 启动后端服务
cd ../server
npm start
```

### 部署建议

1. **前端部署**: 将 `client/dist` 目录部署到 Nginx 或 CDN
2. **后台管理部署**: 将 `back/dist` 目录部署到独立的子域名
3. **后端部署**: 使用 PM2 或 Docker 部署 Node.js 服务
4. **数据库**: 使用 MongoDB Atlas 或自建 MongoDB 集群

## 📁 项目结构

```
countdown-challenge/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # Vue组件
│   │   ├── views/         # 页面视图
│   │   ├── store/         # Pinia状态管理
│   │   └── services/      # API服务
│   └── package.json
├── server/                # 后端API
│   ├── routes/           # API路由
│   ├── models/           # 数据模型
│   ├── middleware/       # 中间件
│   └── server.js         # 服务器入口
├── back/                  # 后台管理系统
│   ├── src/
│   │   ├── views/        # 管理页面
│   │   ├── components/   # 管理组件
│   │   └── router/       # 路由配置
│   └── package.json
└── README.md
```

## 🔐 安全说明

- 后台管理系统使用简单的token认证
- 生产环境建议使用更安全的认证方式
- API接口已配置CORS和速率限制
- 数据库连接使用环境变量配置

---

**开始你的目标倒计时挑战吧！** 🎯 