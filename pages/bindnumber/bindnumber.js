var app = getApp();
import request from '../../utils/request.js'
var isLoginCryptOk = 0;

Page({
    data: {
        stuid: "",
        password: "",
        phoneNo: "",
        phoneCode: "",
        dialogTitle: "错误",
        dialogContent: "",
        dialogShow: false,
        dialogButtons: [{ text: '确定' }],
        codeButtonTitle: "获取验证码",
        codeButtonDisabled: "weui-vcode-btn_hover",
        codeID: "",
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    phoneNoKeyInput(e) {
        this.setData({
            phoneNo: e.detail.value
        });
    },
    phoneCodeKeyInput(e) {
        this.setData({
            phoneCode: e.detail.value
        });
    },
    stuidKeyInput(e) {
        this.setData({
            stuid: e.detail.value
        });
    },
    passwordKeyInput(e) {
        this.setData({
            password: e.detail.value
        });
    },
    tapCodeButton() {
        if (!this.data.phoneNo) {
            this.setData({
                dialogShow: true,
                dialogContent: "手机号不能为空"
            });
        } else {
            if (this.data.codeButtonDisabled == "weui-vcode-btn_hover") {
                this.sendCode();
                //设置倒计时
                let time = 60;
                let timer = setInterval(() => {
                    if (time == 0) {
                        clearInterval(timer);
                        this.setData({
                            codeButtonTitle: "获取验证码",
                            codeButtonDisabled: "weui-vcode-btn_hover"
                        });
                    } else {
                        // 倒计时
                        this.setData({
                            codeButtonTitle: time + "秒后重试",
                            codeButtonDisabled: "none"
                        });
                        time--;
                    }
                }, 1000);
            }
        }
    },
    sendCode() {
        //发送验证码
        request.get('Student.SendMessage', {
            phoneNo: this.data.phoneNo
        }).then(res => {
            this.setData({
                codeID: res.codeID
            });
        }).catch();
    },
    bindGetUserInfo() {
        let that = this;
        wx.showLoading({
            title: "绑定中"
        });
        if (isLoginCryptOk == 0) {
            isLoginCryptOk = app.globalData.studentInfoData.phoneNo ? 1 : 0;
        }
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    if (isLoginCryptOk == 1) {
                        //已经解密并存到数据库了。不能再解密了
                        that.bindBindBtn();
                    } else {
                        wx.getUserInfo({
                            success(res) {
                                //console.log(res.userInfo)
                                request.get('Student.getInfoInWechat', {
                                    openid: app.globalData.userOpenid,
                                    encryptedData: res.encryptedData,
                                    iv: res.iv
                                }).then(res => {
                                    if (res == "ok") {
                                        isLoginCryptOk = 1;
                                        that.bindBindBtn();
                                    } else {
                                        wx.hideLoading();
                                        that.setData({
                                            dialogShow: true,
                                            dialogContent: res
                                        });
                                    }
                                }).catch();
                            }
                        });
                    }
                } else {
                    wx.hideLoading();
                    that.setData({
                        dialogShow: true,
                        dialogContent: "绑定需要您的信息，请允许微信授权。"
                    });
                }
            }
        })
    },
    tapDialogButton() {
        //在确定按钮执行返回页面tapDialogButton
        if (this.data.dialogShow && this.data.dialogContent == "已绑定成功，但未能成功获取教务数据") {
            wx.navigateBack();
        }else{
            this.setData({
                dialogShow: false,
            });
        }
    },
    bindBindBtn() {
        //验证输入的内容
        if (!(this.data.phoneNo || this.data.phoneCode || this.data.stuid || this.data.password)) {
            //是否为空
            this.setData({
                dialogShow: true,
                dialogContent: "内容不能为空"
            });
            wx.hideLoading();
            return false;
        }
        if (!/^1[345678]\d{9}$/.test(this.data.phoneNo)) {
            //请填写正确手机号
            this.setData({
                dialogShow: true,
                dialogContent: "请填写正确手机号"
            });
            wx.hideLoading();
            return false;
        }
        if (!/\b\d{12}\b/.test(this.data.stuid)) {
            //填写正确学号
            this.setData({
                dialogShow: true,
                dialogContent: "请填写正确学号"
            });
            wx.hideLoading();
            return false;
        }
        this.startBind(app.globalData.userOpenid, this.data.phoneNo, this.data.phoneCode, this.data.stuid, this.data.password, this.data.codeID);
    },
    startBind(openid, phoneNo, phoneCode, stuid, password, codeID) {
        //提交注册
        request.get('Student.StudentReg', {
            phoneNo: phoneNo,
            loginCode: phoneCode,
            codeID: codeID,
            stuID: stuid,
            password: password,
            openid: openid
        }).then(res => {
            if (res == "ok") {
                app.globalData.firstlogin = 0;
                //访问获取第一次学习数据
                request.get('Studydata.UpdateOneStudyData', {
                    openid: app.globalData.userOpenid
                }).then(() => {
                    //已返回数据，无论返回什么，都成功
                    wx.showToast({
                        title: "绑定成功",
                        icon: 'success',
                        mask: true,
                        duration: 1000,
                        complete() {
                            app.getUserInfoData();
                            wx.hideLoading();
                            wx.navigateBack();
                        }
                    });
                }).catch(() => {
                    //请求失败，已绑定，但是没有获取数据，做出提示
                    wx.hideLoading();
                    this.setData({
                        dialogShow: true,
                        dialogContent: '已绑定成功，但未能成功获取教务数据'
                    });
                    //在确定按钮执行返回页面tapDialogButton
                }
                );
            } else {
                wx.hideLoading();
                this.setData({
                    dialogShow: true,
                    dialogContent: res
                });
            }
        }).catch();
    }
});