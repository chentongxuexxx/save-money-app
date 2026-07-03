<template>
  <view class="container">
    <!-- 表单 -->
    <view class="form">
      <!-- 资产名称 -->
      <view class="form-item">
        <text class="label">资产名称</text>
        <input
          v-model="form.name"
          class="input"
          placeholder="请输入资产名称"
        />
      </view>

      <!-- 分类 -->
      <view class="form-item">
        <text class="label">分类</text>
        <view class="category-grid">
          <view
            v-for="item in categories"
            :key="item"
            class="category-item"
            :class="{ active: form.category === item }"
            @click="selectCategory(item)"
          >
            <text class="cat-icon">{{ categoryIcons[item] }}</text>
            <text class="cat-name">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 购买日期 -->
      <view class="form-item">
        <text class="label">购买日期</text>
        <picker mode="date" :value="form.purchaseDate" @change="onDateChange">
          <view class="picker">
            <text>{{ form.purchaseDate || '请选择日期' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 购买价格 -->
      <view class="form-item">
        <text class="label">购买价格(元)</text>
        <input
          v-model.number="form.price"
          class="input amount"
          type="digit"
          placeholder="请输入购买价格"
        />
      </view>

      <!-- 当前估值 -->
      <view class="form-item">
        <text class="label">当前估值(元)</text>
        <input
          v-model.number="form.currentValue"
          class="input amount"
          type="digit"
          placeholder="默认等于购买价格"
        />
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="label">备注</text>
        <textarea
          v-model="form.notes"
          class="textarea"
          placeholder="请输入备注信息"
          auto-height
        />
      </view>
    </view>

    <!-- 已用时间显示 -->
    <view v-if="form.purchaseDate" class="used-info">
      <text class="used-icon">⏱️</text>
      <text class="used-text">已使用: {{ usedTime }}</text>
    </view>

    <!-- 按钮区域 -->
    <view class="btn-group">
      <button v-if="isEdit" class="btn delete-btn" @click="deleteAsset">删除</button>
      <button class="btn save-btn" @click="saveAsset">{{ isEdit ? '保存修改' : '添加资产' }}</button>
    </view>
  </view>
</template>

<script>
import StorageUtil from '@/utils/storage.js'
import DateUtil from '@/utils/date.js'

export default {
  data() {
    return {
      id: null,
      isEdit: false,
      categories: ['电子产品', '家具', '服装', '厨具', '书籍', '运动器材', '其他'],
      categoryIcons: {
        '电子产品': '📱',
        '家具': '🪑',
        '服装': '👕',
        '厨具': '🍳',
        '书籍': '📚',
        '运动器材': '⚽',
        '其他': '📦'
      },
      form: {
        name: '',
        category: '',
        purchaseDate: '',
        price: '',
        currentValue: '',
        notes: ''
      }
    }
  },
  computed: {
    usedTime() {
      if (!this.form.purchaseDate) return ''
      return DateUtil.getUsedTimeString(this.form.purchaseDate)
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.isEdit = true
      this.loadAsset()
    }
  },
  methods: {
    loadAsset() {
      const assets = StorageUtil.getAssets()
      const asset = assets.find(item => item.id === this.id)
      if (asset) {
        this.form = { ...asset }
      }
    },
    selectCategory(category) {
      this.form.category = category
    },
    onDateChange(e) {
      this.form.purchaseDate = e.detail.value
    },
    saveAsset() {
      if (!this.form.name) {
        uni.showToast({ title: '请输入资产名称', icon: 'none' })
        return
      }
      if (!this.form.category) {
        uni.showToast({ title: '请选择分类', icon: 'none' })
        return
      }
      if (!this.form.purchaseDate) {
        uni.showToast({ title: '请选择购买日期', icon: 'none' })
        return
      }
      if (!this.form.price) {
        uni.showToast({ title: '请输入购买价格', icon: 'none' })
        return
      }

      const assets = StorageUtil.getAssets()
      const now = Date.now()

      if (!this.form.currentValue) {
        this.form.currentValue = this.form.price
      }

      if (this.isEdit) {
        const index = assets.findIndex(item => item.id === this.id)
        if (index !== -1) {
          this.form.updatedAt = now
          assets[index] = { ...assets[index], ...this.form }
        }
      } else {
        const newAsset = {
          id: StorageUtil.generateId(),
          ...this.form,
          createdAt: now,
          updatedAt: now
        }
        assets.push(newAsset)
      }

      StorageUtil.setAssets(assets)
      uni.showToast({ title: this.isEdit ? '保存成功' : '添加成功', icon: 'success' })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    },
    deleteAsset() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个资产吗？',
        success: (res) => {
          if (res.confirm) {
            let assets = StorageUtil.getAssets()
            assets = assets.filter(item => item.id !== this.id)
            StorageUtil.setAssets(assets)
            uni.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #fff 100%);
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

.form-item:last-child {
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
  font-size: 30rpx;
  color: #333;
  padding: 16rpx 0;

  &.amount {
    font-size: 36rpx;
    font-weight: 600;
    color: #4CAF50;
  }
}

.picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 30rpx;
  color: #333;
  padding: 16rpx 0;
}

.arrow {
  color: #ccc;
  font-size: 36rpx;
}

.textarea {
  font-size: 28rpx;
  color: #333;
  width: 100%;
  min-height: 100rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

/* 分类网格 */
.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 130rpx;
  height: 110rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: #e8f5e9;
    border-color: #4CAF50;
    box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.2);
  }
}

.cat-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.cat-name {
  font-size: 22rpx;
  color: #666;
}

.category-item.active .cat-name {
  color: #4CAF50;
  font-weight: 500;
}

/* 已用时间 */
.used-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 16rpx;
}

.used-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.used-text {
  color: #2E7D32;
  font-size: 28rpx;
  font-weight: 500;
}

/* 按钮 */
.btn-group {
  margin-top: 40rpx;
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}

.save-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);

  &:active {
    transform: scale(0.98);
  }
}

.delete-btn {
  background: #fff;
  color: #f44336;
  border: 2rpx solid #f44336;

  &:active {
    background: #ffebee;
  }
}
</style>
