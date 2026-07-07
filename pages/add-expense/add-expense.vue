<template>
  <view class="pg">
    <!-- 类型切换 — segmented control -->
    <view class="type-seg">
      <view class="seg-item" :class="{on:type==='expense'}" @click="switchType('expense')">
        <text class="seg-icon">💸</text>
        <text class="seg-txt">支出</text>
      </view>
      <view class="seg-item" :class="{on:type==='income'}" @click="switchType('income')">
        <text class="seg-icon">💰</text>
        <text class="seg-txt">收入</text>
      </view>
    </view>

    <!-- 金额输入 -->
    <view class="amount-sec">
      <text class="amt-lbl">{{ type==='expense'?'支出金额':'收入金额' }}</text>
      <view class="amt-input-wrap">
        <text class="currency">¥</text>
        <input v-model.number="form.amount" class="amt-input" type="digit" placeholder="0.00" focus />
      </view>
    </view>

    <!-- 表单 -->
    <view class="nx form-card">
      <!-- 分类 -->
      <view class="form-row">
        <text class="label">{{ type==='expense'?'支出分类':'收入分类' }}</text>
        <view class="cat-grid">
          <view v-for="item in categories" :key="item" class="cat-cell" :class="{on:form.category===item}" @click="selectCategory(item)">
            <text class="cat-icon">{{ type==='expense'?categoryIcons[item]:incomeCategoryIcons[item] }}</text>
            <text class="cat-name">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 日期 -->
      <view class="form-row">
        <text class="label">日期</text>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="picker-row">
            <text>{{ form.date || '请选择日期' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 备注 -->
      <view class="form-row last">
        <text class="label">备注</text>
        <textarea v-model="form.notes" class="textarea" placeholder="请输入备注信息（选填）" auto-height />
      </view>
    </view>

    <!-- 快捷金额 -->
    <view class="nx quick-sec">
      <text class="quick-lbl">快捷金额</text>
      <view class="quick-list">
        <view v-for="a in quickAmounts" :key="a" class="quick-chip" @click="setAmount(a)">¥{{ a }}</view>
      </view>
    </view>

    <!-- 保存 -->
    <button class="save-btn" :class="type" @click="saveRecord">
      {{ type==='expense'?'记一笔':'记收入' }}
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
      categoryIcons: { '餐饮': '🍚', '交通': '🚌', '购物': '🛒', '娱乐': '🎬', '住房': '🏠', '医疗': '💊', '教育': '📖', '通讯': '📱', '其他': '📦' },
      incomeCategoryIcons: { '工资': '💼', '奖金': '🎁', '兼职': '💪', '理财': '📈', '红包': '🧧', '退款': '↩️', '其他': '💵' },
      quickAmounts: [5, 10, 20, 30, 50, 100, 200, 500],
      form: { amount: '', category: '', date: DateUtil.getToday(), notes: '' }
    }
  },
  computed: {
    categories() {
      return this.type === 'expense' ? this.expenseCategories : this.incomeCategories
    }
  },
  onLoad(options) {
    if (options && options.type === 'income') {
      this.type = 'income'
    }
  },
  methods: {
    switchType(t) {
      this.type = t
      this.form.category = ''
    },
    selectCategory(c) {
      this.form.category = c
    },
    onDateChange(e) {
      this.form.date = e.detail.value
    },
    setAmount(a) {
      this.form.amount = a
    },
    saveRecord() {
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
      var n = Date.now()
      if (this.type === 'expense') {
        var expenses = StorageUtil.getExpenses()
        expenses.push({
          id: StorageUtil.generateId(),
          amount: this.form.amount,
          category: this.form.category,
          date: this.form.date,
          notes: this.form.notes,
          createdAt: n
        })
        StorageUtil.setExpenses(expenses)
        uni.showToast({ title: '记账成功', icon: 'success' })
      } else {
        var incomes = StorageUtil.getIncomes()
        incomes.push({
          id: StorageUtil.generateId(),
          amount: this.form.amount,
          category: this.form.category,
          date: this.form.date,
          notes: this.form.notes,
          createdAt: n
        })
        StorageUtil.setIncomes(incomes)
        uni.showToast({ title: '记收入成功', icon: 'success' })
      }
      setTimeout(function() {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style scoped lang="scss">
$bd:#000;$fg:#111;$ac:#eab308;$mu:#6b7280;

.pg{min-height:100vh;background:#fff;padding:30rpx}

/* 通用卡片 */
.nx{background:#fff;border:2px solid $bd;padding:24rpx;box-shadow:3px 3px 0 rgba(0,0,0,1)}

/* Segmented Control — 切换控件 */
.type-seg{display:flex;border:2px solid $bd;margin-bottom:36rpx}
.seg-item{flex:1;display:flex;align-items:center;justify-content:center;padding:20rpx;gap:10rpx;background:#fff;transition:all .15s;cursor:pointer}
.seg-item:first-child{border-right:2px solid $bd}
.seg-item.on{background:$fg;color:#fff}
.seg-icon{font-size:32rpx}
.seg-txt{font-size:28rpx;font-weight:500}
.seg-item.on .seg-txt{color:#fff}

/* 金额 */
.amount-sec{text-align:center;margin-bottom:36rpx}
.amt-lbl{font-size:26rpx;color:$mu;margin-bottom:14rpx;display:block}
.amt-input-wrap{display:flex;align-items:baseline;justify-content:center}
.currency{font-size:48rpx;font-weight:500;color:$fg;margin-right:8rpx}
.amt-input{font-size:80rpx;font-weight:700;color:$fg;text-align:center;width:400rpx}

/* 表单卡片 */
.form-card{margin-bottom:24rpx}
.form-row{padding:26rpx 0;border-bottom:1px solid rgba(0,0,0,0.08)}
.form-row.last{border-bottom:none}
.label{display:block;font-size:28rpx;color:$fg;font-weight:500;margin-bottom:18rpx}

/* 分类网格 */
.cat-grid{display:flex;flex-wrap:wrap;gap:14rpx}
.cat-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;width:130rpx;height:110rpx;background:$surface;border:2px solid transparent;transition:all .15s;cursor:pointer}
.cat-cell.on{background:#fefce8;border-color:$bd;box-shadow:2px 2px 0 $bd}
.cat-icon{font-size:38rpx;margin-bottom:6rpx}
.cat-name{font-size:22rpx;color:$mu}
.cat-cell.on .cat-name{color:$fg;font-weight:500}

/* 日期 */
.picker-row{display:flex;justify-content:space-between;align-items:center;font-size:30rpx;color:$fg;padding:14rpx 0}
.arrow{color:$mu;font-size:34rpx}

/* 备注 */
.textarea{font-size:28rpx;color:$fg;width:100%;min-height:100rpx;padding:20rpx;background:$surface;border:2px solid $bd}

/* 快捷金额 */
.quick-sec{margin-bottom:36rpx}
.quick-lbl{font-size:26rpx;color:$mu;margin-bottom:18rpx;display:block}
.quick-list{display:flex;flex-wrap:wrap;gap:14rpx}
.quick-chip{width:130rpx;height:64rpx;display:flex;align-items:center;justify-content:center;font-size:24rpx;color:$fg;background:#fff;border:2px solid $bd;box-shadow:2px 2px 0 $bd;font-weight:500;transition:all .1s}
.quick-chip:active{box-shadow:none;transform:translate(2px,2px)}

/* 保存按钮 */
.save-btn{margin-top:8rpx;height:96rpx;line-height:96rpx;font-size:32rpx;font-weight:600;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);background:$ac;color:$fg;transition:all .1s;border-radius:0}
.save-btn:active{box-shadow:none;transform:translate(3px,3px)}
.save-btn.income{background:$fg;color:#fff}
</style>
