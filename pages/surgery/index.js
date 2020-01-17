// pages/surgery/index.js
import request from '../../utils/request'
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  cardChange(event) {
    this.setData({ patientSelected: event.detail })
    this.onShow()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    const { patientSelected } = getApp().globalData
    this.setData({ patientSelected: patientSelected })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    try {
      const { hisPatientId } = this.data.patientSelected
      const result = await request.get(`/internet/api/operation/getOperationList?patientId=${hisPatientId}`)
      result.map(value => {
        value['operationDate'] = value['operationDate'].slice(0, 10)
      })
      this.setData({
        list: result
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
})
