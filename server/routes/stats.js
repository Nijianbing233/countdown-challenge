import express from 'express'
import Task from '../models/Task.js'

const router = express.Router()

// 获取全局统计信息
router.get('/global', async (req, res) => {
  try {
    const stats = await Task.getStats()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取全局统计失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取统计信息失败' 
    })
  }
})

// 获取热门目标
router.get('/popular-goals', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const popularGoals = await Task.getPopularGoals(parseInt(limit))
    
    res.json({
      success: true,
      data: popularGoals
    })
  } catch (error) {
    console.error('获取热门目标失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取热门目标失败' 
    })
  }
})

// 获取用户统计信息
router.get('/user', async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    
    const userStats = await Task.aggregate([
      {
        $match: { deviceId }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          activeTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          expiredTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          },
          avgDays: { $avg: '$totalDays' },
          totalDays: { $sum: '$totalDays' },
          completionRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalTasks: 1,
          activeTasks: 1,
          completedTasks: 1,
          expiredTasks: 1,
          avgDays: { $round: ['$avgDays', 1] },
          totalDays: 1,
          completionRate: { $round: [{ $multiply: ['$completionRate', 100] }, 1] }
        }
      }
    ])
    
    const stats = userStats[0] || {
      totalTasks: 0,
      activeTasks: 0,
      completedTasks: 0,
      expiredTasks: 0,
      avgDays: 0,
      totalDays: 0,
      completionRate: 0
    }
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取用户统计失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取用户统计失败' 
    })
  }
})

// 获取时间趋势统计
router.get('/trends', async (req, res) => {
  try {
    const { days = 30 } = req.query
    const deviceId = generateDeviceId(req)
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))
    
    const trends = await Task.aggregate([
      {
        $match: {
          deviceId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ])
    
    res.json({
      success: true,
      data: trends
    })
  } catch (error) {
    console.error('获取趋势统计失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取趋势统计失败' 
    })
  }
})

// 获取目标类型统计
router.get('/goal-types', async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    
    const goalTypes = await Task.aggregate([
      {
        $match: { deviceId }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $lte: ['$totalDays', 7] },
              '短期目标 (≤7天)',
              {
                $cond: [
                  { $lte: ['$totalDays', 30] },
                  '中期目标 (8-30天)',
                  {
                    $cond: [
                      { $lte: ['$totalDays', 100] },
                      '长期目标 (31-100天)',
                      '超长期目标 (>100天)'
                    ]
                  }
                ]
              }
            ]
          },
          count: { $sum: 1 },
          avgCompletionRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          goalType: '$_id',
          count: 1,
          avgCompletionRate: { $round: [{ $multiply: ['$avgCompletionRate', 100] }, 1] }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])
    
    res.json({
      success: true,
      data: goalTypes
    })
  } catch (error) {
    console.error('获取目标类型统计失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取目标类型统计失败' 
    })
  }
})

// 获取成就统计
router.get('/achievements', async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    
    const achievements = await Task.aggregate([
      {
        $match: { 
          deviceId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: 1 },
          avgCompletionDays: { $avg: '$totalDays' },
          longestStreak: { $max: '$totalDays' },
          shortestStreak: { $min: '$totalDays' },
          totalDaysCompleted: { $sum: '$totalDays' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCompleted: 1,
          avgCompletionDays: { $round: ['$avgCompletionDays', 1] },
          longestStreak: 1,
          shortestStreak: 1,
          totalDaysCompleted: 1
        }
      }
    ])
    
    const achievement = achievements[0] || {
      totalCompleted: 0,
      avgCompletionDays: 0,
      longestStreak: 0,
      shortestStreak: 0,
      totalDaysCompleted: 0
    }
    
    // 计算成就徽章
    const badges = []
    
    if (achievement.totalCompleted >= 1) {
      badges.push({ name: '新手', description: '完成第一个目标', icon: '🎯' })
    }
    if (achievement.totalCompleted >= 5) {
      badges.push({ name: '坚持者', description: '完成5个目标', icon: '🔥' })
    }
    if (achievement.totalCompleted >= 10) {
      badges.push({ name: '目标达人', description: '完成10个目标', icon: '🏆' })
    }
    if (achievement.totalCompleted >= 20) {
      badges.push({ name: '传奇', description: '完成20个目标', icon: '👑' })
    }
    if (achievement.longestStreak >= 100) {
      badges.push({ name: '百日挑战', description: '完成100天挑战', icon: '💯' })
    }
    if (achievement.totalDaysCompleted >= 365) {
      badges.push({ name: '年度达人', description: '累计完成365天', icon: '📅' })
    }
    
    res.json({
      success: true,
      data: {
        ...achievement,
        badges
      }
    })
  } catch (error) {
    console.error('获取成就统计失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取成就统计失败' 
    })
  }
})

// 生成设备ID（与tasks.js中相同的函数）
const generateDeviceId = (req) => {
  const userAgent = req.headers['user-agent'] || ''
  const ip = req.ip || req.connection.remoteAddress || ''
  const acceptLanguage = req.headers['accept-language'] || ''
  
  let hash = 0
  const str = userAgent + ip + acceptLanguage
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(36)
}

export default router 