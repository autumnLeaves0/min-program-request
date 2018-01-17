/**
  wx.request({
    url:	String	是		开发者服务器接口地址
    data:	Object/String/ArrayBuffer	否		请求的参数
    header:	Object	否		设置请求的 header，header 中不能设置 Referer。
    method:	String	否	GET	（需大写）有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    dataType:	String	否	json	如果设为json，会尝试对返回的数据做一次 JSON.parse
    responseType:	String	否	text	设置响应的数据类型。合法值：text、arraybuffer	1.7.0
    success:	Function	否		收到开发者服务成功返回的回调函数
    fail:	Function	否		接口调用失败的回调函数
    complete:	Function	否		接口调用结束的回调函数（调用成功、失败都会执行）
  })
 **/

import {
  isString,
  isNumber,
  isUndefined,
  isObject,
  isAbsoluteURL,
  combineURLs,
  merge
} from './util.js'

import InterceptorManager from './interceptors.js'
import wxRequest from './wx-request.js'
import defaults from './defaults.js'

let methods = ['OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT']

class Request {
  static defaults = defaults
  static methods = methods

  constructor(defaults) {
    delete defaults.concurrency
    this.defaults = defaults
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }

  request(options) {
    if (typeof options === 'string') {
      options = merge({
        url: arguments[0]
      }, arguments[1]);
    }

    options = merge(this.defaults, { method: 'get' }, options);
    options.method = options.method.toUpperCase();

    if (options.baseURL && !isAbsoluteURL(options.url)) {
      options.url = combineURLs(options.baseURL, options.url);
    }

    let promise = Promise.resolve(options)
    let chain = [wxRequest, null]

    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise
  }
}

methods.forEach(function (method) {
  Request.prototype[method.toLowerCase()] = function (url, options) {
    return this.request(merge({ url, method }, options))
  }
})

export default Request