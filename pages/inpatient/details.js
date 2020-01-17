// pages/inpatient/details.js
import dayjs from '../../utils/dayjs'
import '../../utils/dayjs.zh-cn'
import request from '../../utils/request'

Page({
  /**
   * Page initial data
   */
  data: {
    popupShow: false,
    info: null,
    isInHospital: '1' // 1：住院  0：出院
  },

  setCurrentDate(current) {
    this.setData(
      {
        currentDate: current.valueOf(),
        currentDateText: current.locale('zh-cn').format('YYYY年M月D日 ddd')
      },
      () => this.getDetail(dayjs(current).format('YYYY-MM-DD'))
    )
  },

  stepDay(event) {
    this.setCurrentDate(dayjs(this.data.currentDate).add(event.currentTarget.dataset.step, 'day'))
  },

  selectDay() {
    this.setData({ popupShow: true })
  },

  onPicker(event) {
    this.setCurrentDate(dayjs(event.detail))
    this.popupClose()
  },

  popupClose() {
    this.setData({ popupShow: false })
  },

  async getInpatientDailyBill(date) {
    try {
      const result = await request.get(`/internet/api/hospitalization/getInpatientDailyBill`, {
        patientId: this.data.patientSelected.hisPatientId,
        startDate: date,
        endDate: date
      })
      this.setData({ info: result })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },

  async getInpatientCollectionBill() {
    try {
      const result = await request.get(`/internet//api/hospitalization/getInpatientCollectionBill`, {
        patientId: this.data.patientSelected.hisPatientId,
        visitNum: this.data.visitNum
      })
      this.setData({ info: result })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },

  async getDetail(date = dayjs().format('YYYY-MM-DD')) {
    /* 住院显示日清单，出院显示总清单 */
    this.data.isInHospital === '1' ? this.getInpatientDailyBill(date) : this.getInpatientCollectionBill()
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(options) {
    const patientSelected = getApp().globalData.patientSelected
    const current = dayjs()
    const { isInHospital, visitNum } = options
    this.setData({
      patientSelected: patientSelected,
      minDate: current.subtract(1, 'month').valueOf(),
      today: new Date().setHours(0, 0, 0, 0).valueOf(),
      isInHospital,
      visitNum
    })
    wx.setNavigationBarTitle({
      title: isInHospital === '1' ? '日清单' : '汇总清单'
    })
    this.setCurrentDate(current)
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
      await this.getDetail()
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
