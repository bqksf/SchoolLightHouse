var app = getApp();
import { showErrorModal } from '../../../utils/index.js';

Page({
    data: {
        dialogTitle: "",
        dialogShow: false,
        dialogContent: "",
        dialogButtons: [{ text: '确定' }],
        scheduleArr: [],
        mindStatus: 0,
        currentWeekNum: 0,
        dayOfTheWeek: 0,
        trueWeekNum: 0,
        stringifyScheduleData: null,// 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
    },
    onLoad() {
        //今天星期几
        const nowDate = new Date();
        let dayOfTheWeek = nowDate.getDay();//获取当前星期X(0-6,0代表星期天)
        dayOfTheWeek = dayOfTheWeek == 0 ? 7 : dayOfTheWeek;

        const { schedule } = app.globalData.studyData;
        
        const weekNum = app.globalData.weekNum;
        this.setData({
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
    },
    tapLeftButton() {
        let { currentWeekNum } = this.data;
        currentWeekNum > 1 && currentWeekNum--;
        // const { schedule } = app.globalData.studyData;
        // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
        this.initData(JSON.parse(this.data.stringifyScheduleData), currentWeekNum);
        this.setData({
            currentWeekNum: currentWeekNum
        });
    },
    tapRightButton() {
        let { currentWeekNum } = this.data;
        currentWeekNum > 0 && currentWeekNum++;
        // const { schedule } = app.globalData.studyData;
        // 2020.11.24，会有莫名其妙的bug，必须用json字符串化再解码回来才行，可能是因为数组中周六周日是空数组，并且打印log出来不显示
        this.initData(JSON.parse(this.data.stringifyScheduleData), currentWeekNum);
        this.setData({
            currentWeekNum: currentWeekNum
        });
    },
    tapOneSchedule(e){
        const schedule = e.currentTarget.dataset.schedule;
        if (schedule.name == ' ') {
            //没有课
            return;
        }
        const {name,place,teacher,section,time,weeks_text} = schedule;
        let content = "课程名："+name+"\n教室："+place+"\n老师："+teacher+"\n节数："+section+"\n时间："+time+"\n周数："+weeks_text;
        this.setData({
            dialogTitle: "课程信息",
            dialogShow: true,
            dialogContent: content,  
        });
    },
    tapIcon() {
        this.setData({
            mindStatus: !this.data.mindStatus
        });
        this.remindChange();
    },
    remindChange() {
        //TODO 考试提醒
        showErrorModal('此功能即将开放，开放后会在高校灯塔公众号提醒你～');
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
                let timeTemp=0
                for (let c = 0; c < timeSceArr.length; c++) {
                    const schedule = timeSceArr[c];
                    //看是否含本周
                    let { weeks_arr } = schedule;
                    if (weeks_arr.indexOf(weekNum) == -1) {
                        //不含就去掉
                        noNum++;
                        //2020年11月29日 tuip123 记录要删除的位置
                        timeTemp=c
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
                    scheduleArr[a][b] = { 'name': ' ' }
                } 
                else {
                    //非空数组，改成数组中的第一节课，并且把课的name限制在12个字内
                    timeSceArr[0].name = timeSceArr[0].name.substr(0, 12)//切掉12个字后面的内容
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