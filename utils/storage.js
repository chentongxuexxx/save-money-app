// 存储工具类 - 省钱小助手
const StorageUtil = {
  // ========== 资产相关 ==========
  getAssets() {
    return uni.getStorageSync('assets') || []
  },

  setAssets(assets) {
    uni.setStorageSync('assets', assets)
  },

  // ========== 支出相关 ==========
  getExpenses() {
    return uni.getStorageSync('expenses') || []
  },

  setExpenses(expenses) {
    uni.setStorageSync('expenses', expenses)
  },

  // ========== 收入相关 ==========
  getIncomes() {
    return uni.getStorageSync('incomes') || []
  },

  setIncomes(incomes) {
    uni.setStorageSync('incomes', incomes)
  },

  // ========== 想买清单 ==========
  getWishlist() {
    return uni.getStorageSync('wishlist') || []
  },

  setWishlist(wishlist) {
    uni.setStorageSync('wishlist', wishlist)
  },

  // ========== 预算相关 ==========
  getBudget() {
    return uni.getStorageSync('budget') || { monthly: 3000, isSet: false }
  },

  setBudget(budget) {
    uni.setStorageSync('budget', budget)
  },

  // ========== 省钱统计 ==========
  getSavedAmount() {
    return uni.getStorageSync('savedAmount') || 0
  },

  setSavedAmount(amount) {
    uni.setStorageSync('savedAmount', amount)
  },

  // ========== 用户信息 ==========
  getUserInfo() {
    return uni.getStorageSync('userInfo') || null
  },

  setUserInfo(userInfo) {
    uni.setStorageSync('userInfo', userInfo)
  },

  // ========== 数据导出 ==========
  exportData() {
    return {
      assets: this.getAssets(),
      expenses: this.getExpenses(),
      incomes: this.getIncomes(),
      wishlist: this.getWishlist(),
      budget: this.getBudget(),
      savedAmount: this.getSavedAmount(),
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
  },

  // ========== 数据导入 ==========
  importData(data) {
    if (data.assets) this.setAssets(data.assets)
    if (data.expenses) this.setExpenses(data.expenses)
    if (data.incomes) this.setIncomes(data.incomes)
    if (data.wishlist) this.setWishlist(data.wishlist)
    if (data.budget) this.setBudget(data.budget)
    if (data.savedAmount) this.setSavedAmount(data.savedAmount)
  },

  // ========== 工具方法 ==========
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // 清空所有数据
  clearAll() {
    uni.clearStorageSync()
  }
}

export default StorageUtil
