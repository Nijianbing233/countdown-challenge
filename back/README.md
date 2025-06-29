# 后台管理系统

这是目标倒计时挑战项目的后台管理系统，基于 Vue 3 + Element Plus 开发。

## 功能特性

- 🔐 简单登录认证
- 📋 任务管理（增删改查）
- 📊 数据统计展示
- 🎨 现代化UI界面
- 📱 响应式设计

## 技术栈

- **前端框架**: Vue 3
- **UI组件库**: Element Plus
- **路由管理**: Vue Router 4
- **HTTP客户端**: Axios
- **构建工具**: Vite

## 快速开始

### 1. 安装依赖

```bash
cd back
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

### 3. 登录信息

- 用户名: `admin`
- 密码: `123456`

## 功能说明

### 任务管理

- **查看任务**: 支持分页、搜索、状态筛选
- **新增任务**: 填写标题、描述、天数
- **编辑任务**: 修改任务信息（仅限进行中的任务）
- **完成任务**: 标记任务为已完成状态
- **删除任务**: 永久删除任务

### 数据统计

- **任务统计**: 总任务数、进行中、已完成、已过期
- **热门目标**: 显示最受欢迎的目标及其完成率
- **状态分布**: 任务状态的可视化展示

## API接口

后台管理系统使用专门的API端点：

- 基础路径: `/api/admin`
- 认证方式: Header `x-admin-token: admin-token-123456`

### 主要接口

- `GET /api/admin/tasks` - 获取任务列表
- `POST /api/admin/tasks` - 创建新任务
- `PUT /api/admin/tasks/:id` - 更新任务
- `PATCH /api/admin/tasks/:id/complete` - 完成任务
- `DELETE /api/admin/tasks/:id` - 删除任务
- `GET /api/admin/stats` - 获取统计信息

## 项目结构

```
back/
├── src/
│   ├── views/
│   │   ├── Login.vue          # 登录页面
│   │   ├── TaskList.vue       # 任务管理页面
│   │   └── Stats.vue          # 统计页面
│   ├── router/
│   │   └── index.js           # 路由配置
│   ├── App.vue                # 主应用组件
│   └── main.js                # 应用入口
├── package.json
└── vite.config.js
```

## 开发说明

### 环境要求

- Node.js >= 16
- pnpm >= 7

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 注意事项

1. 确保后端服务器正在运行（默认端口 3000）
2. 后台管理系统需要与后端API配合使用
3. 所有任务操作都会实时同步到数据库
4. 删除操作不可恢复，请谨慎操作

## 更新日志

### v1.0.0
- 初始版本发布
- 基础任务管理功能
- 数据统计展示
- 响应式界面设计
