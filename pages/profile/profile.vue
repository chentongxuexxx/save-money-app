<template>
  <view class="container">
    <!-- 顶部用户信息 -->
    <view class="user-header">
      <view class="user-avatar">
        <text class="avatar-icon">👤</text>
      </view>
      <view class="user-info">
        <text class="user-name">点击登录</text>
        <text class="user-tip">登录后同步数据</text>
      </view>
      <view class="login-btn" @click="login">
        <text class="btn-text">登录</text>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.assetCount }}</text>
        <text class="stat-label">资产</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.expenseCount }}</text>
        <text class="stat-label">记账</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.wishCount }}</text>
        <text class="stat-label">愿望</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">¥{{ stats.savedAmount }}</text>
        <text class="stat-label">已省</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="section-title">功能管理</view>
      <view class="menu-list">
        <view class="menu-item" @click="setBudget">
          <view class="menu-left">
            <text class="menu-icon">💰</text>
            <text class="menu-text">预算设置</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="exportData">
          <view class="menu-left">
            <text class="menu-icon">📤</text>
            <text class="menu-text">数据导出</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="importData">
          <view class="menu-left">
            <text class="menu-icon">📥</text>
            <text class="menu-text">数据导入</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 其他设置 -->
    <view class="menu-section">
      <view class="section-title">其他</view>
      <view class="menu-list">
        <view class="menu-item" @click="showAbout">
          <view class="menu-left">
            <text class="menu-icon">ℹ️</text>
            <text class="menu-text">关于</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="clearData">
          <view class="menu-left">
            <text class="menu-icon">🗑️</text>
            <text class="menu-text">清空数据</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">省钱小助手 v1.0.0</text>
    </view>
  </view>
</template>

<script>
import StorageUtil from '@/utils/storage.js'

export default {
  data() {
    return {
      userInfo: null,
      stats: {
        assetCount: 0,
        expenseCount: 0,
        wishCount: 0,
        savedAmount: 0
      }
    }
  },
  onShow() {
    this.loadStats()
  },
  methods: {
    loadStats() {
      const assets = StorageUtil.getAssets()
      const expenses = StorageUtil.getExpenses()
      const wishlist = StorageUtil.getWishlist()
      const savedAmount = StorageUtil.getSavedAmount()

      this.stats = {
        assetCount: assets.length,
        expenseCount: expenses.length,
        wishCount: wishlist.filter(w => w.status === 'pending').length,
        savedAmount: savedAmount.toFixed(0)
      }
    },
    login() {
      uni.showToast({
        title: '微信登录开发中',
        icon: 'none'
      })
    },
    setBudget() {
      uni.showModal({
        title: '设置月度预算',
        placeholderText: '请输入预算金额',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            const amount = parseFloat(res.content)
            if (isNaN(amount) || amount <= 0) {
              uni.showToast({ title: '请输入有效金额', icon: 'none' })
              return
            }
            StorageUtil.setBudget({ monthly: amount, isSet: true })
            uni.showToast({ title: '预算设置成功', icon: 'success' })
          }
        }
      })
    },
    exportData() {
      const data = StorageUtil.exportData()
      const jsonStr = JSON.stringify(data, null, 2)

      uni.showModal({
        title: '导出数据',
        content: '数据已准备好，是否复制到剪贴板？',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: jsonStr,
              success: () => {
                uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
    },
    importData() {
      uni.showModal({
        title: '导入数据',
        content: '请在文本框中粘贴JSON数据',
        placeholderText: '粘贴JSON数据',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            try {
              const data = JSON.parse(res.content)
              StorageUtil.importData(data)
              uni.showToast({ title: '导入成功', icon: 'success' })
              this.loadStats()
            } catch (e) {
              uni.showToast({ title: '数据格式错误', icon: 'none' })
            }
          }
        }
      })
    },
    showAbout() {
      uni.showModal({
        title: '关于',
        content: '省钱小助手 v1.0.0\n一款帮你省钱的资产记账软件',
        showCancel: false
      })
    },
    clearData() {
      uni.showModal({
        title: '清空数据',
        content: '确定要清空所有数据吗？此操作不可恢复！',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.reLaunch({
              url: '/pages/home/home'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f5 0%, #fff 100%);
  padding-bottom: 40rpx;
}

/* 用户头部 */
.user-header {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 60rpx;
}

.user-info {
  flex: 1;
  margin-left: 24rpx;
}

.user-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

.user-tip {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8rpx;
}

.login-btn {
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
}

.btn-text {
  color: #fff;
  font-size: 26rpx;
}

/* 统计数据 */
.stats-card {
  display: flex;
  align-items: center;
  background: #fff;
  margin: -30rpx 24rpx 24rpx;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1rpx;
  height: 50rpx;
  background: #f0f0f0;
}

/* 菜单 */
.menu-section {
  margin: 0 24rpx 24rpx;
}

.section-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.menu-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #fafafa;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}

/* 版本 */
.version-info {
  text-align: center;
  padding: 40rpx;
}

.version-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>
