import express from 'express'
import Task from '../models/Task.js'

const router = express.Router()

// 简单的管理员认证中间件
const adminAuth = (req, res, next) => {
  const adminToken = req.headers['x-admin-token']
  if (adminToken === 'admin-token-123456') {
    next()
  } else {
    res.status(401).json({ error: '管理员认证失败' })
  }
}

// 应用管理员认证中间件到所有路由
router.use(adminAuth)

// 获取任务列表（管理员）
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query
    
    const query = {}
    
    // 搜索条件
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    // 状态筛选
    if (status) {
      query.status = status
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(query)
    ])
    
    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
    res.status(500).json({ error: '获取任务列表失败' })
  }
})

// 创建任务（管理员）
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, totalDays } = req.body
    
    if (!title || !totalDays) {
      return res.status(400).json({ error: '标题和天数为必填项' })
    }
    
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000)
    
    const task = new Task({
      title,
      description,
      totalDays: parseInt(totalDays),
      startDate,
      endDate,
      status: 'active'
    })
    
    await task.save()
    
    res.status(201).json({
      success: true,
      data: task,
      message: '任务创建成功'
    })
  } catch (error) {
    console.error('创建任务失败:', error)
    res.status(500).json({ error: '创建任务失败' })
  }
})

// 更新任务（管理员）
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, totalDays } = req.body
    
    if (!title || !totalDays) {
      return res.status(400).json({ error: '标题和天数为必填项' })
    }
    
    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }
    
    // 如果天数改变，重新计算结束时间
    let endDate = task.endDate
    if (totalDays !== task.totalDays) {
      endDate = new Date(task.startDate.getTime() + totalDays * 24 * 60 * 60 * 1000)
    }
    
    task.title = title
    task.description = description
    task.totalDays = parseInt(totalDays)
    task.endDate = endDate
    
    await task.save()
    
    res.json({
      success: true,
      data: task,
      message: '任务更新成功'
    })
  } catch (error) {
    console.error('更新任务失败:', error)
    res.status(500).json({ error: '更新任务失败' })
  }
})

// 完成任务（管理员）
router.patch('/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params
    
    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }
    
    task.status = 'completed'
    task.completedAt = new Date()
    
    await task.save()
    
    res.json({
      success: true,
      data: task,
      message: '任务已完成'
    })
  } catch (error) {
    console.error('完成任务失败:', error)
    res.status(500).json({ error: '完成任务失败' })
  }
})

// 删除任务（管理员）
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const task = await Task.findByIdAndDelete(id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }
    
    res.json({
      success: true,
      message: '任务删除成功'
    })
  } catch (error) {
    console.error('删除任务失败:', error)
    res.status(500).json({ error: '删除任务失败' })
  }
})

// 获取统计数据（管理员）
router.get('/stats', async (req, res) => {
  try {
    const [
      totalTasks,
      completedTasks,
      activeTasks,
      expiredTasks
    ] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'active' }),
      Task.countDocuments({ 
        status: 'active', 
        endDate: { $lt: new Date() } 
      })
    ])
    
    // 获取热门目标
    const popularGoals = await Task.aggregate([
      {
        $group: {
          _id: '$title',
          count: { $sum: 1 },
          avgDays: { $avg: '$totalDays' },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          title: '$_id',
          count: 1,
          avgDays: { $round: ['$avgDays', 1] },
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completedCount', '$count'] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    
    res.json({
      success: true,
      data: {
        stats: {
          totalTasks,
          completedTasks,
          activeTasks,
          expiredTasks
        },
        popularGoals
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ error: '获取统计数据失败' })
  }
})

export default router 