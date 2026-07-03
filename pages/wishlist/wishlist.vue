<template>
  <view class="container">
    <!-- 统计卡片 -->
    <view class="stat-card">
      <view class="stat-card-header">
        <text class="stat-title">想买清单</text>
        <text class="stat-subtitle">Wish List</text>
      </view>
      <view class="stat-card-body">
        <view class="stat-main">
          <text class="stat-value">{{ pendingCount }}</text>
          <text class="stat-unit">个</text>
        </view>
        <view class="stat-label">冷静期中</view>
      </view>
      <view class="stat-card-footer">
        <view class="stat-footer-item">
          <text class="footer-label">总价</text>
          <text class="footer-value">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <view class="stat-footer-divider"></view>
        <view class="stat-footer-item">
          <text class="footer-label">已省</text>
          <text class="footer-value saved">¥{{ savedAmount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 明天到期的提醒 -->
    <view v-if="expiringSoon.length > 0" class="alert-section">
      <view class="alert-header">
        <text class="alert-icon">⏰</text>
        <text class="alert-title">明天到期</text>
        <text class="alert-count">{{ expiringSoon.length }}个</text>
      </view>
      <view
        v-for="item in expiringSoon"
        :key="item.id"
        class="wish-item urgent"
      >
        <view class="wish-icon" :style="{ background: getPriorityBg(item.priority) }">
          <text>{{ getPriorityIcon(item.priority) }}</text>
        </view>
        <view class="wish-info">
          <view class="wish-header">
            <text class="wish-name">{{ item.name }}</text>
            <view class="priority-tag" :class="'priority-' + item.priority">
              {{ getPriorityText(item.priority) }}
            </view>
          </view>
          <view class="wish-meta">
            <text class="wish-price">¥{{ item.price.toFixed(2) }}</text>
            <text class="wish-timer expire-soon">明天到期</text>
          </view>
        </view>
        <view class="wish-actions">
          <button class="action-btn delete" @click="deleteWish(item.id)">删除</button>
          <button class="action-btn keep" @click="keepWish(item.id)">不买了</button>
          <button class="action-btn buy" @click="markAsBought(item.id)">买了</button>
        </view>
      </view>
    </view>

    <!-- 冷静期中列表 -->
    <view class="wish-section">
      <view class="section-header">
        <text class="section-title">我的清单</text>
        <text class="section-subtitle">My Wishlist</text>
      </view>
      <view class="wish-list">
        <view
          v-for="(item, index) in pendingList"
          :key="item.id"
          class="wish-item"
          :class="{ 'animate-item': index < 5 }"
          :style="{ animationDelay: index * 0.05 + 's' }"
        >
          <view class="wish-icon" :style="{ background: getPriorityBg(item.priority) }">
            <text>{{ getPriorityIcon(item.priority) }}</text>
          </view>
          <view class="wish-info">
            <view class="wish-header">
              <text class="wish-name">{{ item.name }}</text>
              <view class="priority-tag" :class="'priority-' + item.priority">
                {{ getPriorityText(item.priority) }}
              </view>
            </view>
            <view class="wish-meta">
              <text class="wish-price">¥{{ item.price.toFixed(2) }}</text>
              <text class="wish-timer" :class="{ 'expired': getRemainingDays(item.expireDate) <= 0 }">
                {{ getRemainingDays(item.expireDate) > 0 ? '还剩 ' + getRemainingDays(item.expireDate) + ' 天' : '已到期' }}
              </text>
            </view>
            <!-- 存钱进度 -->
            <view class="save-progress" v-if="item.savedAmount > 0">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: Math.min((item.savedAmount / item.price) * 100, 100) + '%' }"></view>
              </view>
              <text class="progress-text">已存 ¥{{ item.savedAmount.toFixed(0) }} / ¥{{ item.price.toFixed(0) }}</text>
            </view>
          </view>
          <view class="wish-actions">
            <button class="action-btn extend" @click="extendWish(item.id)">+7天</button>
            <button class="action-btn save" @click="addSavedAmount(item)">存钱</button>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="wishlist.length === 0" class="empty-state">
          <text class="empty-icon">🛍️</text>
          <text class="empty-text">清单为空</text>
          <text class="empty-hint">添加你想买的东西，开始存钱吧</text>
          <view class="empty-btn" @click="goToAdd">
            <text class="btn-text">+ 添加愿望</text>
          </view>
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
      wishlist: [],
      savedAmount: 0
    }
  },
  computed: {
    pendingList() {
      return this.wishlist.filter(item => item.status === 'pending')
    },
    expiringSoon() {
      return this.pendingList.filter(item => {
        return DateUtil.getRemainingDays(item.expireDate) === 1
      })
    },
    pendingCount() {
      return this.pendingList.length
    },
    totalPrice() {
      return this.pendingList.reduce((sum, item) => sum + item.price, 0)
    }
  },
  onShow() {
    this.loadWishlist()
  },
  methods: {
    loadWishlist() {
      this.wishlist = StorageUtil.getWishlist()
      this.savedAmount = StorageUtil.getSavedAmount()
      this.wishlist.sort((a, b) => {
        // 按优先级排序：高 > 中 > 低
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        return new Date(a.expireDate) - new Date(b.expireDate)
      })
    },
    getRemainingDays(expireDate) {
      return DateUtil.getRemainingDays(expireDate)
    },
    getPriorityIcon(priority) {
      const icons = { 'high': '🔥', 'medium': '⭐', 'low': '💤' }
      return icons[priority] || '💤'
    },
    getPriorityText(priority) {
      const texts = { 'high': '高优先', 'medium': '中优先', 'low': '普通' }
      return texts[priority] || '普通'
    },
    getPriorityBg(priority) {
      const bgs = {
        'high': 'linear-gradient(135deg, #FF6B6B 0%, #ee5a5a 100%)',
        'medium': 'linear-gradient(135deg, #FFD93D 0%, #f5c800 100%)',
        'low': 'linear-gradient(135deg, #A8E6CF 0%, #88d8b0 100%)'
      }
      return bgs[priority] || bgs['low']
    },
    deleteWish(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个商品吗？',
        success: (res) => {
          if (res.confirm) {
            let wishlist = StorageUtil.getWishlist()
            wishlist = wishlist.filter(item => item.id !== id)
            StorageUtil.setWishlist(wishlist)
            this.loadWishlist()
            uni.showToast({ title: '删除成功', icon: 'success' })
          }
        }
      })
    },
    keepWish(id) {
      const item = this.wishlist.find(w => w.id === id)
      if (!item) return

      uni.showModal({
        title: '确认不买了',
        content: `确定不买了？将节省 ¥${item.price.toFixed(2)}`,
        success: (res) => {
          if (res.confirm) {
            let wishlist = StorageUtil.getWishlist()
            wishlist = wishlist.filter(w => w.id !== id)
            StorageUtil.setWishlist(wishlist)

            const savedAmount = StorageUtil.getSavedAmount()
            StorageUtil.setSavedAmount(savedAmount + item.price)

            this.loadWishlist()
            uni.showToast({ title: '已节省 ¥' + item.price.toFixed(2), icon: 'success' })
          }
        }
      })
    },
    markAsBought(id) {
      const item = this.wishlist.find(w => w.id === id)
      if (!item) return

      uni.showModal({
        title: '确认购买',
        content: `已购买 "${item.name}"？`,
        success: (res) => {
          if (res.confirm) {
            let wishlist = StorageUtil.getWishlist()
            wishlist = wishlist.filter(w => w.id !== id)
            StorageUtil.setWishlist(wishlist)

            this.loadWishlist()
            uni.showToast({ title: '购买成功', icon: 'success' })
          }
        }
      })
    },
    extendWish(id) {
      uni.showModal({
        title: '延长冷静期',
        content: '再冷静7天？',
        success: (res) => {
          if (res.confirm) {
            let wishlist = StorageUtil.getWishlist()
            const index = wishlist.findIndex(w => w.id === id)
            if (index !== -1) {
              const newExpireDate = new Date()
              newExpireDate.setDate(newExpireDate.getDate() + 7)
              wishlist[index].expireDate = DateUtil.formatDate(newExpireDate)
              wishlist[index].updatedAt = Date.now()
              StorageUtil.setWishlist(wishlist)
              this.loadWishlist()
              uni.showToast({ title: '已延长7天', icon: 'success' })
            }
          }
        }
      })
    },
    addSavedAmount(item) {
      uni.showModal({
        title: '存钱',
        content: `为 "${item.name}" 存入多少钱？`,
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            const amount = parseFloat(res.content)
            if (isNaN(amount) || amount <= 0) {
              uni.showToast({ title: '请输入有效金额', icon: 'none' })
              return
            }
            let wishlist = StorageUtil.getWishlist()
            const index = wishlist.findIndex(w => w.id === item.id)
            if (index !== -1) {
              if (!wishlist[index].savedAmount) {
                wishlist[index].savedAmount = 0
              }
              wishlist[index].savedAmount += amount
              wishlist[index].updatedAt = Date.now()
              StorageUtil.setWishlist(wishlist)
              this.loadWishlist()
              uni.showToast({ title: '存钱成功', icon: 'success' })
            }
          }
        }
      })
    },
    goToAdd() {
      uni.navigateTo({
        url: '/pages/add-wish/add-wish'
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
  background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(33, 150, 243, 0.3);
  color: #fff;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.stat-title {
  font-size: 28rpx;
  font-weight: 500;
}

.stat-subtitle {
  font-size: 20rpx;
  opacity: 0.6;
}

.stat-card-body {
  margin-bottom: 24rpx;
}

.stat-main {
  display: flex;
  align-items: baseline;
}

.stat-value {
  font-size: 80rpx;
  font-weight: 700;
}

.stat-unit {
  font-size: 32rpx;
  margin-left: 8rpx;
  opacity: 0.9;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
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
  flex-direction: column;
  align-items: center;
}

.stat-footer-divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 20rpx;
}

.footer-label {
  font-size: 22rpx;
  opacity: 0.7;
  margin-bottom: 4rpx;
}

.footer-value {
  font-size: 28rpx;
  font-weight: 600;

  &.saved {
    color: #81C784;
  }
}

/* 提醒区域 */
.alert-section {
  margin-bottom: 24rpx;
}

.alert-header {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.alert-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.alert-title {
  font-size: 28rpx;
  color: #f44336;
  font-weight: 600;
}

.alert-count {
  font-size: 24rpx;
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-left: 12rpx;
}

/* 想买清单 */
.wish-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
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

.wish-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.wish-item {
  display: flex;
  align-items: flex-start;
  background: #fafafa;
  border-radius: 20rpx;
  padding: 20rpx;
  transition: all 0.2s ease;

  &.animate-item {
    animation: fadeInUp 0.4s ease-out backwards;
  }

  &.urgent {
    border: 2rpx solid #f44336;
    background: #fff5f5;
  }

  &:active {
    transform: scale(0.99);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wish-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.wish-info {
  flex: 1;
  min-width: 0;
}

.wish-header {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.wish-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.priority-tag {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;

  &.priority-high {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }

  &.priority-medium {
    background: rgba(255, 193, 7, 0.1);
    color: #ff9800;
  }

  &.priority-low {
    background: rgba(76, 175, 80, 0.1);
    color: #4CAF50;
  }
}

.wish-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.wish-price {
  font-size: 26rpx;
  color: #2196F3;
  font-weight: 600;
}

.wish-timer {
  font-size: 22rpx;
  color: #4CAF50;

  &.expire-soon {
    color: #f44336;
  }

  &.expired {
    color: #f44336;
  }
}

/* 存钱进度 */
.save-progress {
  margin-top: 12rpx;
}

.progress-bar {
  height: 10rpx;
  background: #e0e0e0;
  border-radius: 5rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196F3 0%, #64B5F6 100%);
  border-radius: 5rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 20rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

/* 操作按钮 */
.wish-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex-shrink: 0;
}

.action-btn {
  height: 52rpx;
  line-height: 52rpx;
  font-size: 22rpx;
  border-radius: 26rpx;
  padding: 0 20rpx;
  border: none;

  &.delete {
    background: #f5f5f5;
    color: #999;
  }

  &.keep {
    background: rgba(76, 175, 80, 0.1);
    color: #4CAF50;
  }

  &.buy {
    background: #2196F3;
    color: #fff;
  }

  &.extend {
    background: rgba(255, 152, 0, 0.1);
    color: #FF9800;
  }

  &.save {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    color: #fff;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.empty-icon {
  font-size: 140rpx;
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
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  padding: 24rpx 60rpx;
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.3);
}

.btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
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
  background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(33, 150, 243, 0.4);
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
