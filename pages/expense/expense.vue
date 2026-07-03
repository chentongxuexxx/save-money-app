<template>
  <view class="container">
    <!-- 统计卡片 - 升级版 -->
    <view class="stat-card">
      <view class="stat-card-header">
        <text class="stat-title">本月支出</text>
        <view class="stat-budget" v-if="budget.isSet" :class="{ over: monthTotal > budget.monthly }">
          <text class="budget-text">
            {{ monthTotal > budget.monthly ? '已超预算' : '预算剩余' }}
          </text>
          <text class="budget-value">
            ¥{{ (budget.monthly - monthTotal).toFixed(2) }}
          </text>
        </view>
      </view>
      <view class="stat-card-body">
        <view class="stat-main">
          <text class="currency">¥</text>
          <text class="stat-value">{{ monthTotal.toFixed(2) }}</text>
        </view>
        <view class="budget-bar" v-if="budget.isSet">
          <view class="budget-progress" :style="{ width: Math.min((monthTotal / budget.monthly) * 100, 100) + '%' }" :class="{ over: monthTotal > budget.monthly }"></view>
        </view>
      </view>
      <view class="stat-card-footer">
        <view class="stat-footer-item">
          <view class="footer-icon">📅</view>
          <view class="footer-content">
            <text class="footer-label">今日支出</text>
            <text class="footer-value">¥{{ todayTotal.toFixed(2) }}</text>
          </view>
        </view>
        <view class="stat-footer-divider"></view>
        <view class="stat-footer-item">
          <view class="footer-icon">📊</view>
          <view class="footer-content">
            <text class="footer-label">日均消费</text>
            <text class="footer-value">¥{{ avgDaily.toFixed(2) }}</text>
          </view>
        </view>
        <view class="stat-footer-divider"></view>
        <view class="stat-footer-item">
          <view class="footer-icon">📝</view>
          <view class="footer-content">
            <text class="footer-label">记账笔数</text>
            <text class="footer-value">{{ expenseCount }}笔</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类统计 - 横向进度条 -->
    <view class="category-section">
      <view class="section-header">
        <text class="section-title">支出分类</text>
        <text class="section-subtitle">Expense Breakdown</text>
      </view>
      <view class="category-list">
        <view
          v-for="item in categoryStats"
          :key="item.category"
          class="category-item"
        >
          <view class="category-info">
            <text class="category-icon">{{ item.icon }}</text>
            <text class="category-name">{{ item.category }}</text>
          </view>
          <view class="category-progress-wrapper">
            <view class="category-progress">
              <view
                class="category-progress-bar"
                :style="{ width: (item.amount / monthTotal * 100) + '%' }"
              ></view>
            </view>
            <text class="category-amount">¥{{ item.amount.toFixed(0) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 支出记录列表 -->
    <view class="expense-section">
      <view class="section-header">
        <text class="section-title">消费记录</text>
        <text class="section-subtitle">Transaction History</text>
      </view>
      <view class="expense-list">
        <view v-for="(group, date) in groupedExpenses" :key="date" class="date-group">
          <view class="date-header">
            <view class="date-info">
              <text class="date-text">{{ formatDateHeader(date) }}</text>
              <text class="date-weekday">{{ getWeekday(date) }}</text>
            </view>
            <view class="date-total">
              <text class="total-label">支出</text>
              <text class="total-value">¥{{ getDateTotal(group).toFixed(2) }}</text>
            </view>
          </view>
          <view
            v-for="item in group"
            :key="item.id"
            class="expense-item"
            @click="editExpense(item)"
          >
            <view class="expense-icon" :style="{ background: getCategoryBg(item.category) }">
              <text>{{ getCategoryIcon(item.category) }}</text>
            </view>
            <view class="expense-info">
              <text class="expense-category">{{ item.category }}</text>
              <text v-if="item.notes" class="expense-notes">{{ item.notes }}</text>
            </view>
            <view class="expense-right">
              <text class="expense-amount">-¥{{ item.amount.toFixed(2) }}</text>
              <text class="expense-time">{{ item.time || '' }}</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="expenses.length === 0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">还没有记账记录</text>
          <text class="empty-hint">点击下方按钮开始记账</text>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="goToAdd">
      <view class="add-btn-inner">
        <text class="add-icon">+</text>
      </view>
    </view>
  </view>
</template>

<script>
import StorageUtil from '@/utils/storage.js'
import DateUtil from '@/utils/date.js'

export default {
  data() {
    return {
      expenses: [],
      budget: { monthly: 3000, isSet: false },
      categories: ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '通讯', '其他'],
      categoryIcons: {
        '餐饮': '🍚',
        '交通': '🚌',
        '购物': '🛒',
        '娱乐': '🎬',
        '住房': '🏠',
        '医疗': '💊',
        '教育': '📖',
        '通讯': '📱',
        '其他': '📦'
      },
      categoryColors: {
        '餐饮': '#FF6B6B',
        '交通': '#4ECDC4',
        '购物': '#45B7D1',
        '娱乐': '#96CEB4',
        '住房': '#FFEAA7',
        '医疗': '#DDA0DD',
        '教育': '#98D8C8',
        '通讯': '#F7DC6F',
        '其他': '#BB8FCE'
      }
    }
  },
  computed: {
    todayTotal() {
      const today = DateUtil.getToday()
      return this.expenses
        .filter(item => item.date === today)
        .reduce((sum, item) => sum + item.amount, 0)
    },
    monthTotal() {
      const monthStart = DateUtil.getMonthStart()
      return this.expenses
        .filter(item => item.date >= monthStart)
        .reduce((sum, item) => sum + item.amount, 0)
    },
    expenseCount() {
      return this.expenses.filter(item => item.date >= DateUtil.getMonthStart()).length
    },
    avgDaily() {
      const monthStart = DateUtil.getMonthStart()
      const days = new Date().getDate()
      if (days === 0) return 0
      return this.monthTotal / days
    },
    groupedExpenses() {
      const groups = {}
      this.expenses.forEach(item => {
        if (!groups[item.date]) {
          groups[item.date] = []
        }
        groups[item.date].push(item)
      })
      const sortedGroups = {}
      Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach(key => {
        sortedGroups[key] = groups[key]
      })
      return sortedGroups
    },
    categoryStats() {
      const monthStart = DateUtil.getMonthStart()
      const monthExpenses = this.expenses.filter(item => item.date >= monthStart)
      const stats = []
      this.categories.forEach(cat => {
        const amount = monthExpenses
          .filter(item => item.category === cat)
          .reduce((sum, item) => sum + item.amount, 0)
        if (amount > 0) {
          stats.push({
            category: cat,
            icon: this.categoryIcons[cat],
            amount
          })
        }
      })
      return stats.sort((a, b) => b.amount - a.amount).slice(0, 5)
    }
  },
  onShow() {
    this.loadExpenses()
    this.loadBudget()
  },
  methods: {
    loadExpenses() {
      this.expenses = StorageUtil.getExpenses()
      this.expenses.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        return b.createdAt - a.createdAt
      })
    },
    loadBudget() {
      const budget = uni.getStorageSync('budget')
      if (budget) {
        this.budget = budget
      }
    },
    getCategoryIcon(category) {
      return this.categoryIcons[category] || '📦'
    },
    getCategoryBg(category) {
      const color = this.categoryColors[category] || '#BB8FCE'
      return `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`
    },
    formatDateHeader(date) {
      if (DateUtil.isToday(date)) return '今天'
      if (DateUtil.isYesterday(date)) return '昨天'
      return date
    },
    getWeekday(date) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return weekdays[new Date(date).getDay()]
    },
    getDateTotal(group) {
      return group.reduce((sum, item) => sum + item.amount, 0)
    },
    deleteExpense(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: (res) => {
          if (res.confirm) {
            let expenses = StorageUtil.getExpenses()
            expenses = expenses.filter(item => item.id !== id)
            StorageUtil.setExpenses(expenses)
            this.loadExpenses()
            uni.showToast({ title: '删除成功', icon: 'success' })
          }
        }
      })
    },
    editExpense(item) {
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.navigateTo({
              url: `/pages/add-expense/add-expense?id=${item.id}`
            })
          } else if (res.tapIndex === 1) {
            this.deleteExpense(item.id)
          }
        }
      })
    },
    goToAdd() {
      uni.navigateTo({
        url: '/pages/add-expense/add-expense'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 20rpx;
  padding-bottom: 140rpx;
  background: #F5F6FA;
  min-height: 100vh;
}

/* 统计卡片 */
.stat-card {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(255, 152, 0, 0.3);
  color: #fff;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.stat-title {
  font-size: 28rpx;
  font-weight: 500;
  opacity: 0.9;
}

.stat-budget {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;

  &.over {
    background: rgba(244, 67, 54, 0.8);
  }
}

.budget-text {
  font-size: 20rpx;
  opacity: 0.9;
  margin-right: 8rpx;
}

.budget-value {
  font-size: 24rpx;
  font-weight: 600;
}

.stat-card-body {
  margin-bottom: 24rpx;
}

.stat-main {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 32rpx;
  font-weight: 500;
  margin-right: 8rpx;
}

.stat-value {
  font-size: 72rpx;
  font-weight: 700;
  letter-spacing: -2rpx;
}

.budget-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  margin-top: 20rpx;
  overflow: hidden;
}

.budget-progress {
  height: 100%;
  background: #fff;
  border-radius: 6rpx;
  transition: width 0.5s ease;

  &.over {
    background: #f44336;
  }
}

.stat-card-footer {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  padding: 20rpx;
}

.stat-footer-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.footer-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.footer-content {
  display: flex;
  flex-direction: column;
}

.footer-label {
  font-size: 20rpx;
  opacity: 0.7;
}

.footer-value {
  font-size: 26rpx;
  font-weight: 600;
}

.stat-footer-divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 12rpx;
}

