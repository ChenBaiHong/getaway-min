// pages/appraise/index.js
import request from '../../utils/request'
var app = getApp()
Page({
  /**
   * Page initial data
   */
  data: {
    unionId: getApp().globalData.unionId,
    minHW: getApp().globalData.minHW,
    tabs: ['意见或建议', '在线投诉', '在线表扬'],
    tabActive: 0,
    radioChecked: '1',
    opinionText: '',
    phoneNumber: '',
    name: '',
    doctorDept: '',
    doctorName: '',
    complaintText: '',
    SatisfactionText: '',
    PraiseText: '',
    rateItems: {},
    rateValue: 3,
    imageUrl: [],
    delcontent: '',
    rateText: {
      1: '极差',
      2: '较差',
      3: '一般',
      4: '较好',
      5: '很好'
    }
  },

  tabChange(event) {
    this.setData({
      tabActive: event.detail.name,
      name: '',
      doctorDept: '',
      doctorName: '',
      complaintText: '',
      SatisfactionText: '',
      PraiseText: ''
    })
  },

  async radioChange(event) {
    this.setData({
      radioChecked: event.detail
    })
  },
  rateChange(event) {
    const items = this.data.rateItems
    items[this.data.radioChecked][event.target.dataset.index].rate = event.detail
    this.setData({ rateItems: items })
  },
  inputName(event) {
    this.setData({ name: event.detail })
  },
  inputphoneNumber(event) {
    this.setData({ phoneNumber: event.detail })
  },
  inputOpinion(event) {
    this.setData({ opinionText: event.detail.value })
  },
  inputdoctorDept(event) {
    this.setData({ doctorDept: event.detail })
  },
  inputdoctorName(event) {
    this.setData({ doctorName: event.detail })
  },
  inputcomplaintText(event) {
    this.setData({ complaintText: event.detail.value })
  },
  inputPraiseText(event) {
    this.setData({ PraiseText: event.detail.value })
  },
  inputSatisfactionText(event) {
    this.setData({ SatisfactionText: event.detail.value })
  },
  //提交意见或建议
  async subOpinion() {
    const strObj = {}
    strObj.text = this.data.opinionText
    strObj.imageUrl = this.data.imageUrl
    let evaluateContent = JSON.stringify(strObj)
    try {
      if (!this.data.name || !this.data.phoneNumber) throw { message: '必填项不能为空' }
      if (!/^1[3456789]\d{9}$/.test(this.data.phoneNumber)) throw { message: '手机号格式不正确' }

      await request.post(`/internet/api/evaluate/saveSuggestions`, {
        evaluateContent: evaluateContent,
        evaluateType: this.data.radioChecked,
        unionId: this.data.unionId,
        patientMobile: this.data.phoneNumber,
        patientName: this.data.name
      })

      wx.showToast({
        title: '提交成功！',
        icon: 'success',
        duration: 2000
      })
      this.setData({ delcontent: '', imageUrl: [], name: '', phoneNumber: '', opinionText: '' })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },
  //提交投诉
  async subcomplaint() {
    const strObj = {}
    strObj.text = this.data.complaintText
    strObj.imageUrl = this.data.imageUrl
    let evaluateContent = JSON.stringify(strObj)
    try {
      if (!this.data.name || !this.data.doctorDept || !this.data.doctorName || !this.data.phoneNumber)
        throw { message: '必填项不能为空' }
      if (!/^1[3456789]\d{9}$/.test(this.data.phoneNumber)) throw { message: '手机号格式不正确' }

      await request.post(`/internet/api/evaluate/saveComplaint`, {
        doctorDept: this.data.doctorDept,
        doctorName: this.data.doctorName,
        evaluateContent: evaluateContent,
        evaluateType: this.data.radioChecked,
        unionId: this.data.unionId,
        patientMobile: this.data.phoneNumber,
        patientName: this.data.name
      })

      wx.showToast({
        title: '提交成功！',
        icon: 'success',
        duration: 2000
      })
      this.setData({
        delcontent: '',
        imageUrl: [],
        name: '',
        doctorDept: '',
        doctorName: '',
        phoneNumber: '',
        complaintText: ''
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },
  //提交表扬
  async subPraise() {
    const strObj = {}
    strObj.text = this.data.inputPraiseText
    strObj.imageUrl = this.data.imageUrl
    let evaluateContent = JSON.stringify(strObj)
    try {
      if (!this.data.name || !this.data.doctorDept || !this.data.doctorName || !this.data.phoneNumber)
        throw { message: '必填项不能为空' }
      if (!/^1[3456789]\d{9}$/.test(this.data.phoneNumber)) throw { message: '手机号格式不正确' }

      await request.post(`/internet/api/evaluate/savePraise`, {
        doctorDept: this.data.doctorDept,
        doctorName: this.data.doctorName,
        evaluateContent: evaluateContent,
        evaluateType: this.data.radioChecked,
        unionId: this.data.unionId,
        patientMobile: this.data.phoneNumber,
        patientName: this.data.name
      })

      wx.showToast({
        title: '提交成功！',
        icon: 'success',
        duration: 2000
      })
      this.setData({
        delcontent: '',
        imageUrl: [],
        name: '',
        doctorDept: '',
        doctorName: '',
        phoneNumber: '',
        inputPraiseText: ''
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },
  //满意度评价
  async subEvaluate() {
    const arr = []
    this.data.rateItems[this.data.radioChecked].map(({ rate, questionId }) =>
      arr.push({
        evaluateContent: this.data.SatisfactionText,
        evaluateScore: rate,
        evaluateType: parseInt(this.data.radioChecked),
        unionId: this.data.unionId,
        questionId: questionId
      })
    )
    try {
      await request.post('/internet/api/evaluate/saveSatisfactionSurvey', {
        tbSatisfactionSurveys: arr
      })

      wx.showToast({
        title: '提交成功！',
        icon: 'success',
        duration: 2000
      })
      this.setData({ delcontent: '' })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },

  chooseImage() {
    var that = this
    wx.chooseImage({
      count: 5,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: async res => {
        try {
          const promiseList = []
          res.tempFilePaths.map(path =>
            promiseList.push(
              new Promise((resolve, reject) => {
                wx.uploadFile({
                  url: 'https://www.lzihospital.com/hospf/upload', //仅为示例，非真实的接口地址
                  filePath: path,
                  name: 'file',
                  success: res => resolve(res.data.replace(/\,.+$/, '')),
                  fail: reject
                })
              })
            )
          )
          const list = await Promise.all(promiseList)
          this.setData({ imageUrl: list })
        } catch (error) {
          wx.showToast({
            title: error.message,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },
  //查看大图
  previewImage(event) {
    wx.previewImage({
      current: event.target.dataset.index, // 当前显示图片的http链接
      urls: this.data.imageUrl // 需要预览的图片http链接列表
    })
  },
  //删除图片
  delImage(event) {
    let index = event.target.dataset.index
    wx.showModal({
      title: '提示',
      content: '删除无法恢复，确定删除吗？',
      success: res => {
        if (res.confirm) {
          this.data.imageUrl.splice(index, 1)
          this.setData({ imageUrl: this.data.imageUrl })
        }
      }
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(options) {
    try {
      const [result, res] = await Promise.all([
        request.get('/internet/api/evaluate/gotoEvaluate'),
        request.get('/internet/api/evaluate/getSatisfactionSurveyQuestions')
      ])
      const items = res || {}
      Object.keys(items).map(idx => items[idx].map(item => (item.rate = 4)))
      result &&
        this.setData({
          tabs: [...this.data.tabs, '满意度调查'],
          tabActive: 3,
          rateItems: items
        })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 3000
      })
    }
  },
  async onShow(options) {},

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {},

  /**
   * Lifecycle function--Called when page show
   */

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
