import request from '../../utils/request'

Page({
  /**
   * Page initial data
   */
  data: {
    doctorInfo: {},
    // 选择排班的日期
    schedule: {},
    // 号源列表
    source: [],
    //号源选择
    radio: '',

    //是否收起号源
    isRetract: true,
    currentIndex: 3,
    selectSouce: {}, //选择号源的信息
    date: '',
    amPm: '',
    info: {},
    disabled: false
  },

  /**
   * 改变就诊人
   */
  cardChange(event) {
    this.setData({ patientSelected: event.detail })
  },
  /**
   * 选择号源
   */
  onClick(event) {
    const { index, item } = event.currentTarget.dataset
    if (this.data.source.length >= 4) {
      if (index < 3) {
        this.setData({
          radio: item.reservationId,
          selectSouce: item
        })
        return
      }
      this.setData({
        radio: item.reservationId,
        isRetract: true,
        currentIndex: index,
        selectSouce: item
      })
    } else {
      this.setData({
        radio: item.reservationId,
        selectSouce: item
      })
    }
  },

  /**
   * 当日挂号
   */
  async getTakeReservation() {
    const { radio, selectSouce, patientSelected } = this.data
    try {
      await request.post(`/internet/api/reservation/getTakeReservation`, {
        patientId: patientSelected.hisPatientId, //病人id
        reservationId: radio, //号源id
        dateTime: selectSouce.dateTime,
        fee: selectSouce.fee
      })
      wx.showModal({
        title: '挂号成功！',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: `/pages/register/detail?reservationId=${this.data.radio}&status=3`
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
   * 预约挂号
   */
  async confirmReservation() {
    this.setData({
      disabled: true
    })
    const { radio, selectSouce, patientSelected, doctorInfo } = this.data
    try {
      await request.post(`/internet/api/reservation/confirmOrCancel`, {
        patientId: patientSelected.hisPatientId, //病人id
        unionId: this.data.unionId,
        hospId: doctorInfo.hospId,
        deptId: doctorInfo.deptId,
        docId: doctorInfo.docId,
        reservationId: radio, //号源id
        dateTime: selectSouce.dateTime,
        fee: selectSouce.fee,
        reservationOperate: 'CONFIRM'
      })
      wx.showModal({
        title: '预约成功！',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: `/pages/register/detail?reservationId=${this.data.radio}&status=${this.data.isToday ? '3' : '1'}`
          })
        }
      })
    } catch (error) {
      if (error.code === 10000009) {
        return wx.showModal({
          title: '余额不足',
          content: '就诊卡内余额需大于诊查费才能当日挂号,请充值后再重试',
          success: res =>
            res.confirm &&
            wx.navigateTo({
              url: '/pages/recharge/index?type=mz'
            })
        })
      }
      wx.showToast({
        title: error.message,
        icon: 'none'
      })
    } finally {
      this.setData({
        disabled: false
      })
    }
  },

  /**
   * 确认
   */
  submit() {
    if (!this.data.radio) {
      return wx.showToast({
        title: '请选择时间段',
        icon: 'none'
      })
    }
    this.confirmReservation()
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
   * 收起展开号源
   */
  retractSource() {
    this.setData({
      isRetract: !this.data.isRetract
    })
  },

  /**
   * 判断是否是当日
   */
  isToday() {
    const nowDate = new Date()
    const selectDate = new Date(this.data.date.replace(/\.\d$/, '').replace(/\-/g, '/'))
    if (nowDate.setHours(0, 0, 0, 0) === selectDate.setHours(0, 0, 0, 0)) {
      this.setData({
        isToday: true
      })
    } else {
      this.setData({
        isToday: false
      })
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const { unionId, patientSelected } = getApp().globalData
    const { date, amPm, info } = options
    this.setData({
      unionId,
      date,
      amPm,
      info: JSON.parse(info),
      patientSelected: patientSelected
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {},

  /**
   * Lifecycle function--Called when page show
   */
  async onShow() {
    try {
      this.getDoctorInfo()

      const source = await request.get(`/internet/api/reservation/getReservationInfos`, {
        date: this.data.date,
        amPm: this.data.amPm,
        docId: this.data.info.docId
      })
      this.setData({ source })
      this.isToday()
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },

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
