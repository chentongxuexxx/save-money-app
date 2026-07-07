<template>
  <view class="tab-bar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      :class="{ active: selected === index }"
      @click="switchTab(index)"
    >
      <text class="tab-icon">{{ item.icon }}</text>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    selected: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tabList: [
        { pagePath: '/pages/home/home', text: '首页', icon: '🏠' },
        { pagePath: '/pages/assets/assets', text: '资产', icon: '📦' },
        { pagePath: '/pages/expense/expense', text: '记账', icon: '💸' },
        { pagePath: '/pages/wishlist/wishlist', text: '想买', icon: '🛒' }
      ]
    }
  },
  methods: {
    switchTab(index) {
      if (this.selected === index) return
      uni.switchTab({ url: this.tabList[index].pagePath })
    }
  }
}
</script>

<style scoped lang="scss">
$bd: #000;
$fg: #111;
$ac: #eab308;

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-top: 2px solid $bd;
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  background: #fff;
  border-right: 2px solid $bd;
  transition: all 0.1s;
  cursor: pointer;

  &:last-child {
    border-right: none;
  }

  /* Active — 黄色填充 + d2 硬阴影 */
  &.active {
    background: $ac;
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
    position: relative;
    z-index: 1;
  }
}

.tab-icon {
  font-size: 32rpx;
  line-height: 1.2;
}

.tab-text {
  font-size: 22rpx;
  font-weight: 700;
  color: $fg;
  line-height: 1.2;
}
</style>
