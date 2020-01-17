// pages/payment/index.js
import dayjs from '../../utils/dayjs'
import '../../utils/dayjs.zh-cn'
import request from '../../utils/request'
import payment from '../../utils/payment'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabActive: 0,
    checkResult: [],
    checkAll: false,
    feeTotal: 0,
    checkArr: []
  },

  tabChange(event) {
    this.setData({ tabActive: event.detail.name })
  },

  cardChange(event) {
    this.setData({ patientSelected: event.detail })
    this.onShow()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { openId, unionId, patientSelected } = getApp().globalData
    this.setData({
      openId: openId,
      unionId: unionId,
      tabActive: parseInt(options.tab || 0),
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
      const result = await request.get(`/internet/api/payment/getOutPatientBills`, {
        patientId: this.data.patientSelected.hisPatientId,
        startDate: dayjs()
          .subtract(1, 'year')
          .format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD')
      })

      this.setData({
        notPays: [],
        pays: [],
        ...result
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },
  onChange(event) {
    const arr = []
    event.detail.map(item => {
      const feeItem = this.data.notPays.find(value => value.billNums === item)
      arr.push(feeItem)
    })
    let fee = 0
    arr.map(item => {
      if (item && item.fee) {
        fee += item.fee * 100
      }
    })
    this.setData({
      feeTotal: fee / 100,
      checkArr: arr
    })
    if (event.detail.length === this.data.notPays.length) {
      this.setData({
        checkResult: event.detail,
        checkAll: true
      })
    } else {
      this.setData({
        checkResult: event.detail,
        checkAll: false
      })
    }
  },
  toDetail(e) {
    const data = e.currentTarget.dataset.option
    wx.navigateTo({
      url: `/pages/payment/order?outpatientNum=${data.outpatientNum}&billNums=${data.billNums}&billType=${data.billType}&billName=${data.billName}`
    })
  },

  toggle(event) {
    const { index } = event.currentTarget.dataset
    const checkbox = this.selectComponent(`.checkboxes-${index}`)
    checkbox.toggle()
  },
  noop() {},
  checkAll() {
    const arr = []
    if (!this.data.checkAll) {
      this.data.notPays.map(item => {
        arr.push(item.billNums)
      })
      this.setData({
        checkResult: arr,
        checkAll: true
      })
      this.onChange({ detail: this.data.checkResult })
    } else {
      this.setData({
        checkResult: [],
        checkAll: false
      })
      this.onChange({ detail: this.data.checkResult })
    }
  },

  async toPay() {
    try {
      const billReqs = []
      this.data.checkArr.map(item => {
        billReqs.push({ billType: item.billType, billNums: item.billNums })
      })
      if (!billReqs.length && !this.data.feeTotal) {
        return false
      }

      this.setData({ loading: true })

      await payment({ billReqs: billReqs, ...this.data })

      wx.showModal({
        title: '缴费成功！',
        showCancel: false,
        success: res => {
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
