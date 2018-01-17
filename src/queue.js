import { isFunction } from './util.js'

let working = null

class Queue {
  constructor(max) {
    this.executing = [] //执行队列
    this.waiting = []   //等待队列
    this.immediately = []  //即将执行队列
    this.num = 0
    this.max = max
  }
  getMax() {
    return isFunction(this.max) ? this.max() : max
  }
  push(request) {
    let id = ++this.num    
    let task = function () {
      return new Promise(request).then(() => {
        this.complete(id)
      })
    }
    task.id = id
    this.waiting.push(task)
    this.arrange()
    return id
  }
  arrange() {
    if (this.executing.length + this.immediately.length < this.getMax() && this.waiting.length) {
      this.immediately.push(this.waiting.shift())
      if (!working) {
        working = true
        Promise.resolve(this).then((context) => {
          context.work()
        })
      }
    }
  }
  work() {
    for (var i = 0; i < this.immediately.length; i++) {
      let task = {
        promise: this.immediately[i].call(this),
        id: this.immediately[i].id
      } 
      this.executing.push(task)
    }
    this.immediately = [];
    working = false;
  }
  complete(id) {
    for (let i = 0, l = this.executing.length; i < l; i++) {
      if (id === this.executing[i].id) {
        this.executing.splice(i, 1)
        this.arrange()
        return
      }
    }
  }
}

export default Queue