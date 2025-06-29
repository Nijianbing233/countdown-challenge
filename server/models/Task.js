import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  // 任务基本信息
  title: {
    type: String,
    required: [true, '任务标题不能为空'],
    trim: true,
    maxlength: [100, '任务标题不能超过100个字符']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, '任务描述不能超过500个字符']
  },
  
  // 时间相关
  totalDays: {
    type: Number,
    required: [true, '任务天数不能为空'],
    min: [1, '任务天数至少为1天'],
    max: [3650, '任务天数不能超过10年']
  },
  
  startDate: {
    type: Date,
    required: [true, '开始时间不能为空'],
    default: Date.now
  },
  
  endDate: {
    type: Date,
    required: [true, '结束时间不能为空']
  },
  
  completedDate: {
    type: Date,
    default: null
  },
  
  // 状态
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  
  // 用户标识（匿名用户使用设备指纹）
  deviceId: {
    type: String,
    required: [true, '设备ID不能为空'],
    index: true
  },
  
  // 统计信息
  completionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // 元数据
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// 虚拟字段：剩余天数
taskSchema.virtual('remainingDays').get(function() {
  if (this.status === 'completed') return 0
  
  const now = new Date()
  const end = new Date(this.endDate)
  const diff = end - now
  
  if (diff <= 0) return 0
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// 虚拟字段：是否已过期
taskSchema.virtual('isExpired').get(function() {
  if (this.status === 'completed') return false
  
  const now = new Date()
  const end = new Date(this.endDate)
  return end < now
})

// 虚拟字段：进度百分比
taskSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'completed') return 100
  
  const now = new Date()
  const start = new Date(this.startDate)
  const end = new Date(this.endDate)
  
  if (now <= start) return 0
  if (now >= end) return 100
  
  const totalDuration = end - start
  const elapsed = now - start
  
  return Math.round((elapsed / totalDuration) * 100)
})

// 索引
taskSchema.index({ deviceId: 1, status: 1 })
taskSchema.index({ status: 1, endDate: 1 })
taskSchema.index({ createdAt: -1 })
taskSchema.index({ title: 'text', description: 'text' })

// 中间件：保存前更新结束时间
taskSchema.pre('save', function(next) {
  if (this.isModified('totalDays') || this.isModified('startDate')) {
    const startDate = new Date(this.startDate)
    this.endDate = new Date(startDate.getTime() + this.totalDays * 24 * 60 * 60 * 1000)
  }
  
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date()
  }
  
  this.updatedAt = new Date()
  next()
})

// 静态方法：获取热门目标
taskSchema.statics.getPopularGoals = async function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$title',
        count: { $sum: 1 },
        avgDays: { $avg: '$totalDays' },
        completionRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    },
    {
      $match: {
        count: { $gte: 2 } // 至少2个用户选择的目标
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        title: '$_id',
        count: 1,
        avgDays: { $round: ['$avgDays', 1] },
        completionRate: { $round: [{ $multiply: ['$completionRate', 100] }, 1] }
      }
    }
  ])
}

// 静态方法：获取统计信息
taskSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
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
        totalUsers: { $addToSet: '$deviceId' }
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
        uniqueUsers: { $size: '$totalUsers' }
      }
    }
  ])
  
  return stats[0] || {
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    expiredTasks: 0,
    avgDays: 0,
    uniqueUsers: 0
  }
}

// 实例方法：完成任务
taskSchema.methods.complete = function() {
  this.status = 'completed'
  this.completedDate = new Date()
  return this.save()
}

// 实例方法：检查并更新过期状态
taskSchema.methods.checkExpiration = function() {
  if (this.status === 'active' && this.isExpired) {
    this.status = 'expired'
    return this.save()
  }
  return Promise.resolve(this)
}

const Task = mongoose.model('Task', taskSchema)

export default Task 