import { getWhichWeek } from "../../utils/study-date.js";
import request from '../../utils/request.js';
var app = getApp();

Page({
    data: {
        statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
        noClass: 1,
        showToolBox: 1,
        notice: "暂时没有通知",
        allModalStatus: '', //所有按钮统一提示功能
        todayClassNum: 1,
        weekClassNum: 0,
        scoreNum: 0,
        examNum: 0,
        bookNum: 0,
        weekNum: 0,
        todayClassArr: [],
        showFirstLogin: 1
    },
    onLoad() {
        //针对第一次进入页面
        if (!app.globalData.studyData) {
            app.userInfoReadyCallback = res => { //app.js异步回调方法，获取不到数据时使用
                const firstlogin = !res.stuID ? 1 : 0;
                if (firstlogin == 0) {
                    this.setData({
                        showFirstLogin: 0,
                        allModalStatus: '暂时没有通知'
                    });
                    if (parseInt(res.needChangePass) == 1) {
                        this.setData({
                            notice: "检测到您教务系统密码已更改，请到个人资料页修改为新密码才能继续使用",
                            allModalStatus: '密码错误'
                        });
                    } else {
                        this.initData(res.studyData);
                    }
                }else{
                    this.setData({
                        allModalStatus: '未绑定账号'
                    });
                }
            };
        }
    },
    onShow() {
        //针对反复进入页面
        if (app.globalData.firstlogin == 0) {
            this.setData({
                showFirstLogin: 0,
                allModalStatus: '暂时没有通知'
            });
            //检测密码
            if (app.globalData.needChangePassword == 1) {
                this.setData({
                    notice: "检测到您教务系统密码已更改，请到个人资料页修改为新密码才能继续使用",
                    allModalStatus: '密码错误'
                });
            } else {
                this.initData(app.globalData.studyData);
            }
        }
        if(app.globalData.firstlogin == 1){
            this.setData({
                allModalStatus: '未绑定账号'
            });
        }
    },
    initData(data) {
        if (data) {
            //第几周
        request.get('Schoolstatus.GetStartTime').then(res => {
            const startTime = res;
            const weekNum = getWhichWeek(startTime);
            //let weekNum = 15;
            this.setData({
                weekNum: weekNum
            });
            if (data.schedule) {
                //有课程数据
                //这一周有多少节课
                let weekClassNum = 0;
                const all_schedule = (JSON.parse(data.schedule))['schedule'];
                all_schedule.forEach(day_schedule => {
                    //每一周
                    day_schedule.forEach(section_schedule => {
                        //每一节
                        section_schedule.forEach(schedule => {
                            //每一课
                            if (schedule['weeks_arr'].indexOf(weekNum) != -1) {
                                weekClassNum++;
                            }
                        });
                    });
                });
                this.setData({
                    weekClassNum: weekClassNum
                });
                //今天星期几
                const nowDate = new Date();
                let dayOfTheWeek = nowDate.getDay();//获取当前星期X(0-6,0代表星期天)
                dayOfTheWeek = dayOfTheWeek == 0 ? 7 : dayOfTheWeek;
                //dayOfTheWeek = 3;
                //今日所有课程
                let todayClassNumI = 0;
                let todayScheduleDataArr = [];
                const day_schedule = (JSON.parse(data.schedule))['schedule'][dayOfTheWeek - 1];
                day_schedule.forEach(section_schedule => {
                    //周dayOfTheWeek的每一节
                    section_schedule.forEach(schedule => {
                        //每一课
                        if (schedule['weeks_arr'].indexOf(weekNum) != -1) {
                            todayClassNumI++;
                            todayScheduleDataArr.push(schedule);
                        }
                    });
                });
                //今日课程数
                if (todayClassNumI > 0) {
                    //整理课程数据添加到展示今日课表的array
                    //根据课表数创建今日课表的二维数组
                    let okArr = [];
                    for (let i = 0; i < todayClassNumI; i++) {
                        okArr.push(new Array());
                    }
                    let i = 0;
                    const schoolTimeStrArr = ["8:40 ~ 10:15", "10:25 ~ 12:00", "14:15 ~ 15:50", "16:00 ~ 17:20", "19:00 ~ 21:25"];//后期不同学校可以获取不同时间区间
                    schoolTimeStrArr.forEach(timeStr => {
                        //对于每一个时间取件
                        todayScheduleDataArr.forEach(scheduleData => {
                            if (timeStr == scheduleData.time) {
                                //每次都循环一遍每一个今日课表数据的时间，如果匹配上
                                okArr[i].push(scheduleData);
                            }
                        });
                        i++;
                    });
                    //设置展示的今日课程数和今日课表arr
                    this.setData({
                        todayClassNum: todayClassNumI,
                        todayClassArr: okArr,
                        noClass: 0
                    });
                }else{
                    this.setData({
                        todayClassNum: 1,
                        todayClassArr: [],
                        noClass: 1
                    });
                }
            }
            if (data.score) {
                //搬自score成绩查询页面，后期可能优化
                //构造以学期名字，内容为课程数据的对象
                let {score} = data;
                score = JSON.parse(score);
                let yearAndSectionObj = {};
                const dataKeysArr = Object.keys(score);
                dataKeysArr.forEach(year => {//有几年
                    let sectionArr = Object.keys(score[year]);
                    sectionArr.forEach(section => {//这一年有几学期
                        let sectionDataArr = score[year][section];
                        yearAndSectionObj[year + ' 第' + section + '学期'] = sectionDataArr;
                    });
                });
                //全部
                const allSectionKeysArr = Object.keys(yearAndSectionObj);
                let allSectionsArr = [];
                allSectionKeysArr.forEach(allSectionKey => {//每学期的所有课
                    const sectionDataArr = yearAndSectionObj[allSectionKey];
                    allSectionsArr.push.apply(allSectionsArr, sectionDataArr);//合并数组
                });
                const scoreNum = allSectionsArr.length;
                this.setData({
                    scoreNum: scoreNum
                })
            }
            //没有数据，服务器错误，交给点击按钮的时候再提示
        }).catch();
        }
    },
    tapSchoolCardButton(){
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            this.showNotComplete();
            return;
            if (!app.globalData.studyData.schedule) {
                this.wxShowModal(data.error + '，如有疑问请联系客服');
            }
        }
    },
    tapScheduleButton() {
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            this.showNotComplete();
            return;
            if (!app.globalData.studyData.schedule) {
                this.wxShowModal(data.error + '，如有疑问请联系客服');
            }
        }
    },
    tapScoreButton() {
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            if (!app.globalData.studyData.score) {
                /* this.wxShowModal(data.error + '，如有疑问请联系客服'); */
                this.wxShowModal('学校可能关闭了成绩查询接口，此功能会在成绩公布后开放，ps：此功能的目的不是为了第一时间查询成绩，而是对你的成绩做详细的数据分析，绘制出很多直观图表。');
            } else {
                wx.navigateTo({
                    url: '../score/score'
                });
            }
        }
    },
    tapExamButton() {
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            this.showNotComplete();
            return;
            if (!app.globalData.studyData.exam) {
                this.wxShowModal(data.error + '，如有疑问请联系客服');
            }
        }
    },
    tapBookButton() {
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            this.showNotComplete();
        }
    },
    tapCalendarButton() {
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            this.showNotComplete();
        }
    },
    tapQiangKeButton() {
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            this.showNotComplete();
        }
    },
    tapPingJiaoButton() {
        if (this.checkAllModalStatus() == 0) {//全局弹窗控制
            this.showNotComplete();
        }
    },
    tapShowToolsButton() {
        this.setData({
            showToolBox: !this.data.showToolBox
        });
    },
    showNotComplete() {
        this.wxShowModal('此功能未开放，尽情期待！Ps：从华广放寒假开始到现在只开发了10天，所以先做完了期末成绩查询（可提前看成绩）其他功能会在本寒假开发完毕，下学期开学就可以使用啦～大家还有什么需要的功能可以加交流群告诉我！');
    },
    checkAllModalStatus() {
        switch (this.data.allModalStatus) {
            case '密码错误':
                this.wxShowModal('由于密码错误，无法获取数据，请先去资料页修改为您绑定的新密码');
                return -1;
            case '未绑定账号':
                wx.navigateTo({
                    url: '../bindnumber/bindnumber'
                });
                return -2;
            default:
                return 0;
        }
    },
    wxShowModal(content) {
        wx.showModal({
            title: "提示",
            content: content,
            confirmColor: "#171a20",
            showCancel: !1
        });
    },
    onPullDownRefresh() {
        wx.vibrateShort();
        wx.setStorage({
            key: 'studyData',
            data: ""
        });
        app.getUserInfoData();
        this.onShow();
        wx.stopPullDownRefresh();
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
    },
});