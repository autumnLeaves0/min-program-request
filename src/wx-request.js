import Queue from './queue.js'
import defaults from './defaults.js'

let queue = new Queue(function () {
  return defaults.concurrency
})

export default function wxRequest(options) {
  let promise = new Promise(function (resolve, reject) {
    let request = null, cancel = false

    if (options.cancelToken) {
      options.cancelToken.promise.catch(function (Reason) {
        reject(Reason)
        cancel = true
        if (request) request.abort()
      })
    }

    queue.push(function (res, rej) {
      if (cancel) return res()
      request = wx.request({
        ...options,
        success(result) {
          res()
          resolve(result)
        },
        fail(err) {
          res()
          reject(err)
        }
      })
    })

  })

  if (options.cancelToken) promise = Promise.race([promise, options.cancelToken.promise])

  return promise
}


