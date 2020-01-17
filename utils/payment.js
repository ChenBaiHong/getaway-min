import request from './request'

const payment = async options => {
  try {
    const operationType = 4
    const { openId, unionId, patientSelected } = options
    const patientId = patientSelected.hisPatientId
    const recharge = await request.post(`/internet/api/payment/recharge?operationType=${operationType}`, {
      operationType,
      fee: options.fee || options.feeTotal,
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
      const getOrder = async () => {
        try {
          const result = await request.get(`/internet/api/payment/getOrder`, {
            orderNo: recharge.order_no
          })
          if (result.orderStatus === 4) {
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

    await request.post(`/internet/api/payment/outPatientPayment`, {
      billReqs: options.billReqs,
      orderNo: recharge.order_no,
      fee: options.fee || options.feeTotal
    })
  } catch (error) {
    throw error
  }
}

export default payment
