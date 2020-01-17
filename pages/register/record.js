// pages/register/record.js
import dayjs from '../../utils/dayjs'
import '../../utils/dayjs.zh-cn'
import request from '../../utils/request'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  cardChange(event) {
    this.setData({ patientSelected: event.detail })
    this.onShow()
  },

  async list() {
    try {
      const data = await request.get(`/internet/api/reservation/getReservationDetails`, {
        patientId: this.data.patientSelected.hisPatientId
      })

      const list = (data.constructor === Object && [data]) || data
      list.map(item => {
        const datetime = dayjs(item.dateTime.replace(/\.\d$/, '').replace(/\-/g, '/')).locale('zh-cn')
        item.dateTime = item.dateTime.replace(/\.\d$/, '').replace(/\-/g, '/')
        item.appointText = `(星期${datetime.format('dd')}）${datetime.format('YYYY-MM-DD HH:mm:ss')}`
        item.costText = (item.cost / 100).toFixed(2)
      })

      // let temp = list.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      // temp = temp.sort((a, b) => parseInt(a.Type) - parseInt(b.Type))
      this.setData({
        list: list
      })
    } catch (error) {
      throw error
    }
  },

  goto(event) {
    const { reservationId, status } = event.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/register/detail?reservationId=${reservationId}&status=${status}`
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ patientSelected: getApp().globalData.patientSelected })
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
      this.setData({ loaded: false })

      await this.list()
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({
        loaded: true
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
