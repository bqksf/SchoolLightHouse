import {
    getWhichWeek
} from "../../utils/study-date.js";
import {
    showErrorModal,
    isObjEmpty
} from '../../utils/index.js';

let app = getApp();
let db = wx.cloud.database({
    env: 'release-5gt6h0dtd3a72b90'
});

Page({
    data: {
        statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
        theme: wx.getSystemInfoSync().theme,
        noClass: true,
        showToolBox: true,
        notice: "暂时没有通知",
        allModalStatus: null, //所有按钮统一错误处理
        serverErrorStr: '',
        todayClassNum: 1,
        weekClassNum: 0,
        scoreNum: 0,
        examNum: 0,
        weekNum: 0,
        todayClassArr: [],
        bookNum: 0,
        isRefresh: false // 下拉刷新
    },
    onLoad() {
        //针对第一次进入页面
        if (!app.globalData._openid || isObjEmpty(app.globalData.userInfo)) {
            app.userInfoReadyCallback = res => { // app.js异步回调方法，获取不到数据时使用
                const {
                    _openid,
                    firstlogin,
                    userInfo
                } = res;
                if (!firstlogin) {
                    this.initData(_openid, userInfo);
                } else {
                    this.setData({
                        allModalStatus: 'noBind'
                    });
                }
            };
        } else {
            if (!app.globalData.firstlogin) {
                this.initData(app.globalData._openid, app.globalData.userInfo);
            } else {
                this.setData({
                    allModalStatus: 'noBind'
                });
            }
        }
    },
    async initData(_openid, userInfo) {
        if (_openid) {
            wx.showLoading({
                title: '获取学习数据'
            });
            // 获取本学期开始时间
            try {
                const {
                    schoolCode
                } = userInfo;
                const schoolResp = await db.collection('school').where({
                    code: schoolCode
                }).get();
                const {
                    startTime
                } = schoolResp.data[0];
                console.log('学期开始时间：' + startTime);
                await this.initData2(startTime);
            } catch (e) {
                showErrorModal('获取学期时间失败', e);
                this.setData({
                    allModalStatus: 'serverError',
                    serverErrorStr: '获取学期时间失败' + JSON.stringify(e)
                });
            }
            wx.hideLoading();
        }
    },
    async initData2(startTime) {
        // 计算第几周
        const weekNum = getWhichWeek(startTime);
        //TEST let weekNum = 20;
        this.setData({
            weekNum: weekNum
        });
        app.globalData.weekNum = weekNum;
        try {
            // 先检查缓存，有的话从缓存中取
            let studyDataStorage = wx.getStorageSync('studyData') || null;
            let studyData = null;
            let needSetStorage = false;
            const nowTime = Math.round(new Date().getTime() / 1000);
            if (!studyDataStorage) {
                // 缓存中没有，直接获取
                studyData = await this.getStudyData();
                needSetStorage = true;
            } else {
                // 缓存中有，看看到期了没
                if (((nowTime - studyDataStorage.addStorTime) > (86400 * 1))) {
                    // 缓存过了1天，到期了，重新获取
                    studyData = await this.getStudyData();
                    needSetStorage = true;
                } else {
                    // 在缓存中取
                    studyData = studyDataStorage;
                }
            }
            console.log('获取学习数据完成');
            // 未绑定
            if (studyData.status === 'error' && studyData.msg === 'noBind') {
                this.setData({
                    allModalStatus: 'noBind'
                });
                app.globalData.isNoBind = true;
                return;
            }
            // 其他错误
            if (studyData.status === 'error') {
                throw studyData.msg + studyData.data;
            }
            let {
                data
            } = studyData;
            // 设置全局变量
            app.globalData.studyData = data;
            // 设置缓存
            if (needSetStorage) {
                studyData.addStorTime = nowTime;
                wx.setStorage({
                    key: 'studyData',
                    data: studyData
                });
            }
            // 是否需要更改教务系统绑定密码
            if (data.needChangePassword === true) {
                this.setData({
                    notice: "检测到您教务系统密码已更改，请到个人资料页修改为新密码才能继续使用。",
                    allModalStatus: 'passwordError'
                });
                return;
            }
            // 解析学习数据
            if (data.schedule) {
                //有课程数据
                this.handleScheduleData(data.schedule, weekNum);
            }
            if (data.score) {
                //搬自score成绩查询页面，后期可能优化
                //构造以学期名字，内容为课程数据的对象
                this.handleScoreData(data.score);
            }
            if (data.examTime) {
                //有考试数据
                this.handleExamData(data.examTime);
            }
            // TODO 服务器公告
            this.setData({
                notice: '暂时没有通知',
                isRefresh: false
            });
            //2020年12月5日 tuip123 老用户设置公告
            if (app.globalData.userInfo.isOldUser) {
                this.setData({
                    notice:'检测到您是老用户，请先在 "高校灯塔" 公众号回复 "1" 才能正常使用部分功能噢~'
                })
                return;
            }
        } catch (e) {
            showErrorModal('获取学习信息失败', e);
            this.setData({
                allModalStatus: 'serverError',
                serverErrorStr: '获取学习信息失败' + JSON.stringify(e)
            });
            return;
        }
    },
    async getStudyData() {
        const studyDataResp = await wx.cloud.callFunction({
            name: 'getStudyData',
            data: {
                refresh: this.data.isRefresh
            }
        });
        // console.log('获取到的学习数据：' + JSON.stringify(studyDataResp.result));
        return studyDataResp.result;
    },
    handleExamData(exam) {
        const dataKeysArr = Object.keys(exam);
        const sectionExam = exam[dataKeysArr[0]];
        this.setData({
            examNum: sectionExam.length
        })
    },
    handleScheduleData(schedule, weekNum) {
        //这一周有多少节课
        let weekClassNum = 0;
        const all_schedule = schedule['schedule'];
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
        let dayOfTheWeek = nowDate.getDay(); //获取当前星期X(0-6,0代表星期天)
        dayOfTheWeek = dayOfTheWeek == 0 ? 7 : dayOfTheWeek;
        //dayOfTheWeek = 3;
        //今日所有课程
        let todayClassNumI = 0;
        let todayScheduleDataArr = [];
        const day_schedule = schedule['schedule'][dayOfTheWeek - 1];
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
            //根据课表数创建今日课表的二维数组 - 显示用 两节课【【data】，【data】】
            let okArr = [];
            todayScheduleDataArr.forEach(scheduleData => {
                //每次都循环一遍每一个今日课表数据的时间，如果匹配上
                okArr.push(new Array(scheduleData));
            });
            //设置展示的今日课程数和今日课表arr
            this.setData({
                todayClassNum: todayClassNumI,
                todayClassArr: okArr,
                noClass: false
            });
        } else {
            this.setData({
                todayClassNum: 1,
                todayClassArr: [],
                noClass: true
            });
        }
    },
    handleScoreData(score) {
        let yearAndSectionObj = {};
        const dataKeysArr = Object.keys(score);
        dataKeysArr.forEach(year => { //有几年
            let sectionArr = Object.keys(score[year]);
            sectionArr.forEach(section => { //这一年有几学期
                let sectionDataArr = score[year][section];
                yearAndSectionObj[year + ' 第' + section + '学期'] = sectionDataArr;
            });
        });
        //全部
        const allSectionKeysArr = Object.keys(yearAndSectionObj);
        let allSectionsArr = [];
        allSectionKeysArr.forEach(allSectionKey => { //每学期的所有课
            const sectionDataArr = yearAndSectionObj[allSectionKey];
            allSectionsArr.push.apply(allSectionsArr, sectionDataArr); //合并数组
        });
        const scoreNum = allSectionsArr.length;
        this.setData({
            scoreNum: scoreNum
        })
    },
    tapSchoolCardButton() {
        if (this.checkAllModalStatus()) { //全局弹窗控制
            this.showNotComplete();
            return;
        }
    },
    tapBookButton() {
        if (this.checkAllModalStatus()) { //全局弹窗控制
            this.showNotComplete();
            return;
        }
    },
    tapScheduleButton() {
        if (this.checkAllModalStatus()) { //全局弹窗控制
            if (!app.globalData.studyData.schedule) {
                this.wxShowModal('暂无课程表数据，如有疑问请联系客服');
            } else {
                if ('error' in app.globalData.studyData.schedule) {
                    showErrorModal('获取课程表数据失败', app.globalData.studyData.schedule.error)
                } else {
                    wx.navigateTo({
                        url: '../index/schedule/schedule'
                    });
                }
            }
        }
    },
    tapScoreButton() {
        if (this.checkAllModalStatus()) { //全局弹窗控制
            if (!app.globalData.studyData.score) {
                this.wxShowModal('学校可能暂时关闭了成绩查询接口，ps：此功能的目的不是为了第一时间查询成绩，而是对你的成绩做详细的数据分析，绘制出很多直观图表。');
            } else {
                if ('error' in app.globalData.studyData.score) {
                    showErrorModal('获取考试成绩数据失败', app.globalData.studyData.score.error)
                } else {
                    wx.navigateTo({
                        url: '../index/score/score'
                    });
                }
            }
        }
    },
    tapExamButton() {
        if (this.checkAllModalStatus()) { //全局弹窗控制
            if (!app.globalData.studyData.examTime) {
                this.wxShowModal('暂无考试时间数据，如有疑问请联系客服');
            } else {
                if ('error' in app.globalData.studyData.examTime) {
                    showErrorModal('获取考试成绩数据失败', app.globalData.studyData.examTime.error)
                } else {
                    wx.navigateTo({
                        url: '../index/exam/exam'
                    });
                }
            }
        }
    },
    tapQiangKeButton() {
        if (this.checkAllModalStatus()) { //全局弹窗控制
            this.showNotComplete();
        }
    },
    tapPingJiaoButton() {
        if (this.checkAllModalStatus()) { //全局弹窗控制
            this.showNotComplete();
        }
    },
    tapShowToolsButton() {
        this.setData({
            showToolBox: !this.data.showToolBox
        });
    },
    showNotComplete() {
        this.wxShowModal('此功能未开放，尽情期待！大家还有什么急用需要的功能可以加交流群告诉我们！');
    },
    checkAllModalStatus() {
        switch (this.data.allModalStatus) {
            case 'serverError':
                this.wxShowModal('服务器错误：' + this.data.serverErrorStr);
                return false;
            case 'passwordError':
                this.wxShowModal('由于密码错误，无法获取数据，请先去资料页修改为您绑定的新密码');
                return false;
            
            case 'noBind':
                wx.navigateTo({
                    url: '../register/register'
                });
                return false;
            default:
                return true;
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
        wx.removeStorageSync('studyData');
        this.setData({
            isRefresh: true,
            allModalStatus: null
        });
        this.onLoad();
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