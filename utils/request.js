/* 封装了wxrequest
request.get('/aaa', {
    a: 0,
    b: 1
  }).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  }) */

class Request {
    constructor (parms) {
      this.withBaseURL = parms.withBaseURL
      this.baseURL = parms.baseURL
    }
    get (url, data) {
      return this.request('GET', url, data)
    }
/*     post (url, data) {
      return this.request('POST', url, data)
    }
    put (url, data) {
      return this.request('PUT', url, data)
    } */
    errorMsg(content) {
      wx.showModal({
        title: "错误",
        content: content,
        confirmColor: "#171a20",
        showCancel: !1
      });
    }
    request (method, url, data) {
      const vm = this
      return new Promise((resolve, reject) => {
        wx.request({
          url: vm.withBaseURL ? vm.baseURL + url : url,
          data,
          method,
          success (res) {
            let resp = res.data;
            if (resp.ret == 200) {
              resolve(resp.data)
            }
            else {
              vm.errorMsg(resp.msg);
            }
          },
          fail (e) {
            console.log("用户request无响应" + e.errMsg)
            vm.errorMsg("网络环境可能存在问题，请检查" + e.errMsg)
            reject(e)
          }
        })
      })
    }
  }
  
  const request = new Request({
    // baseURL: 'https://tatestapi.pykky.com/?s=',
    baseURL: 'https://takeawayapi.pykky.com/?s=',
    withBaseURL: true
  })
  
  export default request