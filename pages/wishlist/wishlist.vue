<template>
  <view class="pg">
    <!-- 统计卡片 -->
    <view class="nx stat-card">
      <view class="stat-top">
        <text class="stat-lbl">想买清单</text>
      </view>
      <view class="stat-body">
        <text class="stat-val">{{ pendingCount }}</text>
        <text class="stat-unit">个冷静期中</text>
      </view>
      <view class="stat-foot">
        <view class="sf-item">
          <text class="sf-lbl">总价</text>
          <text class="sf-val">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <view class="sf-div"></view>
        <view class="sf-item">
          <text class="sf-lbl">已省</text>
          <text class="sf-val saved">¥{{ savedAmount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 明天到期提醒 -->
    <view v-if="expiringSoon.length>0" class="alert-sec">
      <view class="alert-head">
        <text class="alert-icon">⏰</text>
        <text class="alert-title">明天到期</text>
        <text class="alert-badge">{{ expiringSoon.length }}个</text>
      </view>
      <view v-for="item in expiringSoon" :key="item.id" class="nx wish-card urgent">
        <view class="wish-icon" :style="{background:priBg[item.priority]}">
          <text>{{ priIcon(item.priority) }}</text>
        </view>
        <view class="wish-info">
          <view class="wish-head">
            <text class="wish-name">{{ item.name }}</text>
            <text class="pri-tag" :class="'pri-'+item.priority">{{ priText(item.priority) }}</text>
          </view>
          <view class="wish-meta">
            <text class="wish-price">¥{{ item.price.toFixed(2) }}</text>
            <text class="wish-timer expire-soon">明天到期</text>
          </view>
        </view>
        <view class="wish-acts">
          <view class="act-btn sec" @click="deleteWish(item.id)">删除</view>
          <view class="act-btn sec" @click="keepWish(item.id)">不买了</view>
          <view class="act-btn pri" @click="markAsBought(item.id)">买了</view>
        </view>
      </view>
    </view>

    <!-- 清单列表 -->
    <view class="nx wish-sec">
      <view class="sec-h"><text class="sec-t">我的清单</text></view>
      <view class="wish-list">
        <view v-for="(item, idx) in pendingList" :key="item.id" class="nx wish-card" :class="{'anim':idx<5}" :style="{animationDelay:idx*0.05+'s'}">
          <view class="wish-icon" :style="{background:priBg[item.priority]}">
            <text>{{ priIcon(item.priority) }}</text>
          </view>
          <view class="wish-info">
            <view class="wish-head">
              <text class="wish-name">{{ item.name }}</text>
              <text class="pri-tag" :class="'pri-'+item.priority">{{ priText(item.priority) }}</text>
            </view>
            <view class="wish-meta">
              <text class="wish-price">¥{{ item.price.toFixed(2) }}</text>
              <text class="wish-timer" :class="{expired:getRemainingDays(item.expireDate)<=0}">
                {{ getRemainingDays(item.expireDate)>0?'还剩 '+getRemainingDays(item.expireDate)+' 天':'已到期' }}
              </text>
            </view>
            <!-- 存钱进度 -->
            <view class="save-prog" v-if="item.savedAmount>0">
              <view class="prog-bar">
                <view class="prog-fill" :style="{width:Math.min((item.savedAmount/item.price)*100,100)+'%'}"></view>
              </view>
              <text class="prog-txt">已存 ¥{{ item.savedAmount.toFixed(0) }} / ¥{{ item.price.toFixed(0) }}</text>
            </view>
          </view>
          <view class="wish-acts">
            <view class="act-btn sec" @click="extendWish(item.id)">+7天</view>
            <view class="act-btn pri" @click="addSavedAmount(item)">存钱</view>
          </view>
        </view>

        <view v-if="wishlist.length===0" class="empty-state">
          <text class="empty-icon">🛍️</text>
          <text class="empty-txt">清单为空</text>
          <text class="empty-hint">添加你想买的东西，开始存钱吧</text>
          <view class="nx empty-btn" @click="goToAdd"><text>+ 添加愿望</text></view>
        </view>
      </view>
    </view>

    <!-- FAB -->
    <view class="fab" @click="goToAdd"><text class="fab-t">+</text></view>
    <TabBar :selected="3" />
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
      wishlist: [],
      savedAmount: 0,
      priBg: { high: '#fef2f2', medium: '#fefce8', low: '#f0fdf4' }
    }
  },
  computed: {
    pendingList() {
      return this.wishlist.filter(function(item) { return item.status === 'pending' })
    },
    expiringSoon() {
      return this.pendingList.filter(function(item) {
        return DateUtil.getRemainingDays(item.expireDate) === 1
      })
    },
    pendingCount() {
      return this.pendingList.length
    },
    totalPrice() {
      return this.pendingList.reduce(function(sum, item) { return sum + item.price }, 0)
    }
  },
  onShow() {
    this.loadWishlist()
  },
  methods: {
    loadWishlist() {
      this.wishlist = StorageUtil.getWishlist()
      this.savedAmount = StorageUtil.getSavedAmount()
      this.wishlist.sort(function(a, b) {
        var order = { high: 0, medium: 1, low: 2 }
        if (order[a.priority] !== order[b.priority]) {
          return order[a.priority] - order[b.priority]
        }
        return new Date(a.expireDate) - new Date(b.expireDate)
      })
    },
    getRemainingDays(d) {
      return DateUtil.getRemainingDays(d)
    },
    priIcon(p) {
      var icons = { high: '🔥', medium: '⭐', low: '💤' }
      return icons[p] || '💤'
    },
    priText(p) {
      var texts = { high: '高优先', medium: '中优先', low: '普通' }
      return texts[p] || '普通'
    },
    deleteWish(id) {
      var self = this
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个商品吗？',
        success: function(res) {
          if (res.confirm) {
            var w = StorageUtil.getWishlist()
            w = w.filter(function(item) { return item.id !== id })
            StorageUtil.setWishlist(w)
            self.loadWishlist()
            uni.showToast({ title: '删除成功', icon: 'success' })
          }
        }
      })
    },
    keepWish(id) {
      var self = this
      var item = this.wishlist.find(function(w) { return w.id === id })
      if (!item) return
      uni.showModal({
        title: '确认不买了',
        content: '确定不买了？将节省 ¥' + item.price.toFixed(2),
        success: function(res) {
          if (res.confirm) {
            var w = StorageUtil.getWishlist()
            w = w.filter(function(i) { return i.id !== id })
            StorageUtil.setWishlist(w)
            var sa = StorageUtil.getSavedAmount()
            StorageUtil.setSavedAmount(sa + item.price)
            self.loadWishlist()
            uni.showToast({ title: '已节省 ¥' + item.price.toFixed(2), icon: 'success' })
          }
        }
      })
    },
    markAsBought(id) {
      var self = this
      var item = this.wishlist.find(function(w) { return w.id === id })
      if (!item) return
      uni.showModal({
        title: '确认购买',
        content: '已购买 "' + item.name + '"？',
        success: function(res) {
          if (res.confirm) {
            var w = StorageUtil.getWishlist()
            w = w.filter(function(i) { return i.id !== id })
            StorageUtil.setWishlist(w)
            self.loadWishlist()
            uni.showToast({ title: '购买成功', icon: 'success' })
          }
        }
      })
    },
    extendWish(id) {
      var self = this
      uni.showModal({
        title: '延长冷静期',
        content: '再冷静7天？',
        success: function(res) {
          if (res.confirm) {
            var w = StorageUtil.getWishlist()
            var index = -1
            for (var j = 0; j < w.length; j++) {
              if (w[j].id === id) { index = j; break }
            }
            if (index !== -1) {
              var d = new Date()
              d.setDate(d.getDate() + 7)
              w[index].expireDate = DateUtil.formatDate(d)
              w[index].updatedAt = Date.now()
              StorageUtil.setWishlist(w)
              self.loadWishlist()
              uni.showToast({ title: '已延长7天', icon: 'success' })
            }
          }
        }
      })
    },
    addSavedAmount(item) {
      var self = this
      uni.showModal({
        title: '存钱',
        content: '为 "' + item.name + '" 存入多少钱？',
        editable: true,
        success: function(res) {
          if (res.confirm && res.content) {
            var a = parseFloat(res.content)
            if (isNaN(a) || a <= 0) {
              uni.showToast({ title: '请输入有效金额', icon: 'none' })
              return
            }
            var w = StorageUtil.getWishlist()
            var index = -1
            for (var j = 0; j < w.length; j++) {
              if (w[j].id === item.id) { index = j; break }
            }
            if (index !== -1) {
              if (!w[index].savedAmount) w[index].savedAmount = 0
              w[index].savedAmount += a
              w[index].updatedAt = Date.now()
              StorageUtil.setWishlist(w)
              self.loadWishlist()
              uni.showToast({ title: '存钱成功', icon: 'success' })
            }
          }
        }
      })
    },
    goToAdd() {
      uni.navigateTo({ url: '/pages/add-wish/add-wish' })
    }
  }
}
</script>

