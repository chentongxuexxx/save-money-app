<template>
  <view class="pg">
    <!-- 表单 -->
    <view class="nx form-card">
      <!-- 商品名称 -->
      <view class="form-row">
        <text class="label">商品名称</text>
        <input v-model="form.name" class="nx-input" placeholder="想买的商品是什么？" />
      </view>

      <!-- 期望价格 -->
      <view class="form-row">
        <text class="label">期望价格(元)</text>
        <input v-model.number="form.price" class="nx-input amt" type="digit" placeholder="心理价位是多少？" />
      </view>

      <!-- 优先级 — segmented buttons -->
      <view class="form-row">
        <text class="label">优先级</text>
        <view class="pri-opts">
          <view class="pri-cell" :class="{on:form.priority==='high'}" @click="selectPriority('high')">
            <text class="pri-icon">🔥</text>
            <text class="pri-txt">高优先</text>
          </view>
          <view class="pri-cell" :class="{on:form.priority==='medium'}" @click="selectPriority('medium')">
            <text class="pri-icon">⭐</text>
            <text class="pri-txt">中优先</text>
          </view>
          <view class="pri-cell" :class="{on:form.priority==='low'}" @click="selectPriority('low')">
            <text class="pri-icon">💤</text>
            <text class="pri-txt">普通</text>
          </view>
        </view>
      </view>

      <!-- 冷静期天数 -->
      <view class="form-row">
        <text class="label">冷静期(天)</text>
        <view class="cool-opts">
          <view v-for="day in coolingOptions" :key="day" class="cool-chip" :class="{on:form.coolingDays===day}" @click="selectDays(day)">{{ day }}天</view>
        </view>
      </view>

      <!-- 冷静期说明 -->
      <view class="form-row last">
        <view class="cool-tip">
          <text class="tip-icon">💡</text>
          <text class="tip-txt">冷静期过后，系统会提醒你重新考虑是否真的需要购买</text>
        </view>
      </view>
    </view>

    <!-- 预计到期日 -->
    <view v-if="form.coolingDays" class="expire-info">
      <text class="expire-icon">📅</text>
      <text>预计冷静期结束: {{ expireDate }}</text>
    </view>

    <!-- 保存 -->
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
      form: { name: '', price: '', priority: 'medium', coolingDays: 7 }
    }
  },
  computed: {
    expireDate() {
      if (!this.form.coolingDays) return ''
      var d = new Date()
      d.setDate(d.getDate() + this.form.coolingDays)
      return DateUtil.formatDate(d)
    }
  },
  methods: {
    selectPriority(p) {
      this.form.priority = p
    },
    selectDays(d) {
      this.form.coolingDays = d
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
      var wishlist = StorageUtil.getWishlist()
      var now = new Date()
      var expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + this.form.coolingDays)
      wishlist.push({
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
      })
      StorageUtil.setWishlist(wishlist)
      uni.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(function() { uni.navigateBack() }, 1500)
    }
  }
}
</script>

<style scoped lang="scss">
$bd:#000;$fg:#111;$ac:#eab308;$mu:#6b7280;

.pg{min-height:100vh;background:#fff;padding:30rpx}

/* 通用卡片 */
.nx{background:#fff;border:2px solid $bd;padding:24rpx;box-shadow:3px 3px 0 rgba(0,0,0,1)}

/* 表单 */
.form-card{margin-bottom:24rpx}
.form-row{padding:26rpx 0;border-bottom:1px solid rgba(0,0,0,0.08)}
.form-row.last{border-bottom:none}
.label{display:block;font-size:28rpx;color:$fg;font-weight:500;margin-bottom:18rpx}

/* 输入框 */
.nx-input{font-size:32rpx;color:$fg;padding:16rpx;background:#fff;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);width:100%;box-sizing:border-box}
.nx-input.amt{font-size:40rpx;font-weight:600}

/* 优先级 — segmented buttons */
.pri-opts{display:flex;gap:14rpx}
.pri-cell{flex:1;display:flex;flex-direction:column;align-items:center;padding:22rpx 14rpx;background:$surface;border:2px solid transparent;transition:all .15s;cursor:pointer}
.pri-cell.on{background:#fefce8;border-color:$bd;box-shadow:2px 2px 0 $bd}
.pri-icon{font-size:40rpx;margin-bottom:6rpx}
.pri-txt{font-size:24rpx;color:$mu}
.pri-cell.on .pri-txt{color:$fg;font-weight:600}

/* 冷静期 — chip 选择 */
.cool-opts{display:flex;flex-wrap:wrap;gap:14rpx}
.cool-chip{padding:14rpx 26rpx;background:#fff;border:2px solid $bd;box-shadow:2px 2px 0 $bd;font-size:26rpx;color:$fg;font-weight:500;transition:all .1s;cursor:pointer}
.cool-chip:active{box-shadow:none;transform:translate(2px,2px)}
.cool-chip.on{background:$ac}

/* 提示 */
.cool-tip{display:flex;align-items:flex-start;padding:18rpx;background:$surface;border:2px solid $bd;gap:10rpx}
.tip-icon{font-size:26rpx}
.tip-txt{font-size:24rpx;color:$mu;line-height:1.5}

/* 到期信息 */
.expire-info{display:flex;align-items:center;justify-content:center;padding:20rpx;margin-bottom:30rpx;background:#fff;border:2px solid $bd;gap:10rpx;font-size:26rpx;color:$fg}
.expire-icon{font-size:30rpx}

/* 保存按钮 */
.save-btn{margin-top:8rpx;height:96rpx;line-height:96rpx;font-size:32rpx;font-weight:600;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);background:$ac;color:$fg;transition:all .1s;border-radius:0}
.save-btn:active{box-shadow:none;transform:translate(3px,3px)}
</style>
