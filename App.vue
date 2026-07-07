<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    this.initStorage()
  },
  methods: {
    initStorage() {
      if (!uni.getStorageSync('assets')) { uni.setStorageSync('assets', []) }
      if (!uni.getStorageSync('expenses')) { uni.setStorageSync('expenses', []) }
      if (!uni.getStorageSync('wishlist')) { uni.setStorageSync('wishlist', []) }
      if (!uni.getStorageSync('savedAmount')) { uni.setStorageSync('savedAmount', 0) }
      if (!uni.getStorageSync('budget')) { uni.setStorageSync('budget', { monthly: 3000, isSet: false }) }
      if (!uni.getStorageSync('incomes')) { uni.setStorageSync('incomes', []) }
      if (!uni.getStorageSync('userInfo')) { uni.setStorageSync('userInfo', null) }
    }
  }
}
</script>

<style lang="scss">
page {
  background: #ffffff;
  color: #111111;
  font-size: 28rpx;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>
