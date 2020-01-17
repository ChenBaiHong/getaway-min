import request from '../../utils/request'

Page({
  /**
   * Page initial data
   */
  data: {
    list: [],
    dialogData: [], //侧边栏
    showSearch: false,
    showSider: false
  },

  /**
   * 打开关闭搜索
   */
  openSearch() {
    this.setData({
      showSearch: true
    })
  },
  onSearchCancel() {
    this.setData({
      showSearch: false
    })
  },
  /**
   * 侧边栏展开
   */
  dialogOpen(event) {
    const dept = event.currentTarget.dataset.item
    if (dept.docCnt === 0) {
      return wx.navigateTo({
        url: '/pages/register/noReserv'
      })
    }
    this.setData({
      dialogData: dept,
      showSider: true
    })
  },
  /**
   * 打开侧边栏时点击mask
   */
  clickOverlay() {
    this.setData({
      showSider: false
    })
  },
  /**
   * 跳转到科室排班
   */
  toSchedule(e) {
    const dept = e.currentTarget.dataset.dept
    wx.navigateTo({
      url: `/pages/register/schedule?deptId=${dept.deptId}`
    })
    wx.setStorageSync('dept', dept)
  },
  /**
   * 科室图片报错
   */
  imageError(e) {
    const index = e.currentTarget.dataset.index
    const item = `list[${index}].imageErr`
    this.setData({
      [item]: true
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(options) {
    try {
      const list = await request.get(`/internet/api/reservation/getTopDepts`, {
        hospId: options.hospId
      })
      this.setData({ list })
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
