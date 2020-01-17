// pages/register/index.js
import request from '../../utils/request'

Page({
  /**
   * Page initial data
   */
  data: {
    hospList: []
  },

  /**
   * 跳转到科室列表
   */
  toDepartment(e) {
    const hosp = e.currentTarget.dataset.hosp
    wx.navigateTo({
      url: `/pages/register/department?hospId=${hosp.hospId}`
    })
    wx.setStorageSync('hosp', hosp)
  },

  /**
   * 拨打电话
   */
  tell(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(options) {
    //获取医院列表
    const hospList = await request.get(`/internet/api/reservation/getHospInfos`)
    this.setData({ hospList })
    wx.setStorageSync('hospList', hospList)
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {},

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {},

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {},

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {},

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
