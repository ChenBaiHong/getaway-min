import request from '../../utils/request'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    scheduleData: {},
    isToday: false,
    deptId: ''
  },

  //跳转到医生排班详情
  toPage(e) {
    const doctor = e.currentTarget.dataset.doctor
    wx.navigateTo({
      url: `/pages/register/doctor?docId=${doctor.docId}&deptId=${this.data.deptId}`
    })
    wx.setStorageSync('doctor', doctor)
  },

  async getData() {
    try {
      const data = await request.get(`/internet/api/reservation/getDocScheduleByDeptId`, {
        deptId: this.data.deptId
      })
      if (!data || Object.keys(data).length === 0) {
        wx.redirectTo({
          url: '/pages/register/noReserv' //没有数据的页面
        })

        return
      }
      const weeks = {
        0: '周日',
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六'
      }
      const tabs = {}
      Object.entries(data).map(([key]) => {
        tabs[key] = `${key.replace(/\d{4}-(\d{2})-(\d{2})/, '$1/$2')} (${weeks[new Date(key).getDay()]})`
      })
      const list = this.objToArr(data)

      this.setData({
        scheduleTabs: tabs,
        scheduleData: list
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('dept').deptName || '科室'
    })
    this.data.deptId = options.deptId
    this.getData()
  },

  objToArr(object) {
    let arr = []
    let keys = Object.keys(object)
    const weeks = {
      0: '周日',
      1: '周一',
      2: '周二',
      3: '周三',
      4: '周四',
      5: '周五',
      6: '周六'
    }
    keys.forEach(item => {
      arr.push({
        date: item,
        isToday: this.isToday(item),
        formatDate: `${item.replace(/\d{4}-(\d{2})-(\d{2})/, '$1/$2')} (${weeks[new Date(item).getDay()]})`,
        list: object[item]
      })
    })
    arr.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())
    return arr
  },

  // 判断是否是当日挂号
  isToday(date) {
    const nowDate = new Date()
    const selectDate = new Date(date.replace(/\.\d$/, '').replace(/\-/g, '/'))
    if (nowDate.setHours(0, 0, 0, 0) === selectDate.setHours(0, 0, 0, 0)) {
      return true
    } else {
      return false
    }
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
