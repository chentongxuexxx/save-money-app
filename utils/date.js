// 日期工具类
const DateUtil = {
  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 获取今天的日期字符串
  getToday() {
    return this.formatDate(new Date())
  },

  // 计算两个日期之间的天数
  getDaysBetween(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  },

  // 计算已使用时间（天数）
  getUsedDays(purchaseDate) {
    return this.getDaysBetween(purchaseDate, this.getToday())
  },

  // 计算已使用时间（带单位的字符串）
  getUsedTimeString(purchaseDate) {
    const days = this.getUsedDays(purchaseDate)
    if (days < 30) {
      return days + '天'
    } else if (days < 365) {
      const months = Math.floor(days / 30)
      return months + '个月'
    } else {
      const years = Math.floor(days / 365)
      const months = Math.floor((days % 365) / 30)
      if (months > 0) {
        return years + '年' + months + '个月'
      }
      return years + '年'
    }
  },

  // 判断是否在冷静期内
  isInCoolingPeriod(expireDate) {
    const today = this.getToday()
    const days = this.getDaysBetween(today, expireDate)
    return days >= 0
  },

  // 获取冷静期剩余天数
  getRemainingDays(expireDate) {
    return this.getDaysBetween(this.getToday(), expireDate)
  },

  // 判断是否是今天
  isToday(date) {
    return this.formatDate(date) === this.getToday()
  },

  // 判断是否是昨天
  isYesterday(date) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return this.formatDate(date) === this.formatDate(yesterday)
  },

  // 获取月份的第一天
  getMonthStart() {
    const now = new Date()
    return this.formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
  },

  // 获取月份的最后一天
  getMonthEnd() {
    const now = new Date()
    return this.formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  }
}

export default DateUtil
