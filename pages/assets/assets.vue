<template>
  <view class="container">
    <!-- 统计卡片 - 升级版 -->
    <view class="stat-card">
      <view class="stat-card-header">
        <text class="stat-title">总资产</text>
        <text class="stat-subtitle">Asset Overview</text>
      </view>
      <view class="stat-card-body">
        <view class="stat-main">
          <text class="currency">¥</text>
          <text class="stat-value">{{ totalValue.toFixed(2) }}</text>
        </view>
        <view class="stat-tag">
          <text class="tag-icon">📊</text>
          <text class="tag-text">共 {{ assetCount }} 件资产</text>
        </view>
      </view>
      <view class="stat-card-footer">
        <view class="stat-footer-item">
          <text class="footer-label">平均使用</text>
          <text class="footer-value">{{ avgUsedDays }}天</text>
        </view>
        <view class="stat-footer-divider"></view>
        <view class="stat-footer-item">
          <text class="footer-label">今日新增</text>
          <text class="footer-value">{{ todayAdded }}件</text>
        </view>
      </view>
    </view>

    <!-- 分类筛选 - 横向滚动 -->
    <view class="category-section">
      <scroll-view scroll-x class="category-scroll" enable-flex>
        <view class="category-list">
          <view
            class="category-pill"
            :class="{ active: currentCategory === '全部' }"
            @click="filterCategory('全部')"
          >
            <text class="pill-icon">✨</text>
            <text class="pill-text">全部</text>
          </view>
          <view
            v-for="item in categories"
            :key="item"
            class="category-pill"
            :class="{ active: currentCategory === item }"
            @click="filterCategory(item)"
          >
            <text class="pill-icon">{{ categoryIcons[item] }}</text>
            <text class="pill-text">{{ item }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 资产列表 -->
    <view class="asset-list">
      <view
        v-for="(item, index) in filteredAssets"
        :key="item.id"
        class="asset-item"
        :class="{ 'animate-item': index < 5 }"
        :style="{ animationDelay: index * 0.05 + 's' }"
        @click="goToDetail(item)"
      >
        <view class="asset-icon" :style="{ background: getCategoryBg(item.category) }">
          <text class="icon-emoji">{{ getCategoryIcon(item.category) }}</text>
        </view>
        <view class="asset-info">
          <view class="asset-header">
            <text class="asset-name">{{ item.name }}</text>
            <view class="asset-badge" v-if="isNewItem(item)">
              <text class="badge-text">NEW</text>
            </view>
          </view>
          <view class="asset-meta">
            <text class="asset-date">🕐 {{ item.purchaseDate }}</text>
            <text class="asset-used">已用 {{ getUsedTime(item.purchaseDate) }}</text>
          </view>
        </view>
        <view class="asset-price">
          <text class="price-current">¥{{ item.currentValue.toFixed(2) }}</text>
          <text class="price-original" v-if="item.currentValue < item.price">
            ¥{{ item.price.toFixed(2) }}
          </text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredAssets.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">还没有资产记录</text>
        <text class="empty-hint">点击下方按钮添加你的第一件资产</text>
        <view class="empty-btn" @click="goToAdd">
          <text class="btn-text">+ 添加资产</text>
        </view>
      </view>
    </view>

    <!-- 添加按钮 - 悬浮球 -->
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
      assets: [],
      categories: ['电子产品', '家具', '服装', '厨具', '书籍', '运动器材', '其他'],
      currentCategory: '全部',
      categoryIcons: {
        '电子产品': '📱',
        '家具': '🪑',
        '服装': '👕',
        '厨具': '🍳',
        '书籍': '📚',
        '运动器材': '⚽',
        '其他': '📦'
      },
      categoryColors: {
        '电子产品': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '家具': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        '服装': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        '厨具': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        '书籍': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        '运动器材': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        '其他': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
      }
    }
  },
  computed: {
    filteredAssets() {
      if (this.currentCategory === '全部') {
        return this.assets
      }
      return this.assets.filter(item => item.category === this.currentCategory)
    },
    assetCount() {
      return this.assets.length
    },
    totalValue() {
      return this.assets.reduce((sum, item) => sum + (item.currentValue || item.price), 0)
    },
    avgUsedDays() {
      if (this.assets.length === 0) return 0
      const totalDays = this.assets.reduce((sum, item) => {
        return sum + DateUtil.getUsedDays(item.purchaseDate)
      }, 0)
      return Math.floor(totalDays / this.assets.length)
    },
    todayAdded() {
      const today = DateUtil.getToday()
      return this.assets.filter(item => item.date === today).length
    }
  },
  onShow() {
    this.loadAssets()
  },
  methods: {
    loadAssets() {
      this.assets = StorageUtil.getAssets()
      this.assets.sort((a, b) => b.createdAt - a.createdAt)
    },
    filterCategory(category) {
      this.currentCategory = category
    },
    getCategoryIcon(category) {
      return this.categoryIcons[category] || '📦'
    },
    getCategoryBg(category) {
      return this.categoryColors[category] || 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    },
    getUsedTime(purchaseDate) {
      return DateUtil.getUsedTimeString(purchaseDate)
    },
    isNewItem(item) {
      const today = DateUtil.getToday()
      return item.purchaseDate === today
    },
    goToAdd() {
      uni.navigateTo({
        url: '/pages/add-asset/add-asset'
      })
    },
    goToDetail(item) {
      uni.navigateTo({
        url: `/pages/add-asset/add-asset?id=${item.id}`
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

/* 统计卡片 - 升级版 */
.stat-card {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(76, 175, 80, 0.3);
  color: #fff;
}

.stat-card-header {
  margin-bottom: 16rpx;
}

.stat-title {
  font-size: 28rpx;
  font-weight: 500;
  opacity: 0.9;
}

.stat-subtitle {
  font-size: 20rpx;
  opacity: 0.6;
  margin-left: 12rpx;
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
  font-size: 64rpx;
  font-weight: 700;
  letter-spacing: -2rpx;
}

.stat-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-top: 12rpx;
}

.tag-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.tag-text {
  font-size: 22rpx;
  opacity: 0.9;
}

.stat-card-footer {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
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
}

.footer-label {
  font-size: 22rpx;
  opacity: 0.7;
  margin-bottom: 4rpx;
}

.footer-value {
  font-size: 28rpx;
  font-weight: 600;
}

/* 分类筛选 */
.category-section {
  margin-bottom: 24rpx;
}

.category-scroll {
  width: 100%;
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  gap: 16rpx;
  padding: 8rpx 4rpx;
}

.category-pill {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-radius: 50rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);

    .pill-text {
      color: #fff;
    }

    .pill-icon {
      transform: scale(1.1);
    }
  }
}

.pill-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
  transition: transform 0.3s ease;
}

