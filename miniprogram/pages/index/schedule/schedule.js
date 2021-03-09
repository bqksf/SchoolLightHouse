var app = getApp();
import {
    showErrorModal
} from '../../../utils/index.js';
let db = wx.cloud.database({
    env: 'release-5gt6h0dtd3a72b90'
});
Page({
    data: {
        theme: wx.getSystemInfoSync().theme,
        indexNum:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
        current: 0,
        dialogTitle: "",
        dialogShow: false,
        dialogContent: "",
        dialogButtons: [{
            text: '确定'
        }],
        scheduleArr: [],
        dayArr: [],
        mindStatus: 0,
        currentWeekNum: 0,
        swiperWeekNum:0,
        dayOfTheWeek: 0,
        trueWeekNum: 0,
        stringifyScheduleData: null, // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
        //2021年1月20日 tuip123 picker
        pickerDialog: false,
        pickerid: 0,
        items: [{
                name: '1',
                value: '1'
            },
            {
                name: '2',
                value: '2'
            },
            {
                name: '3',
                value: '3'
            },
            {
                name: '4',
                value: '4'
            },
            {
                name: '5',
                value: '5'
            },
            {
                name: '6',
                value: '6'
            },
            {
                name: '7',
                value: '7'
            },
            {
                name: '8',
                value: '8'
            },
            {
                name: '9',
                value: '9'
            },
            {
                name: '10',
                value: '10'
            },
            {
                name: '11',
                value: '11'
            },
            {
                name: '12',
                value: '12'
            },
            {
                name: '13',
                value: '13'
            },
            {
                name: '14',
                value: '14'
            },
            {
                name: '15',
                value: '15'
            },
            {
                name: '16',
                value: '16'
            },
            {
                name: '17',
                value: '17'
            },
            {
                name: '18',
                value: '18'
            },
            {
                name: '19',
                value: '19'
            },
            {
                name: '20',
                value: '20'
            },
        ],
        //2021年1月22日 tuip123 swiper容器
        swiperitems:[],
        //2021年1月26日 微风 swiper数据内容
        //2021年1月26日 tuip123 发现其实可以不用这个数组，秉承废物利用原则修改为存储周属日期的数组
        sitems:[],
        //2021年1月27日 tuip123 timetable时间表
        timeTable:[],
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
        //2021年1月21日 tuip123 判断是否为假日，假日则显示第一周
        let pickerid, currentWeekNum,swiperWeekNum;
        if (this.isHoliday()) {
            pickerid = 0;
            currentWeekNum = 1;
            swiperWeekNum=0
        } else {
            pickerid = weekNum - 1;
            currentWeekNum = weekNum;
            swiperWeekNum=weekNum-1
        }
        this.setData({
            timeTable:app.globalData.schoolInfo.timeList,
            pickerid,
            currentWeekNum,
            dayOfTheWeek,
            swiperWeekNum,
            trueWeekNum: weekNum,
            // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
            stringifyScheduleData: JSON.stringify(schedule)
        });
        if (schedule) {
            this.setSwiper()
        } else {
            //TODO 无数据提示
        }
        this.setData({
            mindStatus: await this.isNeedScheduleRemind()
        })
    },

    //2021年1月21日 tuip123 设置周属日期
    setDayOfWeek(weekNum) {
        weekNum=weekNum-1
        let date = app.globalData.schoolInfo.startTime
        let mon = weekNum * 7 + 1;
        let tue = weekNum * 7 + 2;
        let wed = weekNum * 7 + 3;
        let thu = weekNum * 7 + 4;
        let fri = weekNum * 7 + 5;

        let mond = new Date(date.getTime() + 24 * 60 * 60 * 1000 * mon) //第k周的周一时间
        let tued = new Date(date.getTime() + 24 * 60 * 60 * 1000 * tue)
        let wedd = new Date(date.getTime() + 24 * 60 * 60 * 1000 * wed)
        let thud = new Date(date.getTime() + 24 * 60 * 60 * 1000 * thu)
        let frid = new Date(date.getTime() + 24 * 60 * 60 * 1000 * fri)

        let monday = {
            day: '周一',
            date: (mond.getMonth()+1)+'/'+mond.getDate()
        }
        let tuesday = {
            day: '周二',
            date: (tued.getMonth()+1)+'/'+tued.getDate()
        }
        let wednesday = {
            day: '周三',
            date: (wedd.getMonth()+1)+'/'+wedd.getDate()
        }
        let thursday = {
            day: '周四',
            date: (thud.getMonth()+1)+'/'+thud.getDate()
        }
        let firday = {
            day: '周五',
            date: (frid.getMonth()+1)+'/'+frid.getDate()
        }
        this.setData({dayArr: [monday, tuesday, wednesday, thursday, firday]}
            
        )
    },
    //2021年1月26日 tuip123 设置周属日期2 用于一次行生成20周的日期
    setDayOfWeek2(weekNum) {
        weekNum=weekNum-1
        let date = app.globalData.schoolInfo.startTime
        let mon = weekNum * 7 + 1;
        let tue = weekNum * 7 + 2;
        let wed = weekNum * 7 + 3;
        let thu = weekNum * 7 + 4;
        let fri = weekNum * 7 + 5;

        let mond = new Date(date.getTime() + 24 * 60 * 60 * 1000 * mon) //第k周的周一时间
        let tued = new Date(date.getTime() + 24 * 60 * 60 * 1000 * tue)
        let wedd = new Date(date.getTime() + 24 * 60 * 60 * 1000 * wed)
        let thud = new Date(date.getTime() + 24 * 60 * 60 * 1000 * thu)
        let frid = new Date(date.getTime() + 24 * 60 * 60 * 1000 * fri)

        let monday = {
            day: '周一',
            date: (mond.getMonth()+1)+'/'+mond.getDate()
        }
        let tuesday = {
            day: '周二',
            date: (tued.getMonth()+1)+'/'+tued.getDate()
        }
        let wednesday = {
            day: '周三',
            date: (wedd.getMonth()+1)+'/'+wedd.getDate()
        }
        let thursday = {
            day: '周四',
            date: (thud.getMonth()+1)+'/'+thud.getDate()
        }
        let firday = {
            day: '周五',
            date: (frid.getMonth()+1)+'/'+frid.getDate()
        }
        return [monday, tuesday, wednesday, thursday, firday]
    },
    //日期 swiper容器生成
    setSwiper(){
        //重复20周
        for(let i=1;i<21;i++){
            // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
            let scheduleArr= this.setSwiper2(JSON.parse(this.data.stringifyScheduleData), i);
            this.data.swiperitems.push(scheduleArr)
            let dayArr=this.setDayOfWeek2(i);
            this.data.sitems.push(dayArr)
        }
        //必须使用setData才能在页面渲染，不然显示值为空
        this.setData({
            swiperitems: this.data.swiperitems,
            sitems:this.data.sitems
        })
    },
    setSwiper2(data, weekNum) {
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

                //2021年1月22日 tuip123 判断上节课的section，优化外观
                if(b>0){
                    if(scheduleArr[a][b-1].section==4&&scheduleArr[a][b].name==' ')
                        {
                            scheduleArr[a].splice(b,1)
                            //2021年1月22日 tuip123 此处是因为splice后出现了降级现象，需要获取子数组里的0元素取代父数组中的位置 可见console.log(scheduleArr[a][b]);
                            if(scheduleArr[a][b][0])
                            {
                                scheduleArr[a][b]=scheduleArr[a][b][0]
                            }
                            else{
                                scheduleArr[a][b] = {
                                    'name': ' '
                                }
                            }
                        }
                }
            }
        }
        return scheduleArr
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
    //2021年1月21日 tuip123 获取是否是假期时间
    isHoliday() {
        return app.globalData.schoolInfo.isHoliday;
    },

    
    click: function (e) {
        // let pickerid = e.currentTarget.dataset.id
        // this.setData({
        //     pickerid: pickerid
        // })
    },
    radioChange: function (e) {
        let currentWeekNum = parseInt(e.detail.value)
        //this.initData(JSON.parse(this.data.stringifyScheduleData), currentWeekNum);
        //this.setDayOfWeek(currentWeekNum);
        this.setData({
            pickerDialog: !this.data.pickerDialog,
            //2021年1月26日 微风 swiper跳转
            current:e.detail.value-1,
            swiperWeekNum:e.detail.value-1
        })
    },
    toggleDialog() {
        this.setData({
            pickerDialog: !this.data.pickerDialog
        });
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

                //2021年1月22日 tuip123 判断上节课的section，优化外观
                if(b>0){
                    if(scheduleArr[a][b-1].section==4&&scheduleArr[a][b].name==' ')
                        {
                            scheduleArr[a].splice(b,1)
                            //2021年1月22日 tuip123 此处是因为splice后出现了降级现象，需要获取子数组里的0元素取代父数组中的位置 可见console.log(scheduleArr[a][b]);
                            if(scheduleArr[a][b][0])
                            {
                                scheduleArr[a][b]=scheduleArr[a][b][0]
                            }
                            else{
                                scheduleArr[a][b] = {
                                    'name': ' '
                                }
                            }
                        }
                }
            }
        }
        this.setData({
            scheduleArr: scheduleArr
        });
    },

    //测试
    swiperFinish(e){
        console.log(e)
        this.setData({
            currentWeekNum: e.detail.current+1,
            pickerid:e.detail.current
            })
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