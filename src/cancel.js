class Cancel {
  static __CANCEL__ = true
  constructor(message) {
    this.message = message;
  }
}


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

export default CancelToken