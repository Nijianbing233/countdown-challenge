import express from 'express'
import User from '../models/User.js'
import Task from '../models/Task.js'
import { generateToken } from '../utils/jwt.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, deviceId } = req.body

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ message: '用户名、邮箱和密码都是必需的' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少需要6个字符' })
    }

    // 检查用户名和邮箱是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被使用' })
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      deviceId
    })

    await user.save()

    // 如果有设备ID，将匿名任务迁移到用户账户
    if (deviceId) {
      await Task.updateMany(
        { deviceId, userId: { $exists: false } },
        { userId: user._id }
      )
    }

    // 生成token
    const token = generateToken(user._id)

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password, deviceId } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码都是必需的' })
    }

    // 查找用户
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 更新最后登录时间
    await user.updateLastLogin()

    // 如果有设备ID，将匿名任务迁移到用户账户
    if (deviceId) {
      await Task.updateMany(
        { deviceId, userId: { $exists: false } },
        { userId: user._id }
      )
    }

    // 生成token
    const token = generateToken(user._id)

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取当前用户信息
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 将匿名任务迁移到用户账户
router.post('/migrate-tasks', requireAuth, async (req, res) => {
  try {
    const { deviceId } = req.body
    const userId = req.user._id

    if (!deviceId) {
      return res.status(400).json({ message: '设备ID是必需的' })
    }

    // 查找并迁移匿名任务
    const result = await Task.updateMany(
      { deviceId, userId: { $exists: false } },
      { userId }
    )

    res.json({
      message: '任务迁移成功',
      migratedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('任务迁移错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router 