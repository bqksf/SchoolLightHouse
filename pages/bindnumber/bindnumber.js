var app = getApp();
const AV = require('../../utils/av-weapp-min.js');
import { showErrorModal } from '../../utils/index.js';
var isLoginCryptOk = 0;
var avUser = null;//存放user变量
var isBindOKButNotMessage = 0;//绑定成功但是短信验证码错误
Page({
    data: {
        stuid: "",
        password: "",
        phoneNo: "",
        phoneCode: "",
        codeButtonTitle: "获取验证码",
        codeButtonDisabled: "weui-vcode-btn_hover",
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onShow() {
        avUser = AV.User.current();
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
            showErrorModal("手机号不能为空");
            return false;
        }
        if (!/^1[345678]\d{9}$/.test(this.data.phoneNo)) {
            //请填写正确手机号
            showErrorModal("请填写正确手机号");
            return false;
        }
        if (this.data.codeButtonDisabled == "weui-vcode-btn_hover") {
            this.savePhoneNoAndSendCode();
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
    },
    savePhoneNoAndSendCode() {
        //更新用户属性
        avUser.setMobilePhoneNumber(this.data.phoneNo).save().then(() => {
            //发送验证码 - 新版本已不需要下面，不然会重复发送
            //return AV.User.requestMobilePhoneVerify(avUser.getMobilePhoneNumber());
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    bindGetUserInfo() {
        //判断是不是23点后绑定
        var now = new Date();
        const hour = now.getHours();
        if (hour == 23 || hour <= 7) {
            showErrorModal('23点后因教务系统关闭，暂不能绑定！');
            return ;
        }
        let that = this;
        wx.showLoading({
            title: "绑定中"
        });
        if (isLoginCryptOk == 0) {
            isLoginCryptOk = app.globalData.user.avatarUrl ? 1 : 0;
        }
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    if (isLoginCryptOk == 1) {
                        //已经解密并存到数据库了。不能再解密了
                        that.readyBind();
                    } else {
                        wx.getUserInfo({
                            success(res) {
                                //console.log(res.userInfo)
                                var paramsJson = {
                                    encrypted_data: res.encryptedData,
                                    iv: res.iv
                                };
                                AV.Cloud.run('getInfoInWechat', paramsJson).then(union_id => {
                                    isLoginCryptOk = 1;
                                    if (union_id != 0) {
                                        AV.User.loginWithWeappWithUnionId(union_id, {
                                            asMainAccount: true
                                        });
                                        avUser = AV.User.current();
                                    }
                                    that.readyBind();
                                }).catch(error => {
                                    wx.hideLoading();
                                    showErrorModal(error.message);
                                });
                            }
                        });
                    }
                } else {
                    wx.hideLoading();
                    showErrorModal("绑定需要您的信息，请允许微信授权。");
                }
            }
        })
    },
    readyBind() {
        //验证输入的内容
        if (!(this.data.phoneNo || this.data.phoneCode || this.data.stuid || this.data.password)) {
            //是否为空
            showErrorModal("内容不能为空");
            wx.hideLoading();
            return false;
        }
        if (!/\b\d{12}\b/.test(this.data.stuid)) {
            //填写正确学号
            showErrorModal("请填写正确学号");
            wx.hideLoading();
            return false;
        }
        this.startBind(this.data.stuid, this.data.password);
    },
    startBind(stuid, password) {
        //提交注册
        if (isBindOKButNotMessage == 1) {
            this.verifyMobilePhoneMessage();
        } else {
            const json_data = {
                stuID: stuid,
                stuPassword: password
            };
            avUser.set(json_data).save().then(() => {
                app.globalData.firstlogin = 0;
                //访问获取第一次学习数据
                const paramsJson = {
                    is_register: 1
                };
                return AV.Cloud.run('saveOneStudyData', paramsJson);
            }).then(() => {
                //已返回数据，无论返回什么，都成功绑定了
                isBindOKButNotMessage = 1;
                this.verifyMobilePhoneMessage();
            }).catch(error => {
                wx.hideLoading();
                showErrorModal(error.message);
            });
        }

    },
    verifyMobilePhoneMessage() {
        //验证验证码
        AV.User.verifyMobilePhone(this.data.phoneCode).then(() => {
            wx.showToast({
                title: "绑定成功",
                icon: 'success',
                mask: true,
                duration: 1000,
                complete() {
                    app.login();
                    wx.hideLoading();
                    wx.navigateBack();
                }
            });
        }).catch(() => {
            showErrorModal('验证码不正确！');
            wx.hideLoading();
            // console.log('验证码不正确 - 测试模式')
        });
    }
});