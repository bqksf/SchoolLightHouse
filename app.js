import request from '/utils/request.js';

App({
  /* 全局数据区 */
  globalData: {
    firstlogin: 1,
    userOpenid: "",
    userSK: "a4d456c728303e7a67f81f135af88cb2",
    appID: "wx192c11ca6a1e5f22",
    appSecert: "852b336aed0f299c336807fced14ae35",
    studentInfoData: null,
    needChangePassword: 0,
    studyData: null
  },
  /* app.js全局启动前 */
  onLaunch() {
    //获取openid
    this.globalData.userOpenid = wx.getStorageSync('openid') || "";
    !this.globalData.userOpenid && this.getUserOpenid();
    //获取用户信息
    this.getUserInfoData();
  },
  /* 函数区 */
  getUserInfoData() {
    request.get('Student.getStudentInfo', {
      openid: this.globalData.userOpenid
    }).then(res => {
      this.globalData.studentInfoData = res;
      this.globalData.firstlogin = !res.stuID ? 1 : 0;
      this.globalData.needChangePassword = parseInt(res.needChangePass);
      if (this.globalData.firstlogin == 0) {
        //获取学习数据
        const SD = wx.getStorageSync('studyData') || "";
        const nowTime = Math.round(new Date().getTime() / 1000);
        //如果缓存大于一天或SD为null，就更新数据
        if (((nowTime - SD.addStorTime) > 86400) || !SD) {
          request.get('Studydata.GetOneStudyData', {
            openid: this.globalData.userOpenid
          }).then(rs => {
            this.globalData.studyData = rs;
            rs.addStorTime = Math.round(new Date().getTime() / 1000);
            wx.setStorage({
              key: 'studyData',
              data: rs
            });
            res.studyData = rs;
            if (this.userInfoReadyCallback) {
              this.userInfoReadyCallback(res);
            }
          }).catch();
        } else {
          this.globalData.studyData = SD;
          res.studyData = SD;
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res);
          }
        }
      }
    }).catch();
  }
  ,
  getUserOpenid() {
    wx.login({
      success: res => {
        if (res.code) {
          request.get('Student.APPgetOpenid', {
            code: res.code
          }).then(res => {
            console.log("wxlogin.code请求Openid", res);
            this.globalData.userOpenid = res.openid;
            wx.setStorageSync('openid', res.openid);
            this.globalData.firstlogin = res.firstlogin;
            this.getUserInfoData();
          }).catch();
        } else {
          console.log("从微信服务器获取用户登录wxlogin.code失败！" + res.errMsg);
          this.errorMsg("错误", "从微信服务器获取用户登录code失败");
        }
      },
      fail: () => {
        console.log("用户wxlogin无网络" + res.errMsg);
        this.errorMsg("错误", "您的网络环境可能存在问题，请检查");
      }
    });
  }
})