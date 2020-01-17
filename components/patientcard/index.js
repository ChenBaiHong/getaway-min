// components/patientcard/index.js
Component({
  /**
   * Component properties
   */
  properties: {
    disabled: {
      type: Boolean,
      value: false
    }
  },

  /**
   * Component initial data
   */
  data: {
    popupShow: false,
    patientSelected: {},
    patientList: []
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show() {
      const globalData = getApp().globalData
      let selected = globalData.patientSelected
      let list = globalData.patientList
      this.setData({
        patientSelected: selected || {},
        patientList: list || []
      })
      Object.defineProperty(globalData, 'patientSelected', {
        configurable: true,
        enumerable: true,
        set: value => this.setData({ patientSelected: (selected = value) }),
        get: () => {
          this.setData({ patientSelected: selected || {} })
          return selected
        }
      })
      Object.defineProperty(globalData, 'patientList', {
        configurable: true,
        enumerable: true,
        set: value => this.setData({ patientList: (list = value) }),
        get: () => {
          this.setData({ patientList: list })
          return list
        }
      })
    }
  },

  /**
   * Component methods
   */
  methods: {
    async show() {
      const { unionId, cardHostName } = getApp().globalData
      if (!unionId) {
        return this.triggerEvent('auth', true)
      }

      await getApp().requestSubscribeMessage()

      if (!this.data.patientList.length) {
        const { patientSelected } = this.data
        const url = `${cardHostName}/add?unionId=${unionId}&patientId=${patientSelected.hisPatientId || ''}`
        return wx.navigateTo({
          url: `/pages/index/webview?title=申领健康卡&url=${encodeURIComponent(url)}`
        })
      }

      !this.data.disabled && this.data.patientList.length > 1 && this.setData({ popupShow: !this.data.popupShow })
    },
    close() {
      this.setData({ popupShow: false })
    },

    async click(event) {
      const { item } = event.currentTarget.dataset
      getApp().globalData.patientSelected = item
      this.close()
      this.triggerEvent('change', item)
    }
  }
})
