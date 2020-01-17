//app.js
import request from './utils/request'
import dayjs from './utils/dayjs'

App({
  onLaunch() {
    const sysInfo = wx.getSystemInfoSync()
    this.globalData.sysInfo = sysInfo
    this.globalData.minHW = Math.min(sysInfo.windowHeight, sysInfo.windowWidth)
    this.globalData.openId = wx.getStorageSync('openId') || wx.getStorageSync('openid')
    this.globalData.unionId = wx.getStorageSync('unionId') || wx.getStorageSync('unionid')
    wx.setStorageSync('openId', this.globalData.openId)
    wx.setStorageSync('unionId', this.globalData.unionId)
    // API
    this.globalData.apiHostName = `https://${{
      develop: 'test', // 开发版
      trial: 'test', // 体验版
      release: 'product' // 线上版
    }[__wxConfig.envVersion] || 'product'}.lzihospital.com`
    // 就诊卡
    this.globalData.cardHostName = `https://${{
      develop: 'testcard', // 开发版
      trial: 'testcard', // 体验版
      release: 'card' // 线上版
    }[__wxConfig.envVersion] || 'card'}.lzihospital.com`
  },

  onShow(options) {
    this.checkForUpdate(true)
  },

  checkForUpdate(always) {
    const nowdate = dayjs().format('YYYY-MM-DD')
    const checked = this.globalData.updateChecked || wx.getStorageSync('updateChecked')
    if ((always || nowdate !== checked) && wx.getUpdateManager instanceof Function) {
      wx.setStorageSync('updateChecked', (this.globalData.updateChecked = nowdate))

      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(res => {
        // 请求完新版本信息的回调
        // console.log('onCheckForUpdate:', res.hasUpdate)
      })

      updateManager.onUpdateReady(() =>
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，\n是否重启应用？',
          showCancel: false,
          success: () => updateManager.applyUpdate() // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        })
      )

      updateManager.onUpdateFailed(res => {
        // console.log('onUpdateFailed:', res)
        // 新版本下载失败
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        })
      })
    } else {
      this.globalData.updateChecked = checked
    }
  },

  // 获取unionId
  promiseUnionid: null,
  getUnionid(data) {
    if (this.globalData.openId && this.globalData.unionId) {
      const { openId, unionId } = this.globalData
      return Promise.resolve({ openId, unionId })
    }
    if (this.promiseUnionid) {
      return this.promiseUnionid
    }
    return (this.promiseUnionid = new Promise(async (resolve, reject) => {
      try {
        const { openId, unionId } = await request.get(`/internet/api/user/checkOrCreateUser`, {
          ...data
        })

        if (unionId) {
          wx.setStorageSync('openId', (this.globalData.openId = openId))
          wx.setStorageSync('unionId', (this.globalData.unionId = unionId))
          resolve({ openId, unionId })
        } else {
          delete this.promiseUnionid
          reject({ openId, unionId })
        }
      } catch (error) {
        delete this.promiseUnionid
        reject(error)
      }
    }))
  },

  // 获取健康卡列表
  promisePatient: null,
  getPatients(options = {}) {
    if (!options.reload && this.promisePatient) {
      return this.promisePatient
    }
    return (this.promisePatient = new Promise(async (resolve, reject) => {
      try {
        const list = await request.get(`/internet/api/buildingCard/cardList`)
        if (list && list.length) {
          this.globalData.patientSelected =
            list.find(item => item.hisPatientId === options.patientId) || list.find(item => item.isDefault) || list[0]
          this.globalData.patientList = list
        } else {
          this.globalData.patientSelected = {}
          this.globalData.patientList = []
        }
        resolve(list)
      } catch (error) {
        delete this.promisePatient
        reject(error)
      }
    }))
  },

  // 订阅消息
  requestSubscribeMessage() {
    const requestSubscribeMessage = wx.getStorageSync('requestSubscribeMessage')
    return requestSubscribeMessage
      ? Promise.resolve(requestSubscribeMessage)
      : new Promise((resolve, reject) =>
          wx.requestSubscribeMessage({
            tmplIds: [
              '6woYY64mUpwaYXmwNO4teALYv3FfIK8_gO2hLo1PRXI',
              'KIflImglHS5iYzRXRUnDl1qfy8GO_3YyDJxpqD4qqg4',
              'Dk6wCEQ7vc2PTQ6ooT6qnDvk7kJjYkmL7B9kg20hii8'
            ],
            success(result) {
              wx.setStorageSync('requestSubscribeMessage', JSON.stringify(result))
              resolve(result)
            },
            fail(fail) {
              // reject(fail)
              resolve(fail)
            }
          })
        )
  },

  loading(value) {
    this.globalData.loadingCount = Math.max(0, (this.globalData.loadingCount += value))
    this.globalData.loadingCount === 1 && wx.showNavigationBarLoading()
    // this.globalData.loadingCount === 1 && wx.showLoading({ mask: true })
    this.globalData.loadingCount === 0 && wx.hideNavigationBarLoading()
    // this.globalData.loadingCount === 0 && wx.hideLoading()
  },

  globalData: {
    loadingCount: 0
  }
})