/* 分类统计 */
.category-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.section-subtitle {
  font-size: 22rpx;
  color: #bbb;
  margin-left: 12rpx;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-item {
  display: flex;
  align-items: center;
}

.category-info {
  display: flex;
  align-items: center;
  width: 160rpx;
  flex-shrink: 0;
}

.category-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.category-name {
  font-size: 24rpx;
  color: #666;
}

.category-progress-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.category-progress {
  flex: 1;
  height: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
}

.category-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FF9800 0%, #FFB74D 100%);
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.category-amount {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
  width: 80rpx;
  text-align: right;
}

/* 支出记录 */
.expense-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.expense-list {
  margin-top: 8rpx;
}

.date-group {
  margin-bottom: 24rpx;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.date-info {
  display: flex;
  align-items: baseline;
}

.date-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.date-weekday {
  font-size: 22rpx;
  color: #999;
  margin-left: 12rpx;
}

.date-total {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 22rpx;
  color: #999;
  margin-right: 8rpx;
}

.total-value {
  font-size: 28rpx;
  color: #FF9800;
  font-weight: 600;
}

.expense-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 12rpx;
  background: #fafafa;
  border-radius: 16rpx;
  transition: all 0.2s ease;

  &:active {
    background: #f5f5f5;
    transform: scale(0.99);
  }
}

.expense-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.expense-info {
  flex: 1;
  min-width: 0;
}

.expense-category {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.expense-notes {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-right {
  text-align: right;
  flex-shrink: 0;
}

.expense-amount {
  display: block;
  font-size: 30rpx;
  color: #f44336;
  font-weight: 600;
}

.expense-time {
  display: block;
  font-size: 20rpx;
  color: #bbb;
  margin-top: 4rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
}

/* 添加按钮 */
.add-btn {
  position: fixed;
  right: 32rpx;
  bottom: 60rpx;
  z-index: 100;
}

.add-btn-inner {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(255, 152, 0, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.92);
  }
}

.add-icon {
  color: #fff;
  font-size: 56rpx;
  font-weight: 300;
  line-height: 1;
}
</style>
