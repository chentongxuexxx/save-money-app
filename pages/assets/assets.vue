<template>
  <view class="pg">
    <!-- 统计卡片 -->
    <view class="nx stat">
      <text class="st-lbl">总资产</text>
      <text class="st-val">¥{{ totalValue.toFixed(2) }}</text>
      <view class="st-row">
        <text class="st-sub">共 {{ assetCount }} 件</text>
        <text class="st-sub">平均 {{ avgUsedDays }}天</text>
      </view>
    </view>

    <!-- 分类筛选 — 直角 pills -->
    <scroll-view scroll-x class="cat-scroll">
      <view class="cat-list">
        <view class="nx cat-pill" :class="{on:currentCategory==='全部'}" @click="filterCategory('全部')"><text>全部</text></view>
        <view class="nx cat-pill" :class="{on:currentCategory===c}" v-for="c in categories" :key="c" @click="filterCategory(c)">
          <text>{{ categoryIcons[c] }} {{ c }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 资产列表 -->
    <view class="list">
      <view class="nx a-item" v-for="it in filteredAssets" :key="it.id" @click="goToDetail(it)">
        <view class="a-icon" :style="{background:catBg[it.category]||'#f0f0f0'}"><text>{{ categoryIcons[it.category]||'📦' }}</text></view>
        <view class="flex-1 ml-sm">
          <text class="a-name">{{ it.name }}</text>
          <text class="a-meta">🕐 {{ it.purchaseDate }} · 已用 {{ getUsedTime(it.purchaseDate) }}</text>
        </view>
        <view class="a-right">
          <text class="a-price">¥{{ it.currentValue.toFixed(2) }}</text>
          <text class="a-orig" v-if="it.currentValue<it.price">原 ¥{{ it.price.toFixed(2) }}</text>
        </view>
      </view>
      <view v-if="filteredAssets.length===0" class="empty">📦 暂无资产</view>
    </view>

    <!-- FAB -->
    <view class="fab" @click="goToAdd"><text class="fab-t">+</text></view>
    <TabBar :selected="1" />
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
      assets: [],
      categories: ['电子产品', '家具', '服装', '厨具', '书籍', '运动器材', '其他'],
      currentCategory: '全部',
      categoryIcons: { '电子产品': '📱', '家具': '🪑', '服装': '👕', '厨具': '🍳', '书籍': '📚', '运动器材': '⚽', '其他': '📦' },
      catBg: { '电子产品': '#e0f2fe', '家具': '#fce7f3', '服装': '#e0e7ff', '厨具': '#d1fae5', '书籍': '#fef3c7', '运动器材': '#fce7f3', '其他': '#f3f4f6' }
    }
  },
  computed: {
    filteredAssets() {
      var self = this
      if (this.currentCategory === '全部') return this.assets
      return this.assets.filter(function(i) { return i.category === self.currentCategory })
    },
    assetCount() {
      return this.assets.length
    },
    totalValue() {
      return this.assets.reduce(function(s, i) { return s + (i.currentValue || i.price) }, 0)
    },
    avgUsedDays() {
      if (this.assets.length === 0) return 0
      var t = this.assets.reduce(function(s, i) { return s + DateUtil.getUsedDays(i.purchaseDate) }, 0)
      return Math.floor(t / this.assets.length)
    }
  },
  onShow() {
    this.loadAssets()
  },
  methods: {
    loadAssets() {
      this.assets = StorageUtil.getAssets()
      this.assets.sort(function(a, b) { return b.createdAt - a.createdAt })
    },
    filterCategory(c) {
      this.currentCategory = c
    },
    getUsedTime(d) {
      return DateUtil.getUsedTimeString(d)
    },
    goToAdd() {
      uni.navigateTo({ url: '/pages/add-asset/add-asset' })
    },
    goToDetail(it) {
      uni.navigateTo({ url: '/pages/add-asset/add-asset?id=' + it.id })
    }
  }
}
</script>

<style scoped lang="scss">
$bd:#000;$fg:#111;$ac:#eab308;$mu:#6b7280;

.pg{min-height:100vh;background:#fff;padding:20rpx;padding-bottom:140rpx}

/* 通用卡片 */
.nx{border:2px solid $bd;background:#fff;padding:24rpx;box-shadow:3px 3px 0 rgba(0,0,0,1)}

/* 统计 */
.stat{margin-bottom:24rpx}
.st-lbl{font-size:24rpx;color:$mu;text-transform:uppercase;letter-spacing:0.08em}
.st-val{font-size:64rpx;font-weight:700;color:$fg;display:block;margin:8rpx 0 16rpx}
.st-row{display:flex;gap:32rpx}
.st-sub{font-size:24rpx;color:$mu}

/* 分类 pills */
.cat-scroll{margin-bottom:24rpx}
.cat-list{display:flex;gap:12rpx;padding:4rpx 0;overflow-x:auto}
.cat-pill{padding:14rpx 24rpx;white-space:nowrap;font-size:24rpx;font-weight:600;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,1);transition:all .1s}
.cat-pill:active{box-shadow:none;transform:translate(2px,2px)}
.cat-pill.on{background:$ac}

/* 列表 */
.list{display:flex;flex-direction:column;gap:12rpx}
.a-item{display:flex;align-items:center;padding:20rpx;box-shadow:none;transition:all .15s}
.a-item:active{box-shadow:3px 3px 0 rgba(0,0,0,1)}
.a-icon{width:72rpx;height:72rpx;display:flex;align-items:center;justify-content:center;font-size:36rpx;border:2px solid $bd}
.a-name{font-size:28rpx;font-weight:600;display:block}
.a-meta{font-size:22rpx;color:$mu;display:block;margin-top:4rpx}
.a-right{text-align:right}
.a-price{font-size:28rpx;font-weight:700}
.a-orig{font-size:22rpx;color:#bbb;text-decoration:line-through;display:block}

/* 通用 */
.flex-1{flex:1}.ml-sm{margin-left:16rpx}
.empty{padding:80rpx;text-align:center;color:$mu;font-size:28rpx;border:2px dashed $bd}

/* FAB */
.fab{position:fixed;right:32rpx;bottom:140rpx;width:96rpx;height:96rpx;background:$ac;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .1s}
.fab-t{font-size:48rpx;font-weight:700}
.fab:active{box-shadow:none;transform:translate(3px,3px)}
</style>