.pill-text {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

/* 资产列表 */
.asset-list {
  padding-top: 8rpx;
}

.asset-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &.animate-item {
    animation: fadeInUp 0.4s ease-out backwards;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
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

.asset-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 44rpx;
}

.asset-info {
  flex: 1;
  min-width: 0;
}

.asset-header {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.asset-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.asset-badge {
  background: linear-gradient(135deg, #FF9800 0%, #f57c00 100%);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
}

.badge-text {
  font-size: 18rpx;
  color: #fff;
  font-weight: 700;
}

.asset-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.asset-date {
  font-size: 22rpx;
  color: #999;
}

.asset-used {
  font-size: 22rpx;
  color: #4CAF50;
  font-weight: 500;
}

.asset-price {
  text-align: right;
  flex-shrink: 0;
}

.price-current {
  display: block;
  font-size: 32rpx;
  color: #333;
  font-weight: 700;
}

.price-original {
  display: block;
  font-size: 22rpx;
  color: #bbb;
  text-decoration: line-through;
  margin-top: 4rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 140rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 24rpx 60rpx;
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
}

.btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

/* 添加按钮 - 悬浮球 */
.add-btn {
  position: fixed;
  right: 32rpx;
  bottom: 60rpx;
  z-index: 100;
}

.add-btn-inner {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(76, 175, 80, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.92);
    box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.3);
  }
}

.add-icon {
  color: #fff;
  font-size: 56rpx;
  font-weight: 300;
  line-height: 1;
}
</style>
