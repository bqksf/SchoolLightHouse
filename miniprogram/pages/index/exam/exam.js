var app = getApp();
import { formatDate } from "../../../utils/study-date.js";
import { showErrorModal } from "../../../utils/index.js";

Page({
    data: {
        examArr: [],
        mindStatus: 0,
        yearTitle: ""
    },
    onLoad() {

        const { exam } = app.globalData.studyData;
        if (exam) {
            this.initData(exam);
        } else {
            //TODO 无数据提示
        }
    },
    tapIcon() {
        this.setData({
            mindStatus: !this.data.mindStatus
        });
        this.remindChange();
    },
    remindChange() {
        //TODO 考试提醒
        showErrorModal('此功能将在3月中旬开放，考试前会在AI未来校园公众号提醒你～');
    },
    initData(data) {
        const dataKeysArr = Object.keys(data);
        const yearTitle = dataKeysArr[0];
        const sectionExamArr = data[yearTitle];
        //在今天考试的突出显示
        const today = formatDate(new Date());// y/m/d转成y-m-d的样式
        let have = 0, index = 0;
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
            const lastDay = (new Date(sectionExamArr[index - 1].day)).getTime();//最后一个有时间的
            const nowTime = new Date().getTime();
            if (have == 0 && nowTime - lastDay < 0) {
                sectionExamArr[0].isNow = 1;
            }
        }else{
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