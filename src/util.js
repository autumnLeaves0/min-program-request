Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

let toString = Object.prototype.toString;

export function isString(val) {
  return typeof val === 'string';
}

export function isNumber(val) {
  return typeof val === 'number';
}

export function isUndefined(val) {
  return typeof val === 'undefined';
}

export function isObject(val) {
  return val !== null && typeof val === 'object';
}

export function isArray(val) {
  return toString.call(val) === '[object Array]';
}

export function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

export function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

export function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

export function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }
  for (var i = 0, l = arguments.length; i < l; i++) {
    let item = arguments[i]
    if (item) {
      Object.keys(item).forEach(function (key, index) {
        assignValue(item[key], key)
      })
    }

  }
  return result;
}

export default {
  isString,
  isNumber,
  isUndefined,
  isObject,
  isArray,
  isFunction,
  isAbsoluteURL,
  combineURLs,
  merge
}