<template>
  <view class="pg">
    <!-- 统计卡片 — 白底黑边框 -->
    <view class="nx stat-card">
      <view class="stat-top">
        <text class="stat-lbl">本月支出</text>
        <view class="budget-tag" v-if="budget.isSet" :class="{over:monthTotal>budget.monthly}">
          <text>{{ monthTotal>budget.monthly?'已超预算':'预算剩余' }}</text>
          <text class="budget-num">¥{{ Math.abs(budget.monthly-monthTotal).toFixed(0) }}</text>
        </view>
      </view>
      <text class="stat-val">¥{{ monthTotal.toFixed(2) }}</text>
      <!-- 预算进度条 -->
      <view class="b-track" v-if="budget.isSet">
        <view class="b-fill" :class="{over:monthTotal>budget.monthly}" :style="{width:Math.min(monthTotal/budget.monthly*100,100)+'%'}"></view>
      </view>
    </view>

    <!-- 今日/日均统计 -->
    <view class="nx stat-mini">
      <view class="mini-item">
        <text class="mini-icon">📅</text>
        <view class="mini-info">
          <text class="mini-lbl">今日支出</text>
          <text class="mini-val">¥{{ todayTotal.toFixed(2) }}</text>
        </view>
      </view>
      <view class="mini-div"></view>
      <view class="mini-item">
        <text class="mini-icon">📊</text>
        <view class="mini-info">
          <text class="mini-lbl">日均消费</text>
          <text class="mini-val">¥{{ avgDaily.toFixed(2) }}</text>
        </view>
      </view>
      <view class="mini-div"></view>
      <view class="mini-item">
        <text class="mini-icon">📝</text>
        <view class="mini-info">
          <text class="mini-lbl">记账笔数</text>
          <text class="mini-val">{{ expenseCount }}笔</text>
        </view>
      </view>
    </view>

    <!-- 分类统计 — 直角进度条 -->
    <view class="nx cat-sec">
      <view class="sec-h"><text class="sec-t">支出分类</text></view>
      <view class="cat-list">
        <view v-for="it in categoryStats" :key="it.category" class="cat-row">
          <view class="cat-info">
            <text class="cat-icon">{{ it.icon }}</text>
            <text class="cat-name">{{ it.category }}</text>
          </view>
          <view class="cat-bar-wrap">
            <view class="cat-bar">
              <view class="cat-bar-fill" :style="{width:(it.amount/monthTotal*100)+'%'}"></view>
            </view>
            <text class="cat-amt">¥{{ it.amount.toFixed(0) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 支出记录 -->
    <view class="nx exp-sec">
      <view class="sec-h"><text class="sec-t">消费记录</text></view>
      <view class="exp-list">
        <view v-for="(group, date) in groupedExpenses" :key="date" class="date-group">
          <view class="date-head">
            <view class="date-info">
              <text class="date-txt">{{ formatDateHeader(date) }}</text>
              <text class="date-wd">{{ getWeekday(date) }}</text>
            </view>
            <view class="date-sum">
              <text class="sum-lbl">支出</text>
              <text class="sum-val">¥{{ getDateTotal(group).toFixed(2) }}</text>
            </view>
          </view>
          <view v-for="item in group" :key="item.id" class="exp-item" @click="editExpense(item)">
            <view class="exp-icon" :style="{background:catBg[item.category]||'#f3f4f6'}">
              <text>{{ getCategoryIcon(item.category) }}</text>
            </view>
            <view class="exp-info">
              <text class="exp-cat">{{ item.category }}</text>
              <text v-if="item.notes" class="exp-note">{{ item.notes }}</text>
            </view>
            <view class="exp-right">
              <text class="exp-amt">-¥{{ item.amount.toFixed(2) }}</text>
              <text class="exp-time">{{ item.time || '' }}</text>
            </view>
          </view>
        </view>

        <view v-if="expenses.length===0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-txt">还没有记账记录</text>
          <text class="empty-hint">点击下方按钮开始记账</text>
        </view>
      </view>
    </view>

    <!-- FAB -->
    <view class="fab" @click="goToAdd"><text class="fab-t">+</text></view>
    <TabBar :selected="2" />
  </view>
</template>

<script>
import StorageUtil from '@/utils/storage.js'
import DateUtil from '@/utils/date.js'
import TabBar from '@/components/TabBar.vue'

export default {
  components: { TabBar },
  data() {
    return {
      expenses: [],
      budget: { monthly: 3000, isSet: false },
      categories: ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '通讯', '其他'],
      categoryIcons: { '餐饮': '🍚', '交通': '🚌', '购物': '🛒', '娱乐': '🎬', '住房': '🏠', '医疗': '💊', '教育': '📖', '通讯': '📱', '其他': '📦' },
      catBg: { '餐饮': '#fef2f2', '交通': '#ecfdf5', '购物': '#eff6ff', '娱乐': '#f0fdf4', '住房': '#fefce8', '医疗': '#fdf2f8', '教育': '#f0fdfa', '通讯': '#fef9c3', '其他': '#f3f4f6' }
    }
  },
  computed: {
    todayTotal() {
      var t = DateUtil.getToday()
      return this.expenses.filter(function(i) { return i.date === t }).reduce(function(s, i) { return s + i.amount }, 0)
    },
    monthTotal() {
      var ms = DateUtil.getMonthStart()
      return this.expenses.filter(function(i) { return i.date >= ms }).reduce(function(s, i) { return s + i.amount }, 0)
    },
    expenseCount() {
      var ms = DateUtil.getMonthStart()
      return this.expenses.filter(function(i) { return i.date >= ms }).length
    },
    avgDaily() {
      var d = new Date().getDate()
      return d === 0 ? 0 : this.monthTotal / d
    },
    groupedExpenses() {
      var g = {}
      this.expenses.forEach(function(i) {
        if (!g[i.date]) g[i.date] = []
        g[i.date].push(i)
      })
      var s = {}
      Object.keys(g).sort(function(a, b) { return b.localeCompare(a) }).forEach(function(k) {
        s[k] = g[k]
      })
      return s
    },
    categoryStats() {
      var self = this
      var ms = DateUtil.getMonthStart()
      var me = this.expenses.filter(function(i) { return i.date >= ms })
      var s = []
      this.categories.forEach(function(c) {
        var a = me.filter(function(i) { return i.category === c }).reduce(function(sum, i) { return sum + i.amount }, 0)
        if (a > 0) s.push({ category: c, icon: self.categoryIcons[c], amount: a })
      })
      return s.sort(function(a, b) { return b.amount - a.amount }).slice(0, 5)
    }
  },
  onShow() {
    this.loadExpenses()
    this.loadBudget()
  },
  methods: {
    loadExpenses() {
      this.expenses = StorageUtil.getExpenses()
      this.expenses.sort(function(a, b) {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        return b.createdAt - a.createdAt
      })
    },
    loadBudget() {
      var b = uni.getStorageSync('budget')
      if (b) this.budget = b
    },
    getCategoryIcon(c) {
      return this.categoryIcons[c] || '📦'
    },
    formatDateHeader(d) {
      if (DateUtil.isToday(d)) return '今天'
      if (DateUtil.isYesterday(d)) return '昨天'
      return d
    },
    getWeekday(d) {
      return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(d).getDay()]
    },
    getDateTotal(g) {
      return g.reduce(function(s, i) { return s + i.amount }, 0)
    },
    deleteExpense(id) {
      var self = this
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: function(res) {
          if (res.confirm) {
            var e = StorageUtil.getExpenses()
            e = e.filter(function(i) { return i.id !== id })
            StorageUtil.setExpenses(e)
            self.loadExpenses()
            uni.showToast({ title: '删除成功', icon: 'success' })
          }
        }
      })
    },
    editExpense(item) {
      var self = this
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: function(res) {
          if (res.tapIndex === 0) {
            uni.navigateTo({ url: '/pages/add-expense/add-expense?id=' + item.id })
          } else if (res.tapIndex === 1) {
            self.deleteExpense(item.id)
          }
        }
      })
    },
    goToAdd() {
      uni.navigateTo({ url: '/pages/add-expense/add-expense' })
    }
  }
}
</script>

