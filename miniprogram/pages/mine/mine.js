var app = getApp();

Page({
    data: {
        studentInfo: {
            image: "/images/user.png",
            name: "未注册",
        },
        navigateTitle: "教务系统",
        navigateUrl: "../mine/esInfo/esInfo",
        kefuWechat: ''
    },
    onShow() {
        !app.globalData.firstlogin && (this.getStudentInfo());
        this.setData({
            navigateTitle: app.globalData.isNoBind === true || app.globalData.firstlogin ? '未绑定教务系统' : '教务系统',
            navigateUrl: app.globalData.isNoBind === true || app.globalData.firstlogin ? '/pages/register/register' : '../mine/esInfo/esInfo',
            kefuWechat: app.globalData.kefuWechat ? app.globalData.kefuWechat : 'skye889900'
        });
    },
    getStudentInfo() {
        // 绑定后的返回我的界面来不及读取global，会造成空值
        this.setData({
            studentInfo: {
                image: app.globalData.userInfo.avatarUrl || "/images/user.png",
                name: app.globalData.userInfo.name || "绑定成功"
            }
        });
    },
    tapHead() {
        app.globalData.isNoBind === true || app.globalData.firstlogin ? wx.navigateTo({
            url: '/pages/register/register'
        })
            :
            console.log('修改头像和名字功能待添加');// TODO
    },
    // clearStorage() {
    //     wx.showModal({
    //         title: "确认清除数据？",
    //         content: "清除数据将清除课表查询记录以及校园卡绑定记录，同时清除成绩、课表等信息",
    //         confirmColor: "#e64340",
    //         success: function (t) {
    //             t.confirm && (wx.clearStorage(), wx.showToast({
    //                 title: "数据已清除",
    //                 icon: "success",
    //                 duration: 2e3,
    //                 complete() {
    //                     wx.reLaunch({
    //                         url: "/pages/index/index"
    //                     });
    //                 }
    //             }));
    //         }
    //     });
    // },
    // unbindNumber() {
    //     wx.showModal({
    //         title: "确认解绑学号？",
    //         content: "解绑学号后将不能自动登录教务系统，也不能显示相关课程、成绩、考试安排等信息",
    //         confirmColor: "#e64340",
    //         success: function (t) {
    //             t.confirm && (wx.clearStorage(), wx.showToast({
    //                 title: "数据已清除",
    //                 icon: "success",
    //                 duration: 2e3,
    //                 complete() {
    //                     wx.reLaunch({
    //                         url: "/pages/index/index"
    //                     });
    //                 }
    //             }));
    //         }
    //     });
    // },
    onShareAppMessage() {
        return {
            title: "高校灯塔(小程序)",
            path: "pages/index/index",
            success: function (t) {
                wx.showToast({
                    title: "分享成功",
                    icon: "success",
                    mask: !0
                });
            }
        };
    }
});