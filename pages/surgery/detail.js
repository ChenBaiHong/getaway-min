import request from '../../utils/request'

// pages/surgery/detail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    imgSrc: '',
    progress: 0,
    progressList: [
      {
        key: 'enterOperatingRoomTime',
        value: 0,
        className: '',
        title: '进手术室',
        time: ''
      },
      {
        key: 'startOperationTime',
        value: 2,
        className: '',
        title: '开始手术',
        time: ''
      },
      {
        key: 'startAnaesthesiaTime',
        value: 1,
        className: '',
        title: '开始麻醉',
        time: ''
      },
      {
        key: 'endOperationTime',
        value: 3,
        className: '',
        title: '结束手术',
        time: ''
      },
      {
        key: 'outOperatingRoomTime',
        value: 4,
        className: '',
        title: '出手术室',
        time: ''
      },
      {
        key: 'endAnaesthesiaTime',
        value: 6,
        className: '',
        title: '麻醉结束',
        time: ''
      },
      {
        key: 'enterPACUTime',
        value: 5,
        className: '',
        title: '进复苏室',
        time: ''
      },
      {
        key: 'outPACUTime',
        value: 7,
        className: '',
        title: '出复苏室',
        time: ''
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.setData({
      ...options
    })
    const dataList = (options.data && options.data.split(',')) || (options.scene && options.scene.split(','))
    try {
      const result = await request.get('/internet/api/operation/getOperationStatus', {
        patientId: dataList[0],
        visitNum: dataList[1],
        operationNum: dataList[2]
      })
      // result.operationDate = result.operationDate.slice(0, 10)
      result.operationDate = result.operationDate && /^\d{4}\-\d{2}\-\d{2}/.exec(result.operationDate)
      const current = this.data.progressList.findIndex(item => item.title === result.status)
      const list = []
      this.data.progressList.map((item, index) => {
        const status = result.operationStatus[item.key]
        item.time = (status && /(\d{1,2}\:\d{1,2})/.exec(status)[0]) || ''
        item.className = item.value === current ? 'processing' : item.value < current ? 'complete' : 'pending'
        list.push(item)
      })
      this.setData({
        ...result,
        list
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow(options) {},
  async getCode() {
    try {
      const token = await request.get(`/internet/api/common/miniAccessToken`)
      const result = await request.post(`/internet/api/common/getWxQrCodeUrl`, {
        scene: this.data.data || this.data.scene,
        page: 'pages/surgery/detail',
        accessToken: token
      })
      this.setData({
        imgSrc: result,
        show: true
      })
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      })
    }
  },
  preview() {
    wx.previewImage({
      urls: [this.data.imgSrc] // 需要预览的图片http链接列表
    })
  },

  onClose() {
    this.setData({ close: false })
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
