import request from '../../utils/request'

Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    searchKey: '', //搜索关键字
    searchList: null, //点击关键字列表后的相关科室医生

    adviceWords: null, // 事实搜索
    isShowAdviceWords: false,
    isLoading: false, // 搜索时候得loading

    searchHistory: [] //历史记录
  },

  lifetimes: {
    attached() {
      this.setData({
        searchHistory: wx.getStorageSync('_department_search_history') || []
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 搜索文字改变
     */
    binSearchChange(event) {
      const { value } = event.detail
      if (!value || !value.trim()) {
        this.setData({
          isShowAdviceWords: false,
          isLoading: false,
          searchList: null,
          searchKey: value
        })
        return
      }
      this.setData({
        isShowAdviceWords: true,
        searchList: null,
        adviceWords: [],
        searchKey: value
      })
      this.getSearchList().then(result => {
        let { dept, doc } = result
        if (dept.length !== 0) {
          dept.map(item => {
            if (item.deptName) {
              item.name = item.deptName
              item.word = item.deptName.replace(new RegExp(`(${event.detail})`, 'g'), `<##>$1<##>`).split('<##>')
            }
          })
        }
        if (doc.length !== 0) {
          doc.map(item => {
            if (item.docName) {
              item.name = item.docName
              item.word = item.docName.replace(new RegExp(`(${event.detail})`, 'g'), `<##>$1<##>`).split('<##>')
            }
          })
        }
        this.setData({
          adviceWords: dept.concat(doc)
        })
      })
    },

    /**
     * 科室，医生搜索api
     */
    async getSearchList() {
      try {
        this.setData({
          isLoading: true
        })
        const searchKey = this.data.searchKey
        const { deptVos, doctorVos } = await request.get(`/internet/api/reservation/getDeptAndDoctors`, {
          name: searchKey
        })
        this.setData({
          isLoading: false
        })
        return {
          dept: deptVos,
          doc: doctorVos
        }
      } catch (error) {
        throw error
      }
    },

    /**
     * 科室，医生搜索
     */
    async onSearch() {
      const searchKey = this.data.searchKey
      let { dept, doc } = await this.getSearchList()
      if (searchKey) {
        dept.map(item => {
          item.dept = item.deptName.replace(new RegExp(`(${searchKey})`, 'g'), `<##>$1<##>`).split('<##>')
        })
        doc.map(item => {
          item.doc = item.docName.replace(new RegExp(`(${searchKey})`, 'g'), `<##>$1<##>`).split('<##>')
        })
        this.setData({
          searchList: {
            depts: dept,
            doctors: doc
          }
        })
      }
    },
    onCancel() {
      this.triggerEvent('cancel')
    },
    cleanHistory() {
      wx.showModal({
        content: '确定要清除历史数据吗？',
        success: res => {
          if (res.confirm) {
            this.setData({
              searchHistory: []
            })
            wx.setStorageSync('_department_search_history', '')
          }
        }
      })
    },

    goSearch(event) {
      this.setData({
        searchKey: event.currentTarget.dataset.key,
        isShowAdviceWords: false
      })
      this.onSearch()
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

    gotoDoctor(e) {
      const searchHistory = this.data.searchHistory || []
      const doctorName = e.currentTarget.dataset.doctor.docName
      // 当历史数据满时就往前追加
      if (!searchHistory.some(item => item === doctorName)) {
        if (searchHistory.length >= 10) {
          searchRecord.pop() //删掉历史记录最后一条
          this.data.searchHistory.unshift(doctorName)
        } else {
          this.data.searchHistory.unshift(doctorName)
        }
        this.setData({
          searchHistory: this.data.searchHistory
        })
        wx.setStorageSync('_department_search_history', this.data.searchHistory)
      }
      const doctor = e.currentTarget.dataset.doctor
      wx.navigateTo({
        url: `/pages/register/doctor?docId=${doctor.docId}&deptId=${doctor.deptId}`
      })
      wx.setStorageSync('doctor', doctor)
    }
  }
})
