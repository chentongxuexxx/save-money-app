<template>
  <view class="pg">
    <!-- 表单 -->
    <view class="nx form-card">
      <!-- 资产名称 -->
      <view class="form-row">
        <text class="label">资产名称</text>
        <input v-model="form.name" class="nx-input" placeholder="请输入资产名称" />
      </view>

      <!-- 分类 -->
      <view class="form-row">
        <text class="label">分类</text>
        <view class="cat-grid">
          <view v-for="item in categories" :key="item" class="cat-cell" :class="{on:form.category===item}" @click="selectCategory(item)">
            <text class="cat-icon">{{ categoryIcons[item] }}</text>
            <text class="cat-name">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 购买日期 -->
      <view class="form-row">
        <text class="label">购买日期</text>
        <picker mode="date" :value="form.purchaseDate" @change="onDateChange">
          <view class="picker-row">
            <text>{{ form.purchaseDate || '请选择日期' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 购买价格 -->
      <view class="form-row">
        <text class="label">购买价格(元)</text>
        <input v-model.number="form.price" class="nx-input amt" type="digit" placeholder="请输入购买价格" />
      </view>

      <!-- 当前估值 -->
      <view class="form-row">
        <text class="label">当前估值(元)</text>
        <input v-model.number="form.currentValue" class="nx-input amt" type="digit" placeholder="默认等于购买价格" />
      </view>

      <!-- 备注 -->
      <view class="form-row last">
        <text class="label">备注</text>
        <textarea v-model="form.notes" class="textarea" placeholder="请输入备注信息" auto-height />
      </view>
    </view>

    <!-- 已用时间 -->
    <view v-if="form.purchaseDate" class="used-info">
      <text class="used-icon">⏱️</text>
      <text class="used-txt">已使用: {{ usedTime }}</text>
    </view>

    <!-- 按钮 -->
    <view class="btn-group">
      <button v-if="isEdit" class="btn delete-btn" @click="deleteAsset">删除</button>
      <button class="btn save-btn" @click="saveAsset">{{ isEdit?'保存修改':'添加资产' }}</button>
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
      categoryIcons: { '电子产品': '📱', '家具': '🪑', '服装': '👕', '厨具': '🍳', '书籍': '📚', '运动器材': '⚽', '其他': '📦' },
      form: { name: '', category: '', purchaseDate: '', price: '', currentValue: '', notes: '' }
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
      var assets = StorageUtil.getAssets()
      var item = null
      for (var j = 0; j < assets.length; j++) {
        if (assets[j].id === this.id) { item = assets[j]; break }
      }
      if (item) {
        this.form = {
          name: item.name,
          category: item.category,
          purchaseDate: item.purchaseDate,
          price: item.price,
          currentValue: item.currentValue,
          notes: item.notes || ''
        }
      }
    },
    selectCategory(c) {
      this.form.category = c
    },
    onDateChange(e) {
      this.form.purchaseDate = e.detail.value
    },
    saveAsset() {
      if (!this.form.name) { uni.showToast({ title: '请输入资产名称', icon: 'none' }); return }
      if (!this.form.category) { uni.showToast({ title: '请选择分类', icon: 'none' }); return }
      if (!this.form.purchaseDate) { uni.showToast({ title: '请选择购买日期', icon: 'none' }); return }
      if (!this.form.price) { uni.showToast({ title: '请输入购买价格', icon: 'none' }); return }
      var assets = StorageUtil.getAssets()
      var n = Date.now()
      if (!this.form.currentValue) { this.form.currentValue = this.form.price }
      if (this.isEdit) {
        var idx = -1
        for (var j = 0; j < assets.length; j++) {
          if (assets[j].id === this.id) { idx = j; break }
        }
        if (idx !== -1) {
          this.form.updatedAt = n
          var updated = {
            id: assets[idx].id,
            name: this.form.name,
            category: this.form.category,
            purchaseDate: this.form.purchaseDate,
            price: this.form.price,
            currentValue: this.form.currentValue,
            notes: this.form.notes,
            createdAt: assets[idx].createdAt,
            updatedAt: n
          }
          assets[idx] = updated
        }
      } else {
        assets.push({
          id: StorageUtil.generateId(),
          name: this.form.name,
          category: this.form.category,
          purchaseDate: this.form.purchaseDate,
          price: this.form.price,
          currentValue: this.form.currentValue,
          notes: this.form.notes,
          createdAt: n,
          updatedAt: n
        })
      }
      StorageUtil.setAssets(assets)
      uni.showToast({ title: this.isEdit ? '保存成功' : '添加成功', icon: 'success' })
      setTimeout(function() { uni.navigateBack() }, 1500)
    },
    deleteAsset() {
      var self = this
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个资产吗？',
        success: function(res) {
          if (res.confirm) {
            var assets = StorageUtil.getAssets()
            assets = assets.filter(function(i) { return i.id !== self.id })
            StorageUtil.setAssets(assets)
            uni.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(function() { uni.navigateBack() }, 1500)
          }
        }
      })
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

/* 输入框 — 2px 黑边框 + d2 阴影 */
.nx-input{font-size:30rpx;color:$fg;padding:16rpx;background:#fff;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);width:100%;box-sizing:border-box}
.nx-input.amt{font-size:36rpx;font-weight:600}

/* 分类网格 */
.cat-grid{display:flex;flex-wrap:wrap;gap:14rpx}
.cat-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;width:120rpx;height:100rpx;background:$surface;border:2px solid transparent;transition:all .15s;cursor:pointer}
.cat-cell.on{background:#fefce8;border-color:$bd;box-shadow:2px 2px 0 $bd}
.cat-icon{font-size:36rpx;margin-bottom:4rpx}
.cat-name{font-size:22rpx;color:$mu}
.cat-cell.on .cat-name{color:$fg;font-weight:500}

/* 日期 */
.picker-row{display:flex;justify-content:space-between;align-items:center;font-size:30rpx;color:$fg;padding:14rpx 0}
.arrow{color:$mu;font-size:34rpx}

/* 备注 */
.textarea{font-size:28rpx;color:$fg;width:100%;min-height:100rpx;padding:20rpx;background:$surface;border:2px solid $bd;box-sizing:border-box}

/* 已用时间 */
.used-info{display:flex;align-items:center;justify-content:center;padding:20rpx;margin-bottom:30rpx;background:#fff;border:2px solid $bd;gap:10rpx}
.used-icon{font-size:30rpx}
.used-txt{color:$fg;font-size:28rpx;font-weight:500}

/* 按钮 */
.btn-group{margin-top:8rpx;display:flex;gap:18rpx}
.btn{flex:1;height:96rpx;line-height:96rpx;font-size:32rpx;font-weight:600;border:2px solid $bd;box-shadow:3px 3px 0 rgba(0,0,0,1);transition:all .1s;border-radius:0}
.btn:active{box-shadow:none;transform:translate(3px,3px)}
.save-btn{background:$ac;color:$fg}
.delete-btn{background:#fff;color:#dc2626}
</style>
