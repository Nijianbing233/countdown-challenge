import express from 'express'
import Task from '../models/Task.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// 生成设备ID（简单的设备指纹）
const generateDeviceId = (req) => {
  const userAgent = req.headers['user-agent'] || ''
  const ip = req.ip || req.connection.remoteAddress || ''
  const acceptLanguage = req.headers['accept-language'] || ''
  
  // 简单的哈希函数
  let hash = 0
  const str = userAgent + ip + acceptLanguage
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  return Math.abs(hash).toString(36)
}

// 获取用户的所有任务
router.get('/', optionalAuth, async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { status, limit = 50, page = 1, deviceId: queryDeviceId } = req.query
    
    // 优先deviceId查询
    let query = {}
    if (queryDeviceId) {
      query.deviceId = queryDeviceId
    } else if (req.user) {
      query.userId = req.user._id
    } else {
      query.deviceId = deviceId
    }
    if (status) {
      query.status = status
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
    
    const total = await Task.countDocuments(query)
    
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
    console.error('获取任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取任务失败' 
    })
  }
})

// 创建新任务
router.post('/', optionalAuth, async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { title, description, totalDays } = req.body
    
    // 验证必填字段
    if (!title || !totalDays) {
      return res.status(400).json({
        success: false,
        error: '任务标题和天数不能为空'
      })
    }
    
    // 验证天数范围
    if (totalDays < 1 || totalDays > 3650) {
      return res.status(400).json({
        success: false,
        error: '任务天数必须在1-3650天之间'
      })
    }
    
    const taskData = {
      title,
      description,
      totalDays,
      deviceId,
      startDate: new Date(),
      endDate: new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000)
    }
    
    // 如果用户已登录，添加用户ID
    if (req.user) {
      taskData.userId = req.user._id
    }
    
    const task = new Task(taskData)
    await task.save()
    
    res.status(201).json({
      success: true,
      data: task,
      message: '任务创建成功'
    })
  } catch (error) {
    console.error('创建任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '创建任务失败' 
    })
  }
})

// 获取单个任务
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { id } = req.params
    
    // 构建查询条件
    const query = { _id: id }
    if (req.user) {
      query.userId = req.user._id
    } else {
      query.deviceId = deviceId
    }
    
    const task = await Task.findOne(query)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '任务不存在'
      })
    }
    
    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('获取任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取任务失败' 
    })
  }
})

// 更新任务
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { id } = req.params
    const { title, description, totalDays } = req.body
    
    // 构建查询条件
    const query = { _id: id }
    if (req.user) {
      query.userId = req.user._id
    } else {
      query.deviceId = deviceId
    }
    
    const task = await Task.findOne(query)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '任务不存在'
      })
    }
    
    // 只允许更新进行中的任务
    if (task.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: '只能更新进行中的任务'
      })
    }
    
    // 更新字段
    if (title) task.title = title
    if (description !== undefined) task.description = description
    if (totalDays) {
      if (totalDays < 1 || totalDays > 3650) {
        return res.status(400).json({
          success: false,
          error: '任务天数必须在1-3650天之间'
        })
      }
      task.totalDays = totalDays
    }
    
    await task.save()
    
    res.json({
      success: true,
      data: task,
      message: '任务更新成功'
    })
  } catch (error) {
    console.error('更新任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '更新任务失败' 
    })
  }
})

// 完成任务
router.patch('/:id/complete', optionalAuth, async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { id } = req.params
    
    // 构建查询条件
    const query = { _id: id }
    if (req.user) {
      query.userId = req.user._id
    } else {
      query.deviceId = deviceId
    }
    
    const task = await Task.findOne(query)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '任务不存在'
      })
    }
    
    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: '任务已经完成'
      })
    }
    
    await task.complete()
    
    res.json({
      success: true,
      data: task,
      message: '任务完成！'
    })
  } catch (error) {
    console.error('完成任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '完成任务失败' 
    })
  }
})

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { id } = req.params
    
    const task = await Task.findOneAndDelete({ _id: id, deviceId })
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '任务不存在'
      })
    }
    
    res.json({
      success: true,
      message: '任务删除成功'
    })
  } catch (error) {
    console.error('删除任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '删除任务失败' 
    })
  }
})

// 批量操作
router.post('/batch', async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { action, taskIds } = req.body
    
    if (!action || !taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({
        success: false,
        error: '无效的批量操作参数'
      })
    }
    
    let result
    
    switch (action) {
      case 'complete':
        result = await Task.updateMany(
          { _id: { $in: taskIds }, deviceId, status: 'active' },
          { 
            status: 'completed', 
            completedDate: new Date() 
          }
        )
        break
        
      case 'delete':
        result = await Task.deleteMany({
          _id: { $in: taskIds },
          deviceId
        })
        break
        
      default:
        return res.status(400).json({
          success: false,
          error: '不支持的操作类型'
        })
    }
    
    res.json({
      success: true,
      data: result,
      message: `批量${action === 'complete' ? '完成' : '删除'}成功`
    })
  } catch (error) {
    console.error('批量操作失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '批量操作失败' 
    })
  }
})

// 搜索任务
router.get('/search/:query', async (req, res) => {
  try {
    const deviceId = generateDeviceId(req)
    const { query } = req.params
    const { limit = 20 } = req.query
    
    const tasks = await Task.find({
      deviceId,
      $text: { $search: query }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    
    res.json({
      success: true,
      data: tasks
    })
  } catch (error) {
    console.error('搜索任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '搜索任务失败' 
    })
  }
})

export default router 