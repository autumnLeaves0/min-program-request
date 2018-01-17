import Request from './request.js'
import CancelToken, { isCancel } from './cancel.js'
import defaults from './defaults.js'
import { merge } from './util.js'

/**
 * @params{
 *   url:	String	是		开发者服务器接口地址
 *   baseURL:	String	否		会加载url之前
 *   data:	Object/String/ArrayBuffer	否		请求的参数
 *   header:	Object	否		设置请求的 header，header 中不能设置 Referer。
 *   method:	String	否	GET	（需大写）有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
 *   dataType:	String	否	json	如果设为json，会尝试对返回的数据做一次 JSON.parse
 *   responseType:	String	否	text	设置响应的数据类型。合法值：text、arraybuffer	1.7.0
 *   cancelToken: Promise  取消token
 * }
 * 
 * @axios 文档  https://www.kancloud.cn/yunye/axios/234845
 * 
 * @function{
 *   CancelToken{
 *     取消请求,参考axios
 *   }
 *   interceptors{
 *     拦截器,参考axios
 *   }
 *   create{
 *     @params{ 同上边的params }
 *     创建一个新实例
 *   }
 *   Request {
 *     原型
 *   }
 *   Request.defaults.concurrency{
 *     并发数,仅在原生上修改有效
 *   }
 * }
 * 
 * 
 */

function createInstance(defaules) {
  let context = new Request(defaules)
  let instance = context.request.bind(context)

  Request.methods.forEach((method) => {
    instance[method.toLowerCase()] = context[method.toLowerCase()].bind(context)
  })

  instance.CancelToken = CancelToken
  instance.defaults = context.defaults
  instance.interceptors = context.interceptors
  instance.isCancel = isCancel

  return instance
}

let instance = createInstance(merge(Request.defaules, {}))

instance.create = function create(instanceOptions) {
  return createInstance(utils.merge(defaults, instanceOptions));
};

instance.Request = Request

export default instance