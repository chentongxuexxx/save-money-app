<template>
  <view class="pg">
    <!-- 顶部 — 黄色 nav -->
    <view class="nav">
      <view class="nav-l">
        <text class="nav-g">{{ greeting }}</text>
        <text class="nav-d">{{ currentDate }}</text>
      </view>
      <view class="nav-r" @click="goToProfile"><text class="av">👤</text></view>
    </view>

    <!-- 资产卡片 -->
    <view class="nx hero-card">
      <view class="hero-top">
        <text class="hero-lbl">总资产</text>
      </view>
      <text class="hero-val">¥{{ totalAssets.toFixed(2) }}</text>
      <view class="hero-row">
        <text class="hero-sub">资产 {{ assetCount }}件</text>
        <text class="hero-sub">收入 ¥{{ monthIncome.toFixed(0) }}</text>
        <text class="hero-sub">支出 ¥{{ monthExpense.toFixed(0) }}</text>
      </view>
    </view>

    <!-- 预算 -->
    <view class="nx budget-bar" v-if="budget.isSet">
      <view class="b-label">本月预算 ¥{{ budget.monthly }}</view>
      <view class="b-track"><view class="b-fill" :class="{over:monthExpense>budget.monthly}" :style="{width:Math.min(monthExpense/budget.monthly*100,100)+'%'}"></view></view>
      <text class="b-note">{{ monthExpense>budget.monthly?'超支':'剩余' }} ¥{{ Math.abs(budget.monthly-monthExpense).toFixed(0) }}</text>
    </view>

    <!-- 快捷操作 -->
    <view class="quick">
      <view class="nx q-btn bg-y" @click="quickAction('expense')"><text>💸 记支出</text></view>
      <view class="nx q-btn bg-y" @click="quickAction('income')"><text>💰 记收入</text></view>
      <view class="nx q-btn" @click="quickAction('asset')"><text>📦 加资产</text></view>
      <view class="nx q-btn" @click="quickAction('wish')"><text>🛒 加愿望</text></view>
    </view>

    <!-- 今日支出 -->
    <view class="sec">
      <view class="sec-h"><text class="sec-t">今日支出</text><text class="sec-more" @click="goToExpense">全部 ›</text></view>
      <view v-if="todayExpenses.length>0">
        <view class="item-row" v-for="it in todayExpenses" :key="it.id">
          <text>{{ getCategoryIcon(it.category) }}</text>
          <text class="flex-1 ml-sm">{{ it.category }}</text>
          <text class="red">-¥{{ it.amount.toFixed(2) }}</text>
        </view>
      </view>
      <view v-else class="empty">✨ 今日暂无支出</view>
    </view>

    <!-- 近7天趋势 -->
    <view class="sec">
      <view class="sec-h"><text class="sec-t">近7天趋势</text></view>
      <view class="chart">
        <view class="ch-bar" v-for="(d,i) in last7Days" :key="i">
          <view class="ch-fill" :style="{height:d.amount/maxDailyExpense*100+'%'}"></view>
          <text class="ch-lbl">{{ d.label }}</text>
        </view>
      </view>
    </view>

    <TabBar :selected="0" />
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
      greeting: '',
      currentDate: '',
      expenses: [],
      incomes: [],
      assets: [],
      wishlist: [],
      budget: { monthly: 3000, isSet: false },
      savedAmount: 0,
      categoryIcons: { '餐饮': '🍚', '交通': '🚌', '购物': '🛒', '娱乐': '🎬', '住房': '🏠', '医疗': '💊', '教育': '📖', '通讯': '📱', '其他': '📦' }
    }
  },
  computed: {
    totalAssets() {
      var a = this.assets.reduce(function(s, i) { return s + (i.currentValue || i.price) }, 0)
      var inc = this.incomes.reduce(function(s, i) { return s + i.amount }, 0)
      var exp = this.expenses.reduce(function(s, i) { return s + i.amount }, 0)
      return a + inc - exp
    },
    assetCount() {
      return this.assets.length
    },
    monthExpense() {
      var ms = DateUtil.getMonthStart()
      return this.expenses.filter(function(i) { return i.date >= ms }).reduce(function(s, i) { return s + i.amount }, 0)
    },
    monthIncome() {
      var ms = DateUtil.getMonthStart()
      return this.incomes.filter(function(i) { return i.date >= ms }).reduce(function(s, i) { return s + i.amount }, 0)
    },
    todayExpenses() {
      var t = DateUtil.getToday()
      return this.expenses.filter(function(i) { return i.date === t })
    },
    last7Days() {
      var days = []
      var today = new Date()
      for (var i = 6; i >= 0; i--) {
        var d = new Date(today)
        d.setDate(d.getDate() - i)
        var ds = DateUtil.formatDate(d)
        var amt = this.expenses.filter(function(e) { return e.date === ds }).reduce(function(s, e) { return s + e.amount }, 0)
        days.push({ label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()], amount: amt })
      }
      return days
    },
    maxDailyExpense() {
      var max = 0
      this.last7Days.forEach(function(d) { if (d.amount > max) max = d.amount })
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
      this.incomes = StorageUtil.getIncomes()
      this.assets = StorageUtil.getAssets()
      this.wishlist = StorageUtil.getWishlist()
      this.savedAmount = StorageUtil.getSavedAmount()
      var b = uni.getStorageSync('budget')
      if (b) this.budget = b
    },
    setGreeting() {
      var h = new Date().getHours()
      if (h < 6) this.greeting = '夜深了'
      else if (h < 9) this.greeting = '早上好'
      else if (h < 12) this.greeting = '上午好'
      else if (h < 14) this.greeting = '中午好'
      else if (h < 18) this.greeting = '下午好'
      else if (h < 22) this.greeting = '晚上好'
      else this.greeting = '夜深了'
      var t = new Date()
      var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      this.currentDate = (t.getMonth() + 1) + '月' + t.getDate() + '日 ' + weekdays[t.getDay()]
    },
    getCategoryIcon(c) {
      return this.categoryIcons[c] || '📦'
    },
    quickAction(t) {
      var routes = { expense: '/pages/add-expense/add-expense', income: '/pages/add-expense/add-expense?type=income', asset: '/pages/add-asset/add-asset', wish: '/pages/add-wish/add-wish' }
      uni.navigateTo({ url: routes[t] })
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
$bg:#fff;$fg:#111;$bd:#000;$ac:#eab308;$mu:#6b7280;

.pg{min-height:100vh;background:$bg;padding-bottom:40rpx}

/* 顶部导航 — 品牌黄 */
.nav{padding:60rpx 32rpx 32rpx;background:$ac;border-bottom:2px solid $bd;display:flex;justify-content:space-between;align-items:center}
.nav-g{font-size:40rpx;font-weight:700;color:$fg}
.nav-d{font-size:24rpx;color:$mu;display:block}
.av{width:72rpx;height:72rpx;background:#fff;border:2px solid $bd;display:flex;align-items:center;justify-content:center;font-size:36rpx;box-shadow:1px 1px 0 $bd}

/* 通用卡片 — 白底 + 2px 黑边框 + d2 硬阴影 */
.nx{background:#fff;border:2px solid $bd;padding:24rpx;box-shadow:3px 3px 0 rgba(0,0,0,1)}
.hero-card{margin:32rpx 24rpx 16rpx}
.hero-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8rpx}
.hero-lbl{font-size:24rpx;color:$mu;text-transform:uppercase;letter-spacing:0.08em}
.hero-val{font-size:72rpx;font-weight:700;color:$fg;display:block;margin:8rpx 0 16rpx}
.hero-row{display:flex;gap:32rpx}
.hero-sub{font-size:24rpx;color:$mu}

/* 预算 */
.budget-bar{margin:0 24rpx 16rpx;display:flex;flex-wrap:wrap;align-items:center;gap:16rpx}
.b-label{font-size:24rpx;font-weight:600}
.b-track{flex:1;height:12rpx;background:#e5e5e5;border:1px solid $bd}
.b-fill{height:100%;background:$fg;transition:width .5s}
.b-fill.over{background:$fg;box-shadow:2px 2px 0 #dc2626}
.b-note{font-size:22rpx;color:$mu}

/* 快捷操作 — 3D 按钮 */
.quick{display:flex;gap:12rpx;margin:0 24rpx 24rpx;flex-wrap:wrap}
.q-btn{padding:18rpx 28rpx;font-size:26rpx;font-weight:600;cursor:pointer;transition:all .1s}
.q-btn:active{box-shadow:none!important;transform:translate(3px,3px)}
.q-btn.bg-y{background:$ac}

/* 区块 */
.sec{margin:0 24rpx 24rpx;border:2px solid $bd;padding:24rpx;background:#fff;box-shadow:3px 3px 0 rgba(0,0,0,1)}
.sec-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:20rpx}
.sec-t{font-size:26rpx;font-weight:600;letter-spacing:0.04em;text-transform:uppercase}
.sec-more{font-size:24rpx;color:$mu}

/* 列表 */
.item-row{display:flex;align-items:center;padding:18rpx 0;border-bottom:1px solid rgba(0,0,0,0.08)}
.item-row:last-child{border-bottom:none}
.flex-1{flex:1}.ml-sm{margin-left:16rpx}.red{color:#dc2626;font-weight:600}
.empty{padding:40rpx;text-align:center;color:$mu;font-size:24rpx}

/* 图表 — 直角柱状 */
.chart{display:flex;justify-content:space-between;align-items:flex-end;height:160rpx}
.ch-bar{flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end}
.ch-fill{width:36rpx;min-height:6rpx;background:$fg;transition:height .5s}
.ch-lbl{font-size:22rpx;color:$mu;margin-top:12rpx}
</style>
