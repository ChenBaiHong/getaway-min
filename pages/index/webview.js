// pages/index/webview.js
import request from '../../utils/request'

Page({
  /**
   * Page initial data
   */
  data: {
    src: ''
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(option) {
    const title = decodeURIComponent(option.title)
    const url = decodeURIComponent(option.url)
    this.setData({
      src: url + ((/\?/.test(url) && '&') || '?') + 't=' + new Date().valueOf()
    })
    wx.setNavigationBarTitle({ title })

    try {
      // 市健康卡 - healthCard
      // 检查预约 - checkOrder
      // 云影像 - imageItem
      if (option.module) {
        await request.get(`/internet/api/common/statistics`, { module: option.module })
      }
    } catch (error) {}
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {},

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {},

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {},

  /**
   * Lifecycle function--Called when page unload
   */
  async onUnload() {
    if (new RegExp(getApp().globalData.cardHostName + '/(list|add|detail)').test(this.data.src)) {
      await getApp().getPatients({ reload: true })
    }
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {},

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {},

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {}
})
