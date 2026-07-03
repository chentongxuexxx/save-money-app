<template>
  <view class="container">
    <!-- 自定义顶部导航 -->
    <view class="custom-nav">
      <view class="nav-content">
        <view class="nav-left">
          <text class="nav-greeting">{{ greeting }}</text>
          <text class="nav-date">{{ currentDate }}</text>
        </view>
        <view class="nav-right">
          <view class="avatar" @click="goToProfile">
            <text class="avatar-icon">👤</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 资产总览卡片 -->
    <view class="overview-card">
      <view class="overview-header">
        <text class="overview-title">总资产</text>
        <text class="overview-subtitle">Total Assets</text>
      </view>
      <view class="overview-body">
        <view class="overview-main">
          <text class="currency">¥</text>
          <text class="overview-value">{{ totalAssets.toFixed(2) }}</text>
        </view>
        <view class="overview-change" :class="{ positive: assetsChange >= 0 }">
          <text class="change-icon">{{ assetsChange >= 0 ? '↑' : '↓' }}</text>
          <text class="change-value">¥{{ Math.abs(assetsChange).toFixed(2) }}</text>
          <text class="change-text">较上月</text>
        </view>
      </view>
      <view class="overview-footer">
        <view class="overview-item">
          <text class="item-icon">💰</text>
          <view class="item-content">
            <text class="item-label">现金</text>
            <text class="item-value">¥{{ cashAssets.toFixed(2) }}</text>
          </view>
        </view>
        <view class="overview-item">
          <text class="item-icon">📱</text>
          <view class="item-content">
            <text class="item-label">虚拟资产</text>
            <text class="item-value">¥{{ virtualAssets.toFixed(2) }}</text>
          </view>
        </view>
        <view class="overview-item">
          <text class="item-icon">💵</text>
          <view class="item-content">
            <text class="item-label">本月收入</text>
            <text class="item-value income">¥{{ monthIncome.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 本月预算 -->
    <view class="budget-card" v-if="budget.isSet">
      <view class="budget-header">
        <text class="budget-title">本月预算</text>
        <text class="budget-subtitle">Monthly Budget</text>
      </view>
      <view class="budget-body">
        <view class="budget-main">
          <text class="budget-spent">¥{{ monthExpense.toFixed(2) }}</text>
          <text class="budget-divider">/</text>
          <text class="budget-total">¥{{ budget.monthly.toFixed(2) }}</text>
        </view>
        <view class="budget-progress">
          <view class="progress-bar">
            <view
              class="progress-fill"
              :class="{ over: monthExpense > budget.monthly }"
              :style="{ width: Math.min((monthExpense / budget.monthly) * 100, 100) + '%' }"
            ></view>
          </view>
          <text class="budget-status" :class="{ over: monthExpense > budget.monthly }">
            {{ monthExpense > budget.monthly ? '已超支 ¥' + (monthExpense - budget.monthly).toFixed(2) : '剩余 ¥' + (budget.monthly - monthExpense).toFixed(2) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-actions">
      <view class="action-item" @click="quickAction('expense')">
        <view class="action-icon expense">
          <text class="icon-text">💸</text>
        </view>
        <text class="action-label">记支出</text>
      </view>
      <view class="action-item" @click="quickAction('income')">
        <view class="action-icon income">
          <text class="icon-text">💰</text>
        </view>
        <text class="action-label">记收入</text>
      </view>
      <view class="action-item" @click="quickAction('asset')">
        <view class="action-icon asset">
          <text class="icon-text">📦</text>
        </view>
        <text class="action-label">加资产</text>
      </view>
      <view class="action-item" @click="quickAction('wish')">
        <view class="action-icon wish">
          <text class="icon-text">🛒</text>
        </view>
        <text class="action-label">加愿望</text>
      </view>
    </view>

    <!-- 今日支出 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">今日支出</text>
        <text class="section-more" @click="goToExpense">查看详情 ›</text>
      </view>
      <view class="today-expense" v-if="todayExpenses.length > 0">
        <view class="expense-item" v-for="item in todayExpenses.slice(0, 3)" :key="item.id">
          <view class="expense-icon" :style="{ background: getCategoryBg(item.category) }">
            <text>{{ getCategoryIcon(item.category) }}</text>
          </view>
          <view class="expense-info">
            <text class="expense-category">{{ item.category }}</text>
            <text class="expense-notes" v-if="item.notes">{{ item.notes }}</text>
          </view>
          <text class="expense-amount">-¥{{ item.amount.toFixed(2) }}</text>
        </view>
        <view class="expense-more" v-if="todayExpenses.length > 3" @click="goToExpense">
          <text>还有 {{ todayExpenses.length - 3 }} 笔支出 ›</text>
        </view>
      </view>
      <view class="empty-tip" v-else>
        <text class="empty-icon">✨</text>
        <text class="empty-text">今日暂无支出</text>
      </view>
    </view>

    <!-- 省钱统计 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">省钱统计</text>
        <text class="section-subtitle">Savings</text>
      </view>
      <view class="savings-stats">
        <view class="stat-item">
          <view class="stat-circle saved">
            <text class="stat-number">{{ savedAmount }}</text>
          </view>
          <text class="stat-label">已省金额(次)</text>
        </view>
        <view class="stat-item">
          <view class="stat-circle wish">
            <text class="stat-number">{{ wishCount }}</text>
          </view>
          <text class="stat-label">冷静中(个)</text>
        </view>
        <view class="stat-item">
          <view class="stat-circle total">
            <text class="stat-number">¥{{ totalWishPrice.toFixed(0) }}</text>
          </view>
          <text class="stat-label">想要总价(元)</text>
        </view>
      </view>
    </view>

    <!-- 月度趋势 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">本月支出趋势</text>
        <text class="section-subtitle">Monthly Trend</text>
      </view>
      <view class="trend-chart">
        <view class="chart-bars">
          <view
            v-for="(day, index) in last7Days"
            :key="index"
            class="chart-bar-wrapper"
          >
            <view
              class="chart-bar"
              :style="{ height: day.amount / maxDailyExpense * 100 + '%' }"
            >
              <view class="bar-tooltip">¥{{ day.amount.toFixed(0) }}</view>
            </view>
            <text class="bar-label">{{ day.label }}</text>
          </view>
        </view>
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
      greeting: '',
      currentDate: '',
      expenses: [],
      incomes: [],
      assets: [],
      wishlist: [],
      budget: { monthly: 3000, isSet: false },
      savedAmount: 0,
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
    totalAssets() {
      const assetsValue = this.assets.reduce((sum, item) => sum + (item.currentValue || item.price), 0)
      const income = this.incomes.reduce((sum, item) => sum + item.amount, 0)
      const expense = this.expenses.reduce((sum, item) => sum + item.amount, 0)
      return assetsValue + income - expense
    },
    cashAssets() {
      return this.assets.reduce((sum, item) => sum + (item.currentValue || item.price), 0) * 0.3
    },
    virtualAssets() {
      return this.assets.reduce((sum, item) => sum + (item.currentValue || item.price), 0) * 0.7
    },
    assetsChange() {
      return this.totalAssets * 0.05 // 模拟数据
    },
    monthExpense() {
      const monthStart = DateUtil.getMonthStart()
      return this.expenses
        .filter(item => item.date >= monthStart)
        .reduce((sum, item) => sum + item.amount, 0)
    },
    monthIncome() {
      const monthStart = DateUtil.getMonthStart()
      return this.incomes
        .filter(item => item.date >= monthStart)
        .reduce((sum, item) => sum + item.amount, 0)
    },
    todayExpenses() {
      const today = DateUtil.getToday()
      return this.expenses.filter(item => item.date === today)
    },
    wishCount() {
      return this.wishlist.filter(item => item.status === 'pending').length
    },
    totalWishPrice() {
      return this.wishlist
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + item.price, 0)
    },
    last7Days() {
      const days = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = DateUtil.formatDate(date)
        const dayExpenses = this.expenses.filter(item => item.date === dateStr)
        const amount = dayExpenses.reduce((sum, item) => sum + item.amount, 0)
        const weekdays = ['日', '一', '二', '三', '四', '五', '六']
        days.push({
          date: dateStr,
          label: weekdays[date.getDay()],
          amount
        })
      }
      return days
    },
    maxDailyExpense() {
      const max = Math.max(...this.last7Days.map(d => d.amount))
      return max > 0 ? max : 100
    }
  },
  onShow() {
    this.loadData()
    this.setGreeting()
  },
  methods: {
    loadData() {
      this.expenses = StorageUtil.getExpenses()
      this.incomes = StorageUtil.getIncomes ? StorageUtil.getIncomes() : []
      this.assets = StorageUtil.getAssets()
      this.wishlist = StorageUtil.getWishlist()
      this.savedAmount = StorageUtil.getSavedAmount()

      const budget = uni.getStorageSync('budget')
      if (budget) {
        this.budget = budget
      }
    },
    setGreeting() {
      const hour = new Date().getHours()
      if (hour < 6) {
        this.greeting = '夜深了'
      } else if (hour < 9) {
        this.greeting = '早上好'
      } else if (hour < 12) {
        this.greeting = '上午好'
      } else if (hour < 14) {
        this.greeting = '中午好'
      } else if (hour < 18) {
        this.greeting = '下午好'
      } else if (hour < 22) {
        this.greeting = '晚上好'
      } else {
        this.greeting = '夜深了'
      }

      const today = new Date()
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      this.currentDate = `${today.getMonth() + 1}月${today.getDate()}日 ${weekdays[today.getDay()]}`
    },
    getCategoryIcon(category) {
      return this.categoryIcons[category] || '📦'
    },
    getCategoryBg(category) {
      const color = this.categoryColors[category] || '#BB8FCE'
      return `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`
    },
    quickAction(type) {
      const routes = {
        expense: '/pages/add-expense/add-expense',
        income: '/pages/add-expense/add-expense?type=income',
        asset: '/pages/add-asset/add-asset',
        wish: '/pages/add-wish/add-wish'
      }
      uni.navigateTo({ url: routes[type] })
    },
    goToExpense() {
      uni.switchTab({ url: '/pages/expense/expense' })
    },
    goToProfile() {
      uni.navigateTo({ url: '/pages/profile/profile' })
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background: #F5F6FA;
  padding-bottom: 40rpx;
}

/* 自定义导航 */
.custom-nav {
  padding-top: var(--status-bar-height);
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 32rpx;
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  flex-direction: column;
}

.nav-greeting {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.nav-date {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4rpx;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 36rpx;
}

/* 资产总览卡片 */
.overview-card {
  background: #fff;
  margin: -60rpx 24rpx 24rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(76, 175, 80, 0.15);
}

.overview-header {
  margin-bottom: 16rpx;
}

.overview-title {
  font-size: 26rpx;
  color: #999;
}

.overview-subtitle {
  font-size: 20rpx;
  color: #ccc;
  margin-left: 12rpx;
}

.overview-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.overview-main {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.overview-value {
  font-size: 56rpx;
  font-weight: 700;
  color: #333;
}

.overview-change {
  display: flex;
  align-items: center;
  background: rgba(244, 67, 54, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;

  &.positive {
    background: rgba(76, 175, 80, 0.1);
    .change-icon, .change-value {
      color: #4CAF50;
    }
  }
}

.change-icon {
  font-size: 24rpx;
  color: #f44336;
  margin-right: 4rpx;
}

.change-value {
  font-size: 24rpx;
  color: #f44336;
  font-weight: 600;
}

.change-text {
  font-size: 20rpx;
  color: #999;
  margin-left: 4rpx;
}

.overview-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.overview-item {
  display: flex;
  align-items: center;
}

.item-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.item-content {
  display: flex;
  flex-direction: column;
}

.item-label {
  font-size: 22rpx;
  color: #999;
}

.item-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;

  &.income {
    color: #4CAF50;
  }
}

/* 预算卡片 */
.budget-card {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  margin: 0 24rpx 24rpx;
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 152, 0, 0.25);
}

.budget-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.budget-title {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.budget-subtitle {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 12rpx;
}

.budget-body {
  color: #fff;
}

.budget-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.budget-spent {
  font-size: 44rpx;
  font-weight: 700;
}

.budget-divider {
  font-size: 28rpx;
  opacity: 0.6;
  margin: 0 8rpx;
}

.budget-total {
  font-size: 28rpx;
  opacity: 0.8;
}

.budget-progress {
  display: flex;
  flex-direction: column;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 6rpx;
  transition: width 0.5s ease;

  &.over {
    background: #f44336;
  }
}

.budget-status {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 32rpx;
  margin: 0 24rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;

  &.expense {
    background: linear-gradient(135deg, #FF6B6B 0%, #ee5a5a 100%);
  }

  &.income {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  }

  &.asset {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.wish {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  }
}

.icon-text {
  font-size: 40rpx;
}

.action-label {
  font-size: 24rpx;
  color: #666;
}

/* 通用区块 */
.section-card {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.03);
  border: 1rpx solid rgba(0, 0, 0, 0.02);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.section-subtitle {
  font-size: 20rpx;
  color: #ccc;
  margin-left: 12rpx;
}

.section-more {
  font-size: 24rpx;
  color: #999;
}

/* 今日支出 */
.today-expense {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.expense-item {
  display: flex;
  align-items: center;
}

.expense-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 16rpx;
}

.expense-info {
  flex: 1;
}

.expense-category {
  display: block;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.expense-notes {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 2rpx;
}

.expense-amount {
  font-size: 28rpx;
  color: #f44336;
  font-weight: 600;
}

.expense-more {
  text-align: center;
  padding: 16rpx;
  color: #999;
  font-size: 24rpx;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.empty-icon {
  font-size: 60rpx;
  margin-bottom: 12rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

/* 省钱统计 */
.savings-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;

  &.saved {
    background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
  }

  &.wish {
    background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
  }

  &.total {
    background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
  }
}

.stat-number {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

/* 趋势图表 */
.trend-chart {
  padding: 20rpx 0;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 160rpx;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-bar {
  width: 32rpx;
  min-height: 8rpx;
  background: linear-gradient(180deg, #FF9800 0%, #FFB74D 100%);
  border-radius: 8rpx 8rpx 0 0;
  position: relative;
  transition: height 0.5s ease;

  &:hover .bar-tooltip {
    display: block;
  }
}

.bar-tooltip {
  display: none;
  position: absolute;
  top: -40rpx;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 50%;
    transform: translateX(-50%);
    border: 4rpx solid transparent;
    border-top-color: #333;
  }
}

.bar-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}
</style>
