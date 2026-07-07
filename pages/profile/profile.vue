<template>
  <view class="pg">
    <!-- 用户头部 — 品牌黄纯色 -->
    <view class="user-head">
      <view class="user-avatar">
        <text class="av-icon">👤</text>
      </view>
      <view class="user-info">
        <text class="user-name">点击登录</text>
        <text class="user-tip">登录后同步数据</text>
      </view>
      <view class="login-btn" @click="login"><text>登录</text></view>
    </view>

    <!-- 统计 — 白底黑边框卡片 -->
    <view class="nx stats-card">
      <view class="st-item">
        <text class="st-val">{{ stats.assetCount }}</text>
        <text class="st-lbl">资产</text>
      </view>
      <view class="st-div"></view>
      <view class="st-item">
        <text class="st-val">{{ stats.expenseCount }}</text>
        <text class="st-lbl">记账</text>
      </view>
      <view class="st-div"></view>
      <view class="st-item">
        <text class="st-val">{{ stats.wishCount }}</text>
        <text class="st-lbl">愿望</text>
      </view>
      <view class="st-div"></view>
      <view class="st-item">
        <text class="st-val">¥{{ stats.savedAmount }}</text>
        <text class="st-lbl">已省</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-sec">
      <text class="sec-lbl">功能管理</text>
      <view class="nx menu-list">
        <view class="menu-item" @click="setBudget">
          <view class="menu-left">
            <text class="menu-icon">💰</text>
            <text class="menu-txt">预算设置</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="exportData">
          <view class="menu-left">
            <text class="menu-icon">📤</text>
            <text class="menu-txt">数据导出</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="importData">
          <view class="menu-left">
            <text class="menu-icon">📥</text>
            <text class="menu-txt">数据导入</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 其他 -->
    <view class="menu-sec">
      <text class="sec-lbl">其他</text>
      <view class="nx menu-list">
        <view class="menu-item" @click="showAbout">
          <view class="menu-left">
            <text class="menu-icon">ℹ️</text>
            <text class="menu-txt">关于</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="clearData">
          <view class="menu-left">
            <text class="menu-icon">🗑️</text>
            <text class="menu-txt">清空数据</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 版本 -->
    <view class="version">
      <text>省钱小助手 v1.0.0</text>
    </view>
  </view>
</template>

<script>
import StorageUtil from '@/utils/storage.js'

export default {
  data() {
    return {
      userInfo: null,
      stats: { assetCount: 0, expenseCount: 0, wishCount: 0, savedAmount: 0 }
    }
  },
  onShow() {
    this.loadStats()
  },
  methods: {
    loadStats() {
      var a = StorageUtil.getAssets()
      var e = StorageUtil.getExpenses()
      var w = StorageUtil.getWishlist()
      var s = StorageUtil.getSavedAmount()
      this.stats = {
        assetCount: a.length,
        expenseCount: e.length,
        wishCount: w.filter(function(i) { return i.status === 'pending' }).length,
        savedAmount: s.toFixed(0)
      }
    },
    login() {
      uni.showToast({ title: '微信登录开发中', icon: 'none' })
    },
    setBudget() {
      uni.showModal({
        title: '设置月度预算',
        placeholderText: '请输入预算金额',
        editable: true,
        success: function(res) {
          if (res.confirm && res.content) {
            var a = parseFloat(res.content)
            if (isNaN(a) || a <= 0) {
              uni.showToast({ title: '请输入有效金额', icon: 'none' })
              return
            }
            StorageUtil.setBudget({ monthly: a, isSet: true })
            uni.showToast({ title: '预算设置成功', icon: 'success' })
          }
        }
      })
    },
    exportData() {
      var d = StorageUtil.exportData()
      var j = JSON.stringify(d, null, 2)
      uni.showModal({
        title: '导出数据',
        content: '数据已准备好，是否复制到剪贴板？',
        success: function(res) {
          if (res.confirm) {
            uni.setClipboardData({
              data: j,
              success: function() {
                uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
    },
    importData() {
      var self = this
      uni.showModal({
        title: '导入数据',
        content: '请在文本框中粘贴JSON数据',
        placeholderText: '粘贴JSON数据',
        editable: true,
        success: function(res) {
          if (res.confirm && res.content) {
            try {
              var d = JSON.parse(res.content)
              StorageUtil.importData(d)
              uni.showToast({ title: '导入成功', icon: 'success' })
              self.loadStats()
            } catch (e) {
              uni.showToast({ title: '数据格式错误', icon: 'none' })
            }
          }
        }
      })
    },
    showAbout() {
      uni.showModal({
        title: '关于',
        content: '省钱小助手 v1.0.0\n一款帮你省钱的资产记账软件',
        showCancel: false
      })
    },
    clearData() {
      uni.showModal({
        title: '清空数据',
        content: '确定要清空所有数据吗？此操作不可恢复！',
        success: function(res) {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.reLaunch({ url: '/pages/home/home' })
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
$bd:#000;$fg:#111;$ac:#eab308;$mu:#6b7280;

.pg{min-height:100vh;background:#fff;padding-bottom:40rpx}

/* 通用卡片 */
.nx{background:#fff;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1)}

/* 用户头部 — 品牌黄纯色 */
.user-head{display:flex;align-items:center;padding:40rpx 32rpx;background:$ac;border-bottom:2px solid $bd}
.user-avatar{width:120rpx;height:120rpx;background:#fff;border:2px solid $bd;display:flex;align-items:center;justify-content:center}
.av-icon{font-size:60rpx}
.user-info{flex:1;margin-left:24rpx}
.user-name{display:block;font-size:36rpx;font-weight:600;color:$fg}
.user-tip{display:block;font-size:24rpx;color:$mu;margin-top:8rpx}
.login-btn{padding:14rpx 28rpx;background:#fff;border:2px solid $bd;box-shadow:2px 2px 0 $bd;font-size:26rpx;color:$fg;font-weight:600;transition:all .1s}
.login-btn:active{box-shadow:none;transform:translate(2px,2px)}

/* 统计卡片 */
.stats-card{display:flex;align-items:center;margin:-30rpx 24rpx 24rpx;padding:32rpx 24rpx}
.st-item{flex:1;display:flex;flex-direction:column;align-items:center}
.st-val{font-size:36rpx;font-weight:700;color:$fg}
.st-lbl{font-size:22rpx;color:$mu;margin-top:8rpx}
.st-div{width:1rpx;height:50rpx;background:#e5e5e5}

/* 菜单 */
.menu-sec{margin:0 24rpx 24rpx}
.sec-lbl{font-size:26rpx;color:$mu;margin-bottom:14rpx;padding-left:4rpx;display:block}
.menu-list{overflow:hidden}
.menu-item{display:flex;align-items:center;justify-content:space-between;padding:28rpx 24rpx;border-bottom:1px solid rgba(0,0,0,0.06);transition:background .15s}
.menu-item:last-child{border-bottom:none}
.menu-item:active{background:rgba(0,0,0,0.03)}
.menu-left{display:flex;align-items:center;gap:18rpx}
.menu-icon{font-size:38rpx}
.menu-txt{font-size:28rpx;color:$fg}
.menu-arrow{font-size:30rpx;color:$mu}

/* 版本 */
.version{text-align:center;padding:40rpx;font-size:24rpx;color:$mu}
</style>
