var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Promise.prototype.finally = function (callback) {
  var P = this.constructor;
  return this.then(function (value) {
    return P.resolve(callback()).then(function () {
      return value;
    });
  }, function (reason) {
    return P.resolve(callback()).then(function () {
      throw reason;
    });
  });
};

var toString = Object.prototype.toString;











function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return (/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
  );
}

function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
}

function merge() /* obj1, obj2, obj3, ... */{
  var _arguments = arguments;

  var result = {};
  function assignValue(val, key) {
    if (_typeof(result[key]) === 'object' && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  var _loop = function _loop() {
    var item = _arguments[i];
    if (item) {
      Object.keys(item).forEach(function (key, index) {
        assignValue(item[key], key);
      });
    }
  };

  for (var i = 0, l = arguments.length; i < l; i++) {
    _loop();
  }
  return result;
}

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  this.handlers.forEach(function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var working = null;

var Queue = function () {
  function Queue(max) {
    _classCallCheck(this, Queue);

    this.executing = []; //执行队列
    this.waiting = []; //等待队列
    this.immediately = []; //即将执行队列
    this.num = 0;
    this.max = max;
  }

  _createClass(Queue, [{
    key: 'getMax',
    value: function getMax() {
      return isFunction(this.max) ? this.max() : max;
    }
  }, {
    key: 'push',
    value: function push(request) {
      var id = ++this.num;
      var task = function task() {
        var _this = this;

        return new Promise(request).then(function () {
          _this.complete(id);
        });
      };
      task.id = id;
      this.waiting.push(task);
      this.arrange();
      return id;
    }
  }, {
    key: 'arrange',
    value: function arrange() {
      if (this.executing.length + this.immediately.length < this.getMax() && this.waiting.length) {
        this.immediately.push(this.waiting.shift());
        if (!working) {
          working = true;
          Promise.resolve(this).then(function (context) {
            context.work();
          });
        }
      }
    }
  }, {
    key: 'work',
    value: function work() {
      for (var i = 0; i < this.immediately.length; i++) {
        var task = {
          promise: this.immediately[i].call(this),
          id: this.immediately[i].id
        };
        this.executing.push(task);
      }
      this.immediately = [];
      working = false;
    }
  }, {
    key: 'complete',
    value: function complete(id) {
      for (var i = 0, l = this.executing.length; i < l; i++) {
        if (id === this.executing[i].id) {
          this.executing.splice(i, 1);
          this.arrange();
          return;
        }
      }
    }
  }]);

  return Queue;
}();

var defaults = {
  concurrency: 10
};

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var queue = new Queue(function () {
  return defaults.concurrency;
});

function wxRequest(options) {
  var promise = new Promise(function (resolve, reject) {
    var request = null,
        cancel = false;

    if (options.cancelToken) {
      options.cancelToken.promise.catch(function (Reason) {
        reject(Reason);
        cancel = true;
        if (request) request.abort();
      });
    }

    queue.push(function (res, rej) {
      if (cancel) return res();
      request = wx.request(_extends({}, options, {
        success: function success(result) {
          res();
          resolve(result);
        },
        fail: function fail(err) {
          res();
          reject(err);
        }
      }));
    });
  });

  if (options.cancelToken) promise = Promise.race([promise, options.cancelToken.promise]);

  return promise;
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var methods = ['OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'];

var Request = function () {
  function Request(defaults$$1) {
    _classCallCheck$1(this, Request);

    delete defaults$$1.concurrency;
    this.defaults = defaults$$1;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }

  _createClass$1(Request, [{
    key: 'request',
    value: function request(options) {
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

      var promise = Promise.resolve(options);
      var chain = [wxRequest, null];

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    }
  }]);

  return Request;
}();

Request.defaults = defaults;
Request.methods = methods;


methods.forEach(function (method) {
  Request.prototype[method.toLowerCase()] = function (url, options) {
    return this.request(merge({ url: url, method: method }, options));
  };
});

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cancel = function Cancel(message) {
  _classCallCheck$2(this, Cancel);

  this.message = message;
};

Cancel.__CANCEL__ = true;


function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var rejectPromise;
  this.promise = new Promise(function promiseExecutor(resolve, reject) {
    rejectPromise = reject;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    rejectPromise(token.reason);
  });
}

CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

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
  var context = new Request(defaules);
  var instance = context.request.bind(context);

  Request.methods.forEach(function (method) {
    instance[method.toLowerCase()] = context[method.toLowerCase()].bind(context);
  });

  instance.CancelToken = CancelToken;
  instance.defaults = context.defaults;
  instance.interceptors = context.interceptors;
  instance.isCancel = isCancel;

  return instance;
}

var instance = createInstance(merge(Request.defaules, {}));

instance.create = function create(instanceOptions) {
  return createInstance(utils.merge(defaults, instanceOptions));
};

instance.Request = Request;

export default instance;
