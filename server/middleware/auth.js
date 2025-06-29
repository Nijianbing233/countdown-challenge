import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js'
import User from '../models/User.js'

// 可选认证中间件 - 如果用户已登录则设置req.user，否则继续
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req)
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const user = await User.findById(decoded.userId)
        if (user) {
          req.user = user
        }
      }
    }
    next()
  } catch (error) {
    next()
  }
}

// 必需认证中间件 - 用户必须登录
export const requireAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req)
    if (!token) {
      return res.status(401).json({ message: '访问令牌缺失' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: '无效的访问令牌' })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ message: '用户不存在' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
} 