// pages/payment/order.js
import request from '../../utils/request'
import payment from '../../utils/payment'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeNames: []
  },
  openDialog() {
    this.setData({ showItems: true })
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail
    })
  },

  async toPay() {
    try {
      const billReqs = [{ billType: this.data.billType, billNums: this.data.billNums }]

      this.setData({ loading: true })

      await payment({ billReqs: billReqs, ...this.data })

      wx.showModal({
        title: '缴费成功！',
        showCancel: false,
        success(res) {
          res.confirm && wx.redirectTo({ url: '/pages/payment/index' })
        }
      })
    } catch (error) {
      this.setData({ loading: false })

      error &&
        wx.showToast({
          title: error.message,
          icon: 'none',
          duration: 2000
        })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { openId, unionId, patientSelected } = getApp().globalData
    this.setData({
      openId: openId,
      unionId: unionId,
      patientSelected: patientSelected,
      ...options
    })
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
      const result = await request.get(`/internet/api/payment/getOutPatientBillDetail`, {
        patientId: this.data.patientSelected.hisPatientId,
        outpatientNum: this.data.outpatientNum,
        billNums: this.data.billNums,
        billType: this.data.billType
      })

      this.setData({
        ...result,
        feeText: `¥ ${result.fee || 0}`
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
