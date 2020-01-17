// pages/recharge/index.js
import request from '../../utils/request'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    minHW: getApp().globalData.minHW,
    tabActive: 0,
    balance: '0.0',
    typeSelected: {},
    operationType: {
      mz: { value: 1, text: '门诊' },
      zy: { value: 2, text: '住院' },
      zzry: { value: 3, text: '自助入院' }
    },
    fee: '',
    records: []
  },

  tabChange(event) {
    this.setData({ tabActive: event.detail.name })
  },

  cardChange(event) {
    this.setData({ patientSelected: event.detail })
    this.onShow()
  },

  inputChange(event) {
    let value = ''
    if (/^\d+(\.\d*)?$/.test(event.detail)) {
      value = (/\.\d{3,}$/.test(event.detail) && (Math.round(event.detail * 100) / 100).toFixed(2)) || event.detail
    } else if (event.detail) {
      value = this.data.fee
    }
    this.setData({ fee: value })
  },

  toPay() {
    if (this.data.fee) {
      wx.showModal({
        title: `${this.data.typeSelected.text}充值`,
        content: `充值金额：${this.data.fee} 元`,
        confirmText: '确认',
        success: async res => {
          if (res.confirm) {
            try {
              this.setData({ loading: true })

              const { fee, openId, unionId, patientSelected, typeSelected } = this.data
              const patientId = patientSelected.hisPatientId
              const operationType = typeSelected.value
              const recharge = await request.post(`/internet/api/payment/recharge?operationType=${operationType}`, {
                operationType,
                fee,
                openId,
                unionId,
                patientId
              })

              await new Promise((resolve, reject) =>
                wx.requestPayment({
                  timeStamp: recharge.timeStamp,
                  nonceStr: recharge.nonceStr,
                  package: recharge.package,
                  signType: recharge.signType,
                  paySign: recharge.paySign,
                  success: resolve,
                  fail: () => reject()
                })
              )

              await new Promise((resolve, reject) => {
                let count = 0
                const getOrder = async () => {
                  try {
                    count++
                    const result = await request.get(`/internet/api/payment/getOrder`, {
                      orderNo: recharge.order_no
                    })
                    if (count === 5 || result.orderStatus === 4) {
                      resolve()
                    } else {
                      setTimeout(getOrder, 1000)
                    }
                  } catch (error) {
                    reject(error)
                  }
                }
                getOrder()
              })

              await this.onShow()

              this.setData({ fee: '' })

              wx.showModal({
                title: '充值成功！',
                showCancel: false
              })
            } catch (error) {
              error &&
                wx.showModal({
                  title: '提示',
                  content: error.message,
                  showCancel: false,
                  confirmText: '我知道了',
                  confirmColor: '#3E697A'
                })
            } finally {
              this.setData({ loading: false })
            }
          }
        }
      })
    } else {
      wx.showToast({
        title: '请输入充值金额！',
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
      openId,
      unionId,
      tabActive: parseInt(options.tab || 0),
      patientSelected: patientSelected,
      typeSelected: this.data.operationType[options.type]
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
      this.setData({ loading: true })
      const [{ outpatientBalance, inpatientBalance }, record] = await Promise.all([
        request.get('/internet/api/payment/getAccountBalance', {
          patientId: this.data.patientSelected.hisPatientId
        }),
        request.get('/internet/api/payment/getRechargeRecord', {
          patientId: this.data.patientSelected.hisPatientId,
          inquireType: this.data.typeSelected.value
        })
      ])

      this.setData({
        loading: false,
        balance: this.data.typeSelected.value === 1 ? outpatientBalance : inpatientBalance,
        records: record
      })
    } catch (error) {
      this.setData({ loading: false })
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
