var app = getApp();
import {
    formatDate
} from "../../../utils/study-date.js";
import {
    showErrorModal
} from "../../../utils/index.js";
let db = wx.cloud.database({
    env: 'release-5gt6h0dtd3a72b90'
});
Page({
    data: {
        examArr: [],
        mindStatus: false,
        yearTitle: ""
    },
    async onLoad() {
        const {
            examTime
        } = app.globalData.studyData;
        if (examTime) {
            this.initData(examTime);
        } else {
            //TODO 无数据提示
        }
        this.setData({
            mindStatus:await this.isNeedExamRemind()
        })
    },

    async isNeedExamRemind() {
        try {
            const userInfoRes = await db.collection('studyData').where({
                _openid: app.globalData._openid,
            }).get();
            return userInfoRes.data[0].needExamRemind
        } catch (e) {
            showErrorModal("获取提醒状态失败",e)
            return false
        }
    },
    tapIcon() {
        this.setData({
            mindStatus: !this.data.mindStatus
        });
        this.remindChange();
    },
    async remindChange() {
        //showErrorModal('此功能即将开放，考试前会在高校灯塔公众号提醒你～');
        wx.showLoading({
          title: '正在设置',
        })
        const getUnionid = await wx.cloud.callFunction({
            name: "getUnionid"
        })
        const _uniconid = getUnionid.result
        if (_uniconid.length > 0) {
            wx.hideLoading({})
            if (this.data.mindStatus) {
                wx.showModal({
                    title: '成功',
                    content: '你已经开启提醒服务，请注意“高校灯塔”的消息推送哦',
                    showCancel: false,
                })
                try {
                    await db.collection('studyData').where({
                        _openid: app.globalData._openid,
                    }).update({
                        data: {
                            needExamRemind: true
                        }
                    });
                } catch (e) {
                    showErrorModal('设置提醒失败', e);
                }
            } else {
                wx.showModal({
                    title: '成功',
                    content: '你已经取消提醒',
                    showCancel: false,
                })
                try {
                    await db.collection('studyData').where({
                        _openid: app.globalData._openid,
                    }).update({
                        data: {
                            needExamRemind: false
                        }
                    });
                } catch (e) {
                    showErrorModal('取消提醒失败', e);
                }

            }
        } else {
            wx.hideLoading({})
            wx.showModal({
                title: '提示',
                content: '由于小程序限制，发布考试提醒需要依赖“高校灯塔”公众号推送，关注后能获取更完整的服务哦',
                confirmText: '去关注',
                success(res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }
    },
    initData(data) {
        const dataKeysArr = Object.keys(data);
        const yearTitle = dataKeysArr[0];
        const sectionExamArr = data[yearTitle];
        //在今天考试的突出显示
        const today = formatDate(new Date()); // y/m/d转成y-m-d的样式
        let have = 0,
            index = 0;
        sectionExamArr.forEach(exam => {
            const examDay = exam.day;
            if (examDay) {
                if (examDay == today) {
                    exam.isNow = 1;
                    have = 1;
                }
                index++;
            }
        });
        //全部循环还没有跟今天相等，默认把第一个突出
        if (index > 0) {
            //至少有一个课程有考试时间
            const lastDay = (new Date(sectionExamArr[index - 1].day)).getTime(); //最后一个有时间的
            const nowTime = new Date().getTime();
            if (have == 0 && nowTime - lastDay < 0) {
                sectionExamArr[0].isNow = 1;
            }
        } else {
            //没有课程有考试时间
            //直接第一个突出
            sectionExamArr[0].isNow = 1;
        }

        this.setData({
            examArr: sectionExamArr,
            yearTitle: yearTitle
        });
    },
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