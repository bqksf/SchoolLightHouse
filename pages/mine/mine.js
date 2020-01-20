var app = getApp();
import request from '../../utils/request.js'

Page({
    data: {
        studentInfo: {
            image: "/images/user.png",
            name: "",
            stuid: "未绑定学号"
        },
        currentSize: 0,
    },
    onLoad() {
        this.getStorageNum(), this.getBindnumber();
    },
    onShow(){
        !app.globalData.firstlogin && (this.getStudentInfo());
    },
    getStudentInfo() {
        request.get('Student.GetStudentInfo', {
            openid: app.globalData.userOpenid
          }).then(res => {
            this.setData({
                studentInfo: {
                    image: res.avatar,
                    name: res.name,
                    stuid: res.stuID
                }
            });
            app.globalData.userInfo = res;
          }).catch();
    },
    tapHead() {
        this.data.studentInfo.stuid === "未绑定学号" ? wx.navigateTo({
            url: '/pages/bindnumber/bindnumber'
        })
            :
            console.log('功能待添加');
    },
    clearStorage() {
        wx.showModal({
            title: "确认清除数据？",
            content: "清除数据将清除课表查询记录以及校园卡绑定记录，同时清除成绩、课表等信息",
            confirmColor: "#e64340",
            success: function (t) {
                t.confirm && (wx.clearStorage(), wx.showToast({
                    title: "数据已清除",
                    icon: "success",
                    duration: 2e3,
                    complete() {
                        wx.reLaunch({
                            url: "/pages/index/index"
                        });
                    }
                }));
            }
        });
    },
    getStorageNum() {
        wx.getStorageInfo({
            success: e => {
                this.setData({
                    currentSize: e.currentSize
                });
            }
        });
    },
    getPromissionStatus() {
        wx.getSetting({
            success: e => {
                console.log(e.authSetting["scope.userInfo"]), e.authSetting["scope.userInfo"] && this.setData({
                    promissionStatus: !0
                });
            }
        });
    },
    getPromission() {
        wx.getUserInfo({
            success: e => {
                getApp().globalData.userInfo = e.userInfo, this.setData({
                    userInfo: getApp().globalData.userInfo
                });
            },
            error: t => {
                console.log(t);
            }
        });
    },
    unbindNumber() {
        wx.showModal({
            title: "确认解绑学号？",
            content: "解绑学号后将不能自动登录教务系统，也不能显示相关课程、成绩、考试安排等信息",
            confirmColor: "#e64340",
            success: function (t) {
                t.confirm && (wx.clearStorage(), wx.showToast({
                    title: "数据已清除",
                    icon: "success",
                    duration: 2e3,
                    complete() {
                        wx.reLaunch({
                            url: "/pages/index/index"
                        });
                    }
                }));
            }
        });
    },
    getBindnumber() {
        try {
            wx.getStorageSync("card_info") ? this.setData({
                isBinding: !0
            }) : this.setData({
                isBinding: !1
            });
        } catch (t) { }
    }
});