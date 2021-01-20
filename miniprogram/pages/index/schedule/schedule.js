var app = getApp();
import {
    showErrorModal
} from '../../../utils/index.js';
let db = wx.cloud.database({
    env: 'release-5gt6h0dtd3a72b90'
});
Page({
    data: {
        dialogTitle: "",
        dialogShow: false,
        dialogContent: "",
        dialogButtons: [{
            text: '确定'
        }],
        scheduleArr: [],
        mindStatus: 0,
        currentWeekNum: 0,
        dayOfTheWeek: 0,
        trueWeekNum: 0,
        stringifyScheduleData: null, // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
        //2021年1月20日 tuip123 picker
        pickerDialog: false,
        pickervalue: '0',
        pickervaluetemp: '',
        pickerid: 0,
        items: [
            {
                name: '1',
                value: 'week1'
            },
            {
                name: '2',
                value: 'week2'
            },
            {
                name: '3',
                value: 'week3'
            },
            {
                name: '4',
                value: 'week4'
            },
            {
                name: '5',
                value: 'week5'
            },
            {
                name: '6',
                value: 'week6'
            },
            {
                name: '7',
                value: 'week7'
            },
            {
                name: '8',
                value: 'week8'
            },
            {
                name: '9',
                value: 'week9'
            },
            {
                name: '10',
                value: 'week10'
            },
            {
                name: '11',
                value: 'week11'
            },
            {
                name: '12',
                value: 'week12'
            },
            {
                name: '13',
                value: 'week13'
            },
            {
                name: '14',
                value: 'week14'
            },
            {
                name: '15',
                value: 'week15'
            },
            {
                name: '16',
                value: 'week16'
            },
            {
                name: '17',
                value: 'week17'
            },
            {
                name: '18',
                value: 'week18'
            },
            {
                name: '19',
                value: 'week19'
            },
            {
                name: '20',
                value: 'week20'
            },
        ]
    },
    async onLoad() {
        //今天星期几
        const nowDate = new Date();
        let dayOfTheWeek = nowDate.getDay(); //获取当前星期X(0-6,0代表星期天)
        dayOfTheWeek = dayOfTheWeek == 0 ? 7 : dayOfTheWeek;

        const {
            schedule
        } = app.globalData.studyData;

        const weekNum = app.globalData.weekNum;
        this.setData({
            pickerid:weekNum-1,
            currentWeekNum: weekNum,
            dayOfTheWeek: dayOfTheWeek,
            trueWeekNum: weekNum,
            // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
            stringifyScheduleData: JSON.stringify(schedule)
        });
        if (schedule) {
            // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
            this.initData(JSON.parse(this.data.stringifyScheduleData), weekNum);
        } else {
            //TODO 无数据提示
        }
        this.setData({
            mindStatus: await this.isNeedScheduleRemind()
        })
    },
    async isNeedScheduleRemind() {
        try {
            const userInfoRes = await db.collection('studyData').where({
                _openid: app.globalData._openid,
            }).get();
            return userInfoRes.data[0].needScheduleRemind
        } catch (e) {
            showErrorModal("获取提醒状态失败", e)
            return false
        }
    },
    tapLeftButton() {
        let {
            currentWeekNum
        } = this.data;
        currentWeekNum > 1 && currentWeekNum--;
        // const { schedule } = app.globalData.studyData;
        // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
        this.initData(JSON.parse(this.data.stringifyScheduleData), currentWeekNum);
        this.setData({
            currentWeekNum: currentWeekNum
        });
    },
    tapRightButton() {
        let {
            currentWeekNum
        } = this.data;
        currentWeekNum > 0 && currentWeekNum++;
        // const { schedule } = app.globalData.studyData;
        // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
        this.initData(JSON.parse(this.data.stringifyScheduleData), currentWeekNum);
        this.setData({
            currentWeekNum: currentWeekNum
        });
    },
    tapOneSchedule(e) {
        const schedule = e.currentTarget.dataset.schedule;
        if (schedule.name == ' ') {
            //没有课
            return;
        }
        const {
            name,
            place,
            teacher,
            section,
            time,
            weeks_text
        } = schedule;
        let content = "课程名：" + name + "\n教室：" + place + "\n老师：" + teacher + "\n节数：" + section + "\n时间：" + time + "\n周数：" + weeks_text;
        this.setData({
            dialogTitle: "课程信息",
            dialogShow: true,
            dialogContent: content,
        });
    },
    async remindChange() {
        wx.showLoading({
            title: '正在设置',
        })
        try {
            const getUnionid = await wx.cloud.callFunction({
                name: "getUnionid"
            })
            const _unionid = getUnionid.result
            //只有存在_unionid（关注公众号后）
            if (_unionid.length > 0) {
                //通过unionid查询openidGZH
                const openidGZHResp = await db.collection('userGZH').where({
                    _unionid
                }).get()
                if (app.globalData.userInfo.isOldUser) {
                    //2020年12月5日 tuip123 判断是不是老用户
                    this.showOldUserModel()
                    wx.hideLoading();
                    return;
                } else
                if (openidGZHResp.data.length === 0) {
                    // 2020.12.3 kang 处理马上取关了公众号，但小程序unionid还有缓存的时候
                    this.showSubscribeModal();
                    return;
                }
                const _openidGZH = openidGZHResp.data[0]._openid
                //查询user表里有无该对象
                const usertemp = await db.collection('user').where({
                    _unionid,
                    _openidGZH
                }).get()
                //如果没有就更新进去
                if (usertemp.data.length === 0) {
                    await db.collection('user').where({
                        _openid: app.globalData._openid
                    }).update({
                        data: {
                            _unionid,
                            _openidGZH
                        }
                    })
                }
                if (!this.data.mindStatus) {
                    try {
                        await db.collection('studyData').where({
                            _openid: app.globalData._openid,
                        }).update({
                            data: {
                                needScheduleRemind: true
                            }
                        });
                        this.setData({
                            mindStatus: !this.data.mindStatus
                        });
                        wx.hideLoading();
                        wx.showModal({
                            title: '成功',
                            content: '你已经开启提醒服务，请注意“高校灯塔”的消息推送哦',
                            showCancel: false,
                        });
                    } catch (e) {
                        showErrorModal('设置提醒失败', e);
                    }
                } else {
                    try {
                        await db.collection('studyData').where({
                            _openid: app.globalData._openid,
                        }).update({
                            data: {
                                needScheduleRemind: false
                            }
                        });
                        this.setData({
                            mindStatus: !this.data.mindStatus
                        });
                        wx.hideLoading();
                        wx.showModal({
                            title: '成功',
                            content: '你已经取消提醒',
                            showCancel: false,
                        });
                    } catch (e) {
                        showErrorModal('取消提醒失败', e);
                    }
                }
            } else {
                this.showSubscribeModal();
            }
        } catch (e) {
            wx.hideLoading();
            showErrorModal('提醒功能出错', e);
        }
    },
    showSubscribeModal() {
        wx.hideLoading();
        wx.showModal({
            title: '提示',
            content: '由于小程序限制，发布课程提醒需要依赖“高校灯塔”公众号推送，关注后能获取更完整的服务哦',
            confirmText: '去关注',
            success(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                        url: '/pages/subscribeGZH/subscribeGZH'
                    });
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    showOldUserModel() {
        wx.showModal({
            title: '提示',
            content: '检测到您是老用户，请先在 "高校灯塔" 公众号回复 "1" 才能正常使用提醒功能噢~',
            cancelText: '取消',
            confirmText: '我已发送',
            success(res) {
                if (res.confirm) {
                    app.getUserInfo();
                    wx.reLaunch({
                        url: '/pages/index/index',
                    });
                }
            }
        });
    },
    //2021年1月20日 tuip123 点击周数按钮 唤起一个picker
    //TODO 暂时先做成这个样子，正在研究自定义picker样式怎么做
    clickcurrentWeekNum(e) {
        let currentWeekNum = parseInt(e.detail.value) + 1;
        this.initData(JSON.parse(this.data.stringifyScheduleData), currentWeekNum);
        this.setData({
            currentWeekNum: currentWeekNum
        });
    },
    click: function (e) {
        let pickerid = e.currentTarget.dataset.id
        this.setData({
            pickerid: pickerid
        })
    },
    radioChange: function (e) {
        this.setData({
            pickervaluetemp: e.detail.value
        })
    },
    toggleDialog() {
        this.setData({
            pickerDialog: !this.data.pickerDialog
        });
    },
    freeBack: function () {
        if (this.data.pickervalue != this.data.pickervaluetemp) {
            this.setData({
                pickervalue: this.data.pickervaluetemp
            })
        }
        this.setData({
            pickerDialog: !this.data.pickerDialog
        })
        console.log(parseInt(this.data.pickervalue));
        let currentWeekNum=parseInt(this.data.pickervalue)
        this.initData(JSON.parse(this.data.stringifyScheduleData), currentWeekNum);
        this.setData(
            {currentWeekNum : currentWeekNum}
        )
    },
    freetoBack: function () {
        this.setData({
            pickerDialog: !this.data.pickerDialog
        })
    },

    initData(data, weekNum) {
        let scheduleArr = data.schedule;
        //周六日先不要了
        scheduleArr.splice(5, 2);
        for (let a = 0; a < scheduleArr.length; a++) {
            const daySceArr = scheduleArr[a];
            for (let b = 0; b < daySceArr.length; b++) {
                const timeSceArr = daySceArr[b];
                let noNum = 0;
                //2020年11月29日 tuip123 记录要删除的位置
                let timeTemp = 0
                for (let c = 0; c < timeSceArr.length; c++) {
                    const schedule = timeSceArr[c];
                    //看是否含本周
                    let {
                        weeks_arr
                    } = schedule;
                    if (weeks_arr.indexOf(weekNum) == -1) {
                        //不含就去掉
                        noNum++;
                        //2020年11月29日 tuip123 记录要删除的位置
                        //2020年11月30日 tuip123 只有在第一次才记录，之后都在第一次的位置往后删
                        if (noNum == 1) {
                            timeTemp = c
                        }

                    }

                }
                //不含就去掉
                scheduleArr[a][b].splice(timeTemp, noNum);

            }
        }
        //再优化一下
        for (let a = 0; a < scheduleArr.length; a++) {
            const daySceArr = scheduleArr[a];
            for (let b = 0; b < daySceArr.length; b++) {
                const timeSceArr = daySceArr[b];
                //空数组改成name为空格的字典
                if (timeSceArr.length == 0) {
                    scheduleArr[a][b] = {
                        'name': ' '
                    }
                } else {
                    //非空数组，改成数组中的第一节课，并且把课的name限制在12个字内
                    timeSceArr[0].name = timeSceArr[0].name.substr(0, 12) //切掉12个字后面的内容
                    scheduleArr[a][b] = timeSceArr[0]
                }
            }
        }
        this.setData({
            scheduleArr: scheduleArr
        });
    },
    tapDialogButton() {
        this.setData({
            dialogShow: false,
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