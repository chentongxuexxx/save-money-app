<template>
  <view class="container">
    <!-- 表单 -->
    <view class="form">
      <!-- 商品名称 -->
      <view class="form-item">
        <text class="label">商品名称</text>
        <input
          v-model="form.name"
          class="input"
          placeholder="想买的商品是什么？"
        />
      </view>

      <!-- 期望价格 -->
      <view class="form-item">
        <text class="label">期望价格(元)</text>
        <input
          v-model.number="form.price"
          class="input amount"
          type="digit"
          placeholder="心理价位是多少？"
        />
      </view>

      <!-- 优先级 -->
      <view class="form-item">
        <text class="label">优先级</text>
        <view class="priority-options">
          <view
            class="priority-item"
            :class="{ active: form.priority === 'high' }"
            @click="selectPriority('high')"
          >
            <text class="priority-icon">🔥</text>
            <text class="priority-text">高优先</text>
          </view>
          <view
            class="priority-item"
            :class="{ active: form.priority === 'medium' }"
            @click="selectPriority('medium')"
          >
            <text class="priority-icon">⭐</text>
            <text class="priority-text">中优先</text>
          </view>
          <view
            class="priority-item"
            :class="{ active: form.priority === 'low' }"
            @click="selectPriority('low')"
          >
            <text class="priority-icon">💤</text>
            <text class="priority-text">普通</text>
          </view>
        </view>
      </view>

      <!-- 冷静期天数 -->
      <view class="form-item">
        <text class="label">冷静期(天)</text>
        <view class="cooling-days">
          <view
            v-for="day in coolingOptions"
            :key="day"
            class="day-item"
            :class="{ active: form.coolingDays === day }"
            @click="selectDays(day)"
          >
            {{ day }}天
          </view>
        </view>
      </view>

      <!-- 冷静期说明 -->
      <view class="cooling-tip">
        <text class="tip-icon">💡</text>
        <text class="tip-text">冷静期过后，系统会提醒你重新考虑是否真的需要购买</text>
      </view>
    </view>

    <!-- 预计到期日 -->
    <view v-if="form.coolingDays" class="expire-info">
      <text class="expire-icon">📅</text>
      <text>预计冷静期结束: {{ expireDate }}</text>
    </view>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="saveWish">添加到清单</button>
  </view>
</template>

<script>
import StorageUtil from '@/utils/storage.js'
import DateUtil from '@/utils/date.js'

export default {
  data() {
    return {
      coolingOptions: [3, 5, 7, 14, 30],
      form: {
        name: '',
        price: '',
        priority: 'medium',
        coolingDays: 7
      }
    }
  },
  computed: {
    expireDate() {
      if (!this.form.coolingDays) return ''
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + this.form.coolingDays)
      return DateUtil.formatDate(expireDate)
    }
  },
  methods: {
    selectPriority(priority) {
      this.form.priority = priority
    },
    selectDays(days) {
      this.form.coolingDays = days
    },
    saveWish() {
      if (!this.form.name) {
        uni.showToast({ title: '请输入商品名称', icon: 'none' })
        return
      }
      if (!this.form.price || this.form.price <= 0) {
        uni.showToast({ title: '请输入有效价格', icon: 'none' })
        return
      }

      const wishlist = StorageUtil.getWishlist()
      const now = new Date()
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + this.form.coolingDays)

      const newWish = {
        id: StorageUtil.generateId(),
        name: this.form.name,
        price: this.form.price,
        priority: this.form.priority,
        coolingDays: this.form.coolingDays,
        addDate: DateUtil.getToday(),
        expireDate: DateUtil.formatDate(expireDate),
        status: 'pending',
        savedAmount: 0,
        createdAt: now.getTime(),
        updatedAt: now.getTime()
      }

      wishlist.push(newWish)
      StorageUtil.setWishlist(wishlist)

      uni.showToast({ title: '添加成功', icon: 'success' })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f8ff 0%, #fff 100%);
}

.form {
  background: #fff;
  border-radius: 24rpx;
  padding: 8rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.form-item {
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.form-item:last-of-type {
  border-bottom: none;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.input {
  font-size: 32rpx;
  color: #333;
  padding: 16rpx 0;

  &.amount {
    font-size: 40rpx;
    font-weight: 600;
    color: #2196F3;
  }
}

/* 优先级选择 */
.priority-options {
  display: flex;
  gap: 16rpx;
}

.priority-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    border-color: #2196F3;
    background: #e3f2fd;

    .priority-text {
      color: #2196F3;
      font-weight: 600;
    }
  }
}

.priority-icon {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}

.priority-text {
  font-size: 24rpx;
  color: #666;
}

/* 冷静期选择 */
.cooling-days {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.day-item {
  padding: 16rpx 28rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: #e3f2fd;
    color: #2196F3;
    border-color: #2196F3;
    font-weight: 500;
  }
}

/* 冷静期提示 */
.cooling-tip {
  display: flex;
  align-items: flex-start;
  margin-top: 24rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.tip-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

/* 到期信息 */
.expire-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 16rpx;
  color: #1565C0;
  font-size: 26rpx;
}

.expire-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

/* 保存按钮 */
.save-btn {
  margin-top: 40rpx;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%);
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.3);

  &:active {
    transform: scale(0.98);
  }
}
</style>
