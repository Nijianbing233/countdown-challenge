import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// 路由导入
import taskRoutes from './routes/tasks.js'
import statsRoutes from './routes/stats.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// 中间件
app.use(helmet())
app.use(compression())
app.use(morgan('combined'))

// 支持多个前端和后台管理系统域名的CORS
const allowOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5001'
].filter(Boolean)

app.use(cors({
  origin: function(origin, callback) {
    // 允许无origin（如curl、本地测试）
    if (!origin) return callback(null, true)
    if (allowOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error('CORS not allowed from ' + origin), false)
    }
  },
  credentials: true
}))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
})
app.use('/api/', limiter)

// 解析JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/admin', adminRoutes)

// 404处理
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: '数据验证失败', 
      details: err.message 
    })
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: '无效的ID格式' 
    })
  }
  
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后再试'
  })
})

// 数据库连接
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/countdown-challenge'
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ MongoDB连接成功')
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error.message)
    console.log('💡 提示: 请确保MongoDB服务正在运行')
    console.log('   安装MongoDB: https://docs.mongodb.com/manual/installation/')
    process.exit(1)
  }
}

// 启动服务器
const startServer = async () => {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`)
    console.log(`📊 健康检查: http://localhost:${PORT}/health`)
    console.log(`🔗 API文档: http://localhost:${PORT}/api`)
  })
}

// Vercel 适配 - 只在非生产环境启动服务器
if (process.env.NODE_ENV !== 'production') {
  startServer()
}

// 导出app供Vercel使用
export default app 