// pages/register/doctor.js
import request from '../../utils/request'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    doctorInfo: {},
    scheduleInfo: {},
    dates: []
  },

  goto(event) {
    const { info, date, amPm } = event.currentTarget.dataset
    if (info.reservationInfo === 2) {
      if (info.remainingReservation !== '0') {
        wx.navigateTo({
          url: `/pages/register/confirm?info=${JSON.stringify(info)}&date=${date}&amPm=${amPm}`
        })
      }
    }
  },

  /**
   * 获取医生信息
   */
  getDoctorInfo() {
    this.setData({
      doctorInfo: {
        ...wx.getStorageSync('hosp'),
        ...wx.getStorageSync('dept'),
        ...wx.getStorageSync('doctor')
      }
    })
  },

  /**
   * 获取医生排班
   */
  async getData(docId, deptId) {
    try {
      const data = await request.get(`/internet/api/reservation/getDocScheduleByDocId`, {
        docId,
        deptId
      })
      //1.格式化日期
      let temp = []
      let datas = Object.keys(data)
      datas.forEach(item => {
        const $date = new Date(item)
        const month = ($date.getMonth() + 1).toString().replace(/^(\d)$/, '0$1')
        temp.push({
          key: `${$date.getFullYear()}-${month}-${this.appendzero($date.getDate())}`,
          less: `${month}/${$date.getDate()}`,
          week: {
            0: '周日',
            1: '周一',
            2: '周二',
            3: '周三',
            4: '周四',
            5: '周五',
            6: '周六'
          }[$date.getDay()]
        })
      })
      this.setData({
        dates: temp,
        scheduleList: Object.keys(data).length === 0 ? [] : data
      })
    } catch (error) {
      this.setData({ scheduleList: [] })
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },

  appendzero(num) {
    if (num < 10) return '0' + '' + num
    else return num
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getDoctorInfo()
    this.getData(options.docId, options.deptId)
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