<style scoped lang="scss">
$bd:#000;$fg:#111;$ac:#eab308;$mu:#6b7280;$danger:#dc2626;

.pg{min-height:100vh;background:#fff;padding:20rpx;padding-bottom:140rpx}

/* 通用卡片 */
.nx{background:#fff;border:2px solid $bd;padding:24rpx;box-shadow:3px 3px 0 rgba(0,0,0,1)}

/* 统计卡片 */
.stat-card{margin-bottom:20rpx}
.stat-lbl{font-size:24rpx;color:$mu;text-transform:uppercase;letter-spacing:0.08em}
.stat-top{margin-bottom:12rpx}
.stat-body{display:flex;align-items:baseline;margin-bottom:20rpx}
.stat-val{font-size:80rpx;font-weight:700;color:$fg}
.stat-unit{font-size:28rpx;color:$mu;margin-left:8rpx}
.stat-foot{display:flex;align-items:center;border-top:2px solid $bd;padding-top:20rpx}
.sf-item{flex:1;display:flex;flex-direction:column;align-items:center}
.sf-lbl{font-size:22rpx;color:$mu;margin-bottom:4rpx}
.sf-val{font-size:28rpx;font-weight:600;color:$fg}
.sf-val.saved{color:#16a34a}
.sf-div{width:1rpx;height:40rpx;background:$bd;margin:0 20rpx}

/* 提醒区域 */
.alert-sec{margin-bottom:20rpx}
.alert-head{display:flex;align-items:center;padding:14rpx 0;gap:10rpx}
.alert-icon{font-size:32rpx}
.alert-title{font-size:28rpx;color:$danger;font-weight:600}
.alert-badge{font-size:22rpx;color:$danger;background:#fef2f2;border:2px solid $bd;padding:4rpx 12rpx}

/* 愿望卡片 */
.wish-card{margin-bottom:14rpx;display:flex;align-items:flex-start;box-shadow:none;transition:all .15s}
.wish-card:active{box-shadow:3px 3px 0 rgba(0,0,0,1)}
.wish-card.urgent{border-color:$danger;box-shadow:3px 3px 0 $danger}
.wish-card.anim{animation:fadeIn .4s ease-out backwards}

@keyframes fadeIn{from{opacity:0;transform:translateY(16rpx)}to{opacity:1;transform:translateY(0)}}

.wish-icon{width:72rpx;height:72rpx;display:flex;align-items:center;justify-content:center;font-size:34rpx;border:2px solid $bd;margin-right:16rpx;flex-shrink:0}
.wish-info{flex:1;min-width:0}
.wish-head{display:flex;align-items:center;margin-bottom:8rpx}
.wish-name{font-size:28rpx;color:$fg;font-weight:600}
.pri-tag{font-size:20rpx;padding:2rpx 10rpx;border:2px solid $bd;margin-left:10rpx;font-weight:500}
.pri-tag.pri-high{border-color:$danger;color:$danger}
.pri-tag.pri-medium{border-color:#eab308;color:#a16207}
.pri-tag.pri-low{border-color:#16a34a;color:#16a34a}
.wish-meta{display:flex;align-items:center;gap:14rpx}
.wish-price{font-size:26rpx;color:$fg;font-weight:600}
.wish-timer{font-size:22rpx;color:#16a34a}
.wish-timer.expire-soon{color:$danger}
.wish-timer.expired{color:$danger}

/* 存钱进度 */
.save-prog{margin-top:12rpx}
.prog-bar{height:10rpx;background:#e5e5e5;border:1px solid $bd}
.prog-fill{height:100%;background:$fg;transition:width .3s}
.prog-txt{font-size:20rpx;color:$mu;margin-top:6rpx;display:block}

/* 操作按钮 */
.wish-acts{display:flex;flex-direction:column;gap:8rpx;flex-shrink:0}
.act-btn{height:52rpx;line-height:52rpx;font-size:22rpx;padding:0 18rpx;border:2px solid $bd;box-shadow:2px 2px 0 rgba(0,0,0,1);font-weight:600;text-align:center;transition:all .1s}
.act-btn:active{box-shadow:none;transform:translate(2px,2px)}
.act-btn.pri{background:$ac;color:$fg}
.act-btn.sec{background:#fff;color:$fg}

/* 区块标题 */
.sec-h{margin-bottom:18rpx}
.sec-t{font-size:26rpx;font-weight:600;letter-spacing:0.04em;text-transform:uppercase}

/* 空状态 */
.empty-state{display:flex;flex-direction:column;align-items:center;padding:60rpx 40rpx}
.empty-icon{font-size:120rpx;margin-bottom:20rpx}
.empty-txt{font-size:28rpx;color:$fg;font-weight:500;margin-bottom:8rpx}
.empty-hint{font-size:24rpx;color:$mu;margin-bottom:32rpx}
.empty-btn{padding:20rpx 50rpx;font-size:28rpx;font-weight:600;background:$ac;cursor:pointer;transition:all .1s}
.empty-btn:active{box-shadow:none;transform:translate(3px,3px)}

/* FAB */
.fab{position:fixed;right:32rpx;bottom:140rpx;z-index:100;width:96rpx;height:96rpx;background:$ac;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);display:flex;align-items:center;justify-content:center;transition:all .1s}
.fab-t{font-size:48rpx;font-weight:700}
.fab:active{box-shadow:none;transform:translate(3px,3px)}
</style>
