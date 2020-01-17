import request from '../../utils/request'
import '../../utils/dayjs.zh-cn'
import dayjs from '../../utils/dayjs'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    info: {}
  },

  async take() {
    const { patientId, reservationId, fee, dateTime } = this.data.info
    try {
      await request.post(`/internet/api/reservation/getTakeReservation`, { patientId, reservationId, dateTime, fee })

      wx.showModal({
        title: '挂号成功！',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: `/pages/register/detail?reservationId=${reservationId}&status=3`
          })
        }
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none'
      })
    }
  },

  /**
   *  当日挂号
   */
  takeReserv() {
    wx.showModal({
      showCancel: false,
      content: `线上排号前请务必确认能在${dayjs(this.data.info.datetime).format('HH:mm')}前到达，避免爽约。`,
      success: res => {
        res.confirm && this.take()
      }
    })
  },

  async getDetail(reservationId, patientId) {
    try {
      const [info] = await request.get(`/internet/api/reservation/getReservationDetails`, {
        reservationId,
        patientId,
        status: 1
      })
      this.setData({ info })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none'
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getDetail(options.reservationId, options.patientId)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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
