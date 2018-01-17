# min-program-request
基于promise的小程序请求库，借鉴axios

## Example

Performing a `GET` request

```js
// Make a request for a user with a given ID
request.get('/user?ID=12345')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// Optionally the request above could also be done as
request.get('/user', {
    data: {
      ID: 12345
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

Performing a `POST` request

```js
request.post('/user', {
  data:{
    firstName: 'Fred',
    lastName: 'Flintstone'
  })
}
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

## request API

Requests can be made by passing the relevant config to `request`.

##### axios(config)

```js
// Send a POST request
request({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```


##### request(url[, config])

```js
// Send a GET request (default method)
request('/user/12345');
```

### Request method aliases

For convenience aliases have been provided for all supported request methods.

'options', 'get', 'head', 'post', 'put', 'delete', 'trace', 'connect'

```js
request[method](url[,config])
```

### Creating an instance

You can create a new instance of request with a custom config.

##### request.create([config])

```js
var instance = request.create({
  baseURL: 'https://some-domain.com/api/',
  headers: {'X-Custom-Header': 'foobar'}
});
```

## Request Config

These are the available config options for making requests. Only the `url` is required. Requests will default to `GET` if `method` is not specified.

```js
{
  url: String, //required
  baseURL: String,
  //`method` default get
  //support 'options', 'get', 'head', 'post', 'put', 'delete', 'trace', 'connect'
  method: String',
  data:	Object/String/ArrayBuffer,
  header: Object,
  dataType: String,
  responseType: String,
  cancelToken: CancelToken
}
```
[min program native config][1]


## Instance defaults

```js
request.defaults.baseURL = 'https://api.example.com';
request.defaults.headers.common['Authorization'] = AUTH_TOKEN;
```

## Concurrency
You can limit request concurrency.

```js
//Only modifying the prototype is valid, default 10
request.Request.defaults.concurrency = 10
```

## Interceptors

You can intercept requests or responses before they are handled by `then` or `catch`.

```js
// Add a request interceptor
request.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
request.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
  }, function (error) {
    // Do something with response error
    return Promise.reject(error);
  });
```

If you may need to remove an interceptor later you can.

```js
var myInterceptor = request.interceptors.request.use(function () {/*...*/});
request.interceptors.request.eject(myInterceptor);
```

## Cancellation

You can cancel a request using a *cancel token*.

You can create a cancel token using the `CancelToken.source` factory as shown below:

```js
var CancelToken = request.CancelToken;
var source = CancelToken.source();

request.get('/user/12345', {
  cancelToken: source.token
}).catch(function(thrown) {
  if (request.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
    // handle error
  }
});

// cancel the request (the message parameter is optional)
source.cancel('Operation canceled by the user.');
```

You can also create a cancel token by passing an executor function to the `CancelToken` constructor:

```js
var CancelToken = request.CancelToken;
var cancel;

request.get('/user/12345', {
  cancelToken: new CancelToken(function executor(c) {
    // An executor function receives a cancel function as a parameter
    cancel = c;
  })
});

// cancel the request
cancel();
```


  [1]: https://mp.weixin.qq.com/debug/wxadoc/dev/api/network-request.html