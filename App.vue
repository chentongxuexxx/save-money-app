<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    // 初始化本地存储数据
    this.initStorage()
  },
  methods: {
    initStorage() {
      // 初始化资产数据
      if (!uni.getStorageSync('assets')) {
        uni.setStorageSync('assets', [])
      }
      // 初始化记账数据
      if (!uni.getStorageSync('expenses')) {
        uni.setStorageSync('expenses', [])
      }
      // 初始化想买清单数据
      if (!uni.getStorageSync('wishlist')) {
        uni.setStorageSync('wishlist', [])
      }
      // 初始化已省金额
      if (!uni.getStorageSync('savedAmount')) {
        uni.setStorageSync('savedAmount', 0)
      }
      // 初始化预算
      if (!uni.getStorageSync('budget')) {
        uni.setStorageSync('budget', {
          monthly: 3000,
          isSet: false
        })
      }
      // 初始化收入记录
      if (!uni.getStorageSync('incomes')) {
        uni.setStorageSync('incomes', [])
      }
      // 初始化用户信息
      if (!uni.getStorageSync('userInfo')) {
        uni.setStorageSync('userInfo', null)
      }
    }
  }
}
</script>

<style lang="scss">
/* 全局样式 */
@import '@/uni.scss';

/* 基础样式 */
page {
  background-color: #F5F5F5;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  padding: 20rpx;
  padding-bottom: 140rpx;
}

/* 通用卡片 */
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
}

/* 通用按钮 */
.btn-primary {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  border: none;
}

/* 通用标题 */
.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.title-sm {
  font-size: 28rpx;
  font-weight: 500;
  color: #666;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    text-align: center;
  }

  .empty-btn {
    margin-top: 32rpx;
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: #fff;
    border-radius: 50rpx;
    font-size: 28rpx;
  }
}

/* 通用列表项 */
.list-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    background: #fafafa;
    transform: scale(0.99);
  }
}

/* 渐变背景 */
.gradient-green {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #FF9800 0%, #f57c00 100%);
}

.gradient-blue {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
}

.gradient-cyan {
  background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

/* 通用图标 */
.icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;

  &.icon-green {
    background: rgba(76, 175, 80, 0.12);
  }

  &.icon-orange {
    background: rgba(255, 152, 0, 0.12);
  }

  &.icon-blue {
    background: rgba(33, 150, 243, 0.12);
  }

  &.icon-cyan {
    background: rgba(0, 188, 212, 0.12);
  }
}

/* 分割线 */
.divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 20rpx 0;
}

/* 标签 */
.tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;

  &.tag-green {
    background: rgba(76, 175, 80, 0.12);
    color: #4CAF50;
  }

  &.tag-orange {
    background: rgba(255, 152, 0, 0.12);
    color: #FF9800;
  }

  &.tag-blue {
    background: rgba(33, 150, 243, 0.12);
    color: #2196F3;
  }

  &.tag-red {
    background: rgba(244, 67, 54, 0.12);
    color: #f44336;
  }
}

/* 通用输入框 */
.input-field {
  background: #f9f9f9;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  width: 100%;

  &:focus {
    background: #f5f5f5;
    box-shadow: inset 0 0 0 2rpx rgba(76, 175, 80, 0.3);
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
}
</style>
