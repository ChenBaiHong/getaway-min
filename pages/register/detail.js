import dayjs from '../../utils/dayjs'
import '../../utils/dayjs.zh-cn'
import request from '../../utils/request'

Page({
  /**
   * Page initial data
   */
  data: {
    info: {},
    status: '',
    isGreaterToday: false,
    disabled: false
  },

  /**
   * 取消预约
   */
  async cancel() {
    try {
      this.setData({ disabled: true })
      const { patientSelected, info } = this.data
      await new Promise((resolve, reject) =>
        wx.showModal({
          title: '确定要取消该预约吗？',
          content: '取消后不可恢复！',
          success(res) {
            res.confirm && resolve()
            res.cancel && reject()
          }
        })
      )

      await request.post(`/internet/api/reservation/confirmOrCancel`, {
        patientId: patientSelected.hisPatientId, //病人id
        unionId: this.data.unionId,
        hospId: info.hospId,
        deptId: info.deptId,
        docId: info.docId,
        reservationId: info.reservationId, //号源id
        dateTime: info.dateTime,
        fee: info.fee,
        reservationOperate: 'CANCEL'
      })

      wx.showModal({
        title: '提示',
        content: '取消成功',
        success: res => {
          if (res.confirm) {
            let info = this.data.info
            info.statusStr = '取消预约'
            info.status = 2
            this.setData({ info })
          }
        }
      })
    } catch (error) {
      error &&
        wx.showToast({
          title: error.message,
          icon: 'none'
        })
    } finally {
      this.setData({ disabled: false })
    }
  },
  /**
   *  获取病人信息(改)
   */
  async getDetail() {
    try {
      const [data] = await request.get(`/internet/api/reservation/getReservationDetails`, {
        reservationId: this.data.reservationId,
        patientId: this.data.patientSelected.hisPatientId,
        status: this.data.status
      })
      this.isGreaterToday(data.dateTime)
      this.isToday(data.dateTime)
      this.setData({ info: data })
    } catch (error) {
      throw error
    }
  },

  /**
   * 判断是否超过当日
   */
  isGreaterToday(date) {
    const nowDate = new Date().valueOf()
    const selectDate = new Date(date.replace(/\-/g, '/')).valueOf()
    if (nowDate < selectDate) {
      this.setData({
        isGreaterToday: true
      })
    } else {
      this.setData({
        isGreaterToday: false
      })
    }
  },

  /**
   * 判断是否是当日
   */
  isToday(date) {
    const nowDate = new Date()
    const selectDate = new Date(date.replace(/\.\d$/, '').replace(/\-/g, '/'))
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
   *  当日取号接口
   */
  async take() {
    const { patientId, reservationId, fee, dateTime } = this.data.info
    try {
      this.setData({ disabled: true })
      await request.post(`/internet/api/reservation/getTakeReservation`, { patientId, reservationId, dateTime, fee })
      wx.showModal({
        title: '挂号成功！',
        showCancel: false,
        success: res => {
          if (!res.confirm) return
          let info = this.data.info
          info.statusStr = '取号成功'
          info.status = 3
          this.setData({ info })
        }
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none'
      })
    } finally {
      this.setData({ disabled: false })
    }
  },

  /**
   *  当日取号
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

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(options) {
    try {
      const { unionId, patientSelected } = getApp().globalData
      const { status, reservationId } = options
      const idCardReg = /(\d{2})(\d+)(\w{3})/
      const mobileReg = /(\d{3})(\d+)(\w{3})/
      patientSelected.idcardText = (patientSelected.idCard || '').replace(idCardReg, '$1*************$3') || ''
      patientSelected.mobileText = (patientSelected.mobile || '').replace(mobileReg, '$1*****$3') || ''

      this.setData({
        unionId,
        reservationId,
        status,
        patientSelected: patientSelected
      })
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