<style scoped lang="scss">
$bd:#000;$fg:#111;$ac:#eab308;$mu:#6b7280;

.pg{min-height:100vh;background:#fff;padding:20rpx;padding-bottom:140rpx}

/* 通用卡片 */
.nx{background:#fff;border:2px solid $bd;padding:24rpx;box-shadow:3px 3px 0 rgba(0,0,0,1);margin-bottom:20rpx}

/* 统计卡片 */
.stat-lbl{font-size:24rpx;color:$mu;text-transform:uppercase;letter-spacing:0.08em}
.stat-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8rpx}
.stat-val{font-size:72rpx;font-weight:700;color:$fg;display:block;margin:8rpx 0 16rpx}

/* 预算标签 */
.budget-tag{display:flex;align-items:center;gap:8rpx;background:$surface;padding:6rpx 14rpx;border:2px solid $bd;box-shadow:1px 1px 0 $bd;font-size:20rpx}
.budget-tag.over{background:$fg;color:#fff}
.budget-num{font-weight:600;font-size:22rpx}

/* 预算进度条 */
.b-track{height:12rpx;background:#e5e5e5;border:1px solid $bd;margin-top:4rpx}
.b-fill{height:100%;background:$fg;transition:width .5s}
.b-fill.over{box-shadow:2px 2px 0 #dc2626}

/* 迷你统计 */
.stat-mini{display:flex;align-items:center}
.mini-item{flex:1;display:flex;align-items:center;gap:12rpx}
.mini-icon{font-size:36rpx}
.mini-info{display:flex;flex-direction:column}
.mini-lbl{font-size:20rpx;color:$mu}
.mini-val{font-size:26rpx;font-weight:600}
.mini-div{width:1rpx;height:40rpx;background:#e5e5e5;margin:0 12rpx}

/* 区块标题 */
.sec-h{margin-bottom:20rpx}
.sec-t{font-size:26rpx;font-weight:600;letter-spacing:0.04em;text-transform:uppercase}

/* 分类统计 */
.cat-list{display:flex;flex-direction:column;gap:18rpx}
.cat-row{display:flex;align-items:center}
.cat-info{display:flex;align-items:center;width:150rpx;flex-shrink:0;gap:8rpx}
.cat-icon{font-size:28rpx}
.cat-name{font-size:24rpx;color:$mu}
.cat-bar-wrap{flex:1;display:flex;align-items:center;gap:12rpx}
.cat-bar{flex:1;height:14rpx;background:#e5e5e5;border:1px solid $bd}
.cat-bar-fill{height:100%;background:$fg;transition:width .5s}
.cat-amt{font-size:24rpx;color:$fg;font-weight:600;width:80rpx;text-align:right}

/* 支出列表 */
.exp-list{margin-top:8rpx}
.date-group{margin-bottom:20rpx}
.date-head{display:flex;justify-content:space-between;align-items:center;padding:14rpx 0;border-bottom:2px solid $bd}
.date-info{display:flex;align-items:baseline;gap:10rpx}
.date-txt{font-size:28rpx;color:$fg;font-weight:600}
.date-wd{font-size:22rpx;color:$mu}
.date-sum{display:flex;align-items:baseline;gap:6rpx}
.sum-lbl{font-size:22rpx;color:$mu}
.sum-val{font-size:26rpx;color:$fg;font-weight:600}

.exp-item{display:flex;align-items:center;padding:18rpx 12rpx;border-bottom:1px solid rgba(0,0,0,0.06);transition:background .15s}
.exp-item:active{background:rgba(0,0,0,0.03)}
.exp-icon{width:72rpx;height:72rpx;display:flex;align-items:center;justify-content:center;font-size:34rpx;border:2px solid $bd;margin-right:16rpx}
.exp-info{flex:1;min-width:0}
.exp-cat{display:block;font-size:28rpx;color:$fg;font-weight:500}
.exp-note{display:block;font-size:22rpx;color:$mu;margin-top:4rpx;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.exp-right{text-align:right;flex-shrink:0}
.exp-amt{display:block;font-size:28rpx;color:#dc2626;font-weight:600}
.exp-time{display:block;font-size:20rpx;color:$mu;margin-top:4rpx}

/* 空状态 */
.empty-state{display:flex;flex-direction:column;align-items:center;padding:60rpx 40rpx}
.empty-icon{font-size:100rpx;margin-bottom:20rpx}
.empty-txt{font-size:28rpx;color:$fg;font-weight:500;margin-bottom:8rpx}
.empty-hint{font-size:24rpx;color:$mu}

/* FAB */
.fab{position:fixed;right:32rpx;bottom:140rpx;z-index:100;width:96rpx;height:96rpx;background:$ac;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);display:flex;align-items:center;justify-content:center;transition:all .1s}
.fab-t{font-size:48rpx;font-weight:700}
.fab:active{box-shadow:none;transform:translate(3px,3px)}
</style>
