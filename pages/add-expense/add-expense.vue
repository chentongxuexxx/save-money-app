<template>
  <view class="container">
    <!-- 类型切换 -->
    <view class="type-switch">
      <view
        class="switch-item"
        :class="{ active: type === 'expense' }"
        @click="switchType('expense')"
      >
        <text class="switch-icon">💸</text>
        <text class="switch-text">支出</text>
      </view>
      <view
        class="switch-item"
        :class="{ active: type === 'income' }"
        @click="switchType('income')"
      >
        <text class="switch-icon">💰</text>
        <text class="switch-text">收入</text>
      </view>
    </view>

    <!-- 金额输入 -->
    <view class="amount-section">
      <view class="amount-label">{{ type === 'expense' ? '支出金额' : '收入金额' }}</view>
      <view class="amount-input-wrapper">
        <text class="currency">¥</text>
        <input
          v-model.number="form.amount"
          class="amount-input"
          type="digit"
          placeholder="0.00"
          focus
        />
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 分类 -->
      <view class="form-item">
        <text class="label">{{ type === 'expense' ? '支出分类' : '收入分类' }}</text>
        <view class="category-grid">
          <view
            v-for="item in categories"
            :key="item"
            class="category-item"
            :class="{ active: form.category === item }"
            @click="selectCategory(item)"
          >
            <text class="cat-icon">{{ type === 'expense' ? categoryIcons[item] : incomeCategoryIcons[item] }}</text>
            <text class="cat-name">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 日期 -->
      <view class="form-item">
        <text class="label">日期</text>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="picker">
            <text>{{ form.date || '请选择日期' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="label">备注</text>
        <textarea
          v-model="form.notes"
          class="textarea"
          placeholder="请输入备注信息（选填）"
          auto-height
        />
      </view>
    </view>

    <!-- 快捷金额 -->
    <view class="quick-amount">
      <text class="quick-title">快捷金额</text>
      <view class="quick-list">
        <view
          v-for="amount in quickAmounts"
          :key="amount"
          class="quick-item"
          @click="setAmount(amount)"
        >
          ¥{{ amount }}
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <button class="save-btn" :class="type" @click="saveRecord">
      {{ type === 'expense' ? '记一笔' : '记收入' }}
    </button>
  </view>
</template>

<script>
import StorageUtil from '@/utils/storage.js'
import DateUtil from '@/utils/date.js'

export default {
  data() {
    return {
      type: 'expense',
      expenseCategories: ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '通讯', '其他'],
      incomeCategories: ['工资', '奖金', '兼职', '理财', '红包', '退款', '其他'],
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
      incomeCategoryIcons: {
        '工资': '💼',
        '奖金': '🎁',
        '兼职': '💪',
        '理财': '📈',
        '红包': '🧧',
        '退款': '↩️',
        '其他': '💵'
      },
      quickAmounts: [5, 10, 20, 30, 50, 100, 200, 500],
      form: {
        amount: '',
        category: '',
        date: DateUtil.getToday(),
        notes: ''
      }
    }
  },
  onLoad(options) {
    if (options && options.type === 'income') {
      this.type = 'income'
    }
  },
  computed: {
    categories() {
      return this.type === 'expense' ? this.expenseCategories : this.incomeCategories
    }
  },
  methods: {
    switchType(type) {
      this.type = type
      this.form.category = ''
    },
    selectCategory(category) {
      this.form.category = category
    },
    onDateChange(e) {
      this.form.date = e.detail.value
    },
    setAmount(amount) {
      this.form.amount = amount
    },
    saveRecord() {
      // 表单验证
      if (!this.form.amount || this.form.amount <= 0) {
        uni.showToast({ title: '请输入有效金额', icon: 'none' })
        return
      }
      if (!this.form.category) {
        uni.showToast({ title: '请选择分类', icon: 'none' })
        return
      }
      if (!this.form.date) {
        uni.showToast({ title: '请选择日期', icon: 'none' })
        return
      }

      const now = Date.now()

      if (this.type === 'expense') {
        // 保存支出
        const expenses = StorageUtil.getExpenses()
        const newRecord = {
          id: StorageUtil.generateId(),
          amount: this.form.amount,
          category: this.form.category,
          date: this.form.date,
          notes: this.form.notes,
          createdAt: now
        }
        expenses.push(newRecord)
        StorageUtil.setExpenses(expenses)

        uni.showToast({ title: '记账成功', icon: 'success' })
      } else {
        // 保存收入
        const incomes = StorageUtil.getIncomes()
        const newRecord = {
          id: StorageUtil.generateId(),
          amount: this.form.amount,
          category: this.form.category,
          date: this.form.date,
          notes: this.form.notes,
          createdAt: now
        }
        incomes.push(newRecord)
        StorageUtil.setIncomes(incomes)

        uni.showToast({ title: '记收入成功', icon: 'success' })
      }

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
  background: linear-gradient(180deg, #fafafa 0%, #fff 100%);
}

/* 类型切换 */
.type-switch {
  display: flex;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 40rpx;
}

.switch-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;

  &.active {
    background: #fff;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

    &.switch-item:first-child .switch-text {
      color: #FF9800;
    }

    &.switch-item:last-child .switch-text {
      color: #4CAF50;
    }
  }
}

.switch-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.switch-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 500;
}

/* 金额输入 */
.amount-section {
  text-align: center;
  margin-bottom: 40rpx;
}

.amount-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.amount-input-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency {
  font-size: 48rpx;
  font-weight: 500;
  color: #333;
  margin-right: 8rpx;
}

.amount-input {
  font-size: 80rpx;
  font-weight: 700;
  color: #333;
  text-align: center;
  width: 400rpx;
}

/* 表单 */
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
  width: 140rpx;
  height: 120rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: #fff3e0;
    border-color: #FF9800;
    box-shadow: 0 4rpx 16rpx rgba(255, 152, 0, 0.2);
  }
}

.category-item:last-child {
  .cat-name {
    color: #4CAF50;
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
  color: #FF9800;
  font-weight: 500;
}

/* 日期选择 */
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

/* 备注 */
.textarea {
  font-size: 28rpx;
  color: #333;
  width: 100%;
  min-height: 100rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

/* 快捷金额 */
.quick-amount {
  margin-top: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.quick-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
  display: block;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.quick-item {
  width: 140rpx;
  height: 70rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666;
  transition: all 0.2s ease;

  &:active {
    background: #eee;
    transform: scale(0.95);
  }
}

/* 保存按钮 */
.save-btn {
  margin-top: 40rpx;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #FF9800 0%, #f57c00 100%);
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 152, 0, 0.3);

  &.income {
    background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
    box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
