const REQUEST = {}
const METHOD = ['GET', 'POST']

/**
 * REQUEST
 * @param url URL地址
 * @param data 传参数据
 * @param header 请求头设置
 *
 * 使用方法
 * import request from '../../utils/request'
 *
 * request.get(url, [data], [header])
 * request.post(url, [data], [header])
 * ......
 */
METHOD.map(
  method =>
    (REQUEST[method.toLowerCase()] = (url, data, header) =>
      new Promise((resolve, reject) => {
        const { apiHostName, patientSelected } = getApp().globalData
        const patientId = (patientSelected && patientSelected.hisPatientId) || ''
        const unionId = wx.getStorageSync('unionId') || ''
        const openId = wx.getStorageSync('openId') || ''
        const params = []

        header = {
          ...header,
          patientId,
          unionId,
          openId
        }

        url = (/^http(s)?\:\/\//.test(url) && url) || `${apiHostName}${url}`

        if (!/patientId\=/.test(url)) {
          params.push(`patientId=${patientId}`)
        }
        if (!/unionId\=/.test(url)) {
          params.push(`unionId=${unionId}`)
        }
        if (!/openId\=/.test(url)) {
          params.push(`openId=${openId}`)
        }

        if (params.length) {
          const conn = (/\?/.test(url) && '&') || '?'
          url = `${url}${conn}${params.join('&')}`
        }

        getApp().checkForUpdate()
        getApp().loading(1)

        wx.request({
          url,
          data,
          method,
          header,
          success: async ({ data }) => {
            if (data.code && data.code !== 200) {
              if (data.code === 10000204) {
                await getApp().getPatients({ reload: true })
                wx.showModal({
                  title: '就诊卡绑定信息已失效，\n请重新绑定',
                  showCancel: false,
                  success: res => res.confirm && wx.reLaunch({ url: '/pages/index/index' })
                })
              }
              reject(data)
            } else {
              resolve(data.result !== undefined ? data.result : data)
            }
          },
          fail: reject,
          complete: () => getApp().loading(-1)
        })
      }))
)

export default REQUEST
