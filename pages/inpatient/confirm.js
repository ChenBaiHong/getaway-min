// pages/inpatient/confirm.js
import dayjs from '../../utils/dayjs'
import '../../utils/dayjs.zh-cn'
import request from '../../utils/request'

Page({
  /**
   * Page initial data
   */
  data: {
    activeNames: ['0'],
    relationShow: false,
    relations: [],
    insuranceType: '',
    payDisabled: false,
    changeInfoDisabled: false
  },

  cardChange(event) {
    this.setData({
      patientSelected: event.detail
    })
    this.onShow()
  },

  /**
   *  获取字典
   */
  async getDict() {
    const [relations] = await Promise.all([
      await request.get(`/internet/api/dictionary/getBaseDictionary`, {
        dictionaryName: 'SOCIETY_RELATION_DICT '
      })
    ])
    this.setData({
      relations
    })
  },
  /**
   *  选择社会关系
   */
  relationOpen() {
    this.setData({
      relationShow: true
    })
  },
  relationClose() {
    this.setData({
      relationShow: false
    })
  },
  relationSelect(event) {
    this.relationClose()
    this.setData({
      guardianRelation: event.detail.value
    })
  },
  /**
   * 设置自助入院成功
   */
  async hospitalize(patientId, visitNum, order_no) {
    try {
      await request.post(`/internet/api/hospitalization/hospitalize`, {
        patientId,
        visitNum,
        order_no
      })
      wx.showModal({
        title: '入院成功',
        showCancel: false,
        success: res => {
          if (res.confirm) {
            this.data.inHosp = 1
            wx.setNavigationBarTitle({
              title: '住院服务'
            })
            this.onShow()
          }
        }
      })
    } catch (error) {
      throw error
    }
  },
  /**
   * 支付接口
   */
  async pay(fee, visitNum) {
    try {
      this.setData({ payDisabled: true })
      const { openId, unionId, patientSelected } = this.data
      const patientId = patientSelected.hisPatientId
      if (fee === 0) {
        return await this.hospitalize(patientId, visitNum)
      }

      const operationType = 3
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

      await this.hospitalize(patientId, visitNum, recharge.order_no)
    } catch (error) {
      wx.showModal({
        title: '提示',
        content: error.message || '请求服务器错误',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#3E697A'
      })
    } finally {
      this.setData({ payDisabled: false })
    }
  },
  /**
   * 支付
   */
  toPay(e) {
    const fee = e.currentTarget.dataset.item.suggestPrepay
    const visitNum = e.currentTarget.dataset.item.visitNum
    wx.showModal({
      title: '注意',
      content:
        '柳州市居民医保（原柳州市城镇居民医保、原柳州市农合）、来宾居民医保、异地医保、宁铁医保患者不能使用自助入院功能。柳州市居民医保患者入院前须到转诊办办理转诊手续。',
      confirmText: '我知道了',
      confirmColor: '#3E697A',
      success: res => res.confirm && this.pay(fee, visitNum)
    })
  },

  /**
   * 修改基本信息
   */
  async changePersonInfo(e) {
    try {
      this.setData({ changeInfoDisabled: true })
      const { address, guardianName, guardianPhoneNum, userId } = e.detail.value
      const { patientSelected, guardianRelation } = this.data
      await request.post(`/internet/api/user/changePatientInfo`, {
        operationType: 2, //实名认证
        patientId: patientSelected.hisPatientId, //病人id
        insuranceType: '', // 医保类型
        address: address || '',
        contactRelation: guardianRelation ? guardianRelation.lineCode : '', //联系关系
        contactName: guardianName || '',
        contactPhoneNum: guardianPhoneNum || '',
        userId: userId || ''
      })
      wx.showToast({
        title: '修改基本信息成功'
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none'
      })
    } finally {
      this.setData({ changeInfoDisabled: false })
    }
  },
  /**
   * 跳转
   */
  goto(event) {
    const { visitNum, isInHospital, tag } = event.currentTarget.dataset
    const url =
      {
        details: `/pages/inpatient/details?isInHospital=${isInHospital}&visitNum=${visitNum}`,
        recharge: '/pages/recharge/index?type=zy'
      }[tag] || ''
    url &&
      wx.navigateTo({
        url
      })
  },
  /**
   * 跳转到出院小结
   */
  gotoDischarged(e) {
    const visitNum = e.currentTarget.dataset.visitNum
    const { unionId, cardHostName, patientSelected } = this.data
    const url = `${cardHostName}/discharged?unionId=${unionId}&patientId=${patientSelected.hisPatientId}&visitNum=${visitNum}`
    wx.navigateTo({
      url: `/pages/index/webview?title=出院小结&url=${encodeURIComponent(url)}`
    })
  },
  /**
   * 获取入院记录
   */
  async getList() {
    try {
      const hinfo = await request.get(`/internet/api/hospitalization/getInpatientRecord`, {
        patientId: this.data.patientSelected.hisPatientId,
        type: this.data.inHosp ? '1' : ''
        // patientId: '0000258522',
      })
      this.setData({
        hinfo
      })
    } catch (error) {
      throw error
    }
  },
  /**
   * 更换就诊卡
   */
  cardChange(event) {
    this.setData({
      patientSelected: event.detail
    })
    this.onShow()
  },
  /**
   * 折叠面板切换
   */
  onCollapseChange(event) {
    this.setData({
      activeNames: event.detail
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    if (options.inHosp === '1') {
      this.setData({
        inHosp: true
      })
      // this.data.inHosp = 1
      wx.setNavigationBarTitle({
        title: '住院服务'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '自助入院'
      })
    }
    const { openId, unionId, cardHostName, patientSelected } = getApp().globalData
    this.setData({
      openId,
      unionId,
      cardHostName,
      patientSelected: patientSelected
    })
    this.getDict()
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
      const patientSelected = this.data.patientSelected
      patientSelected.age = dayjs().diff(dayjs(patientSelected.birth.replace(/\-/g, '/')), 'year') + '岁'
      patientSelected.sexText = {
        '0': '男',
        '1': '女'
      }[patientSelected.sex]

      this.setData({
        patientSelected: patientSelected
      })

      await this.getList()
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
