var app = getApp();



var doubleLineChart = null;

var doubleLineData = [{
    name: 'Java Web发动机发酵剂',
    value: 3.0,
    type: '学分'
}, {
    name: '马克思主义打开进风',
    value: 2.5,
    type: '学分'
}, {
    name: 'Java Web发动机发酵剂',
    value: 3.7,
    type: '绩点'
}, {
    name: '马克思主义打开进风',
    value: 3.6,
    type: '绩点'
}];

function onInitDoubleLineChart(F2, config) {
    doubleLineChart = new F2.Chart(config);
    const data = doubleLineData;
    doubleLineChart.source(data, {
        value: {
            tickCount: 5,
            formatter: function formatter(val) {
                return val.toFixed(2);
            }
        }
    });
    doubleLineChart.axis('name', {
        tickLine: {
            lineWidth: 1,
            stroke: '#ccc',
            length: 5, // 刻度线长度
        },
        label: function label(text, index, total) {
            const textCfg = {};
            textCfg.text = text.substr(0, 1);
            return textCfg;
        }
    });
    doubleLineChart.legend({
        align: 'center'
    });
    doubleLineChart.tooltip({
        showTitle: true
    });
    doubleLineChart.area()
        .position('name*value')
        .color('type')
        .shape('smooth');
    doubleLineChart.line()
        .position('name*value')
        .color('type')
        .shape('type', function (type) {
            if (type === '绩点') {
                return 'line';
            }
            if (type === '学分') {
                return 'dash';
            }
        });
    doubleLineChart.render();
    // 注意：需要把chart return 出来
    return doubleLineChart;
}

var zhuChart = null;

var zhuData = [{
    name: 'Java Web发动机发酵剂',
    value: 87
}, {
    name: '马克思主义打开进风',
    value: 58
}];

function onInitZhuChart(F2, config) {
    zhuChart = new F2.Chart(config);
    const data = zhuData;
    zhuChart.source(data, {
        value: {
            min: 0,
            max: 100
        }
    });
    zhuChart.axis('name', {
        tickLine: {
            lineWidth: 1,
            stroke: '#ccc',
            length: 5, // 刻度线长度
        },
        label: function label(text, index, total) {
            const textCfg = {};
            textCfg.text = text.substr(0, 1);
            return textCfg;
        }
    });
    zhuChart.tooltip({
        showItemMarker: false,
        onShow: function onShow(ev) {
            const items = ev.items;
            items[0].name = null;
            items[0].name = items[0].title;
            items[0].value = items[0].value;
        }
    });
    zhuChart.interval()
        .position('name*value');
    zhuChart.render();
    // 注意：需要把chart return 出来
    return zhuChart;
}

var bingChart = null;

var map = {
    '90-100分': '40%',
    '80-90分 ': '20%',
    '70-80分 ': '18%',
    '60-70分 ': '15%',
    '0-60分  ': '5%'
};
var bingData = [{
    name: '90-100分',
    percent: 0.4,
    a: '1'
}, {
    name: '80-90分 ',
    percent: 0.2,
    a: '1'
}, {
    name: '70-80分 ',
    percent: 0.18,
    a: '1'
}, {
    name: '60-70分 ',
    percent: 0.15,
    a: '1'
}, {
    name: '0-60分  ',
    percent: 0.05,
    a: '1'
}];

function onInitBingChart(F2, config) {
    bingChart = new F2.Chart(config);
    const data = bingData;
    bingChart.source(data, {
        percent: {
            formatter: function formatter(val) {
                return val * 100 + '%';
            }
        }
    });
    bingChart.legend({
        position: 'right',
        itemFormatter: function itemFormatter(val) {
            return val + '  ' + map[val];
        }
    });
    bingChart.coord('polar', {
        transposed: true,
        radius: 0.85
    });
    bingChart.axis(false);
    bingChart.interval()
        .position('a*percent')
        .color('name', ['#2FC25B', '#13C2C2', '#1890FF', '#FACC14', '#F04864'])
        .adjust('stack')
        .style({
            lineWidth: 1,
            stroke: '#fff',
            lineJoin: 'round',
            lineCap: 'round'
        })
        .animate({
            appear: {
                duration: 1200,
                easing: 'bounceOut'
            }
        });

    bingChart.render();
    // 注意：需要把chart return 出来
    return bingChart;
}

Page({
    data: {
        scoreArr: [],
        totalCredit: 0,
        totalPoint: 0,
        currentChoose: null,
        dialogTitle: "",
        dialogShow: false,
        dialogContent: "",
        dialogButtons: [{ text: '确定' }],
        array: ['空'],
        index: 0,
        yearAndSectionObj: null,
        onInitDoubleLineChart: onInitDoubleLineChart,
        onInitZhuChart: onInitZhuChart,
        onInitBingChart: onInitBingChart,
        showChart: 0
    },
    onLoad() {
        this.initData(app.globalData.studyData.score);
    },
    tapIcon() {
        let index = this.data.index;
        this.setData({
            showChart: !this.data.showChart
        });
        setTimeout(() => {
            this.bindPickerChange({ detail: { value: index } });
        }, 1000);
    },
    bindPickerChange(e) {
        //picker发送选择改变，携带值为e.detail.value
        const value = e.detail.value;
        const scoreArr = this.data.yearAndSectionObj[this.data.array[value]];
        //计算总学分和总绩点
        //图表数据
        let doubleLineDataArr = [], zhuDataArr = [];
        let totalCredit = 0, totalPoint = 0;
        let totalNum = 0, num90_100 = 0, num80_89 = 0, num70_79 = 0, num60_69 = 0, num0_59 = 0;
        scoreArr.forEach(lesson => {
            totalCredit += lesson.credit;
            totalPoint += lesson.point;
            doubleLineDataArr.push({ name: lesson.lesson_name, value: lesson.credit, type: '学分' });
            doubleLineDataArr.push({ name: lesson.lesson_name, value: lesson.point, type: '绩点' });
            if (typeof (lesson.score) == 'number') {
                zhuDataArr.push({ name: lesson.lesson_name, value: lesson.score });
                lesson.score >= 90 && num90_100++;
                lesson.score >= 80 && lesson.score < 90 && num80_89++;
                lesson.score >= 70 && lesson.score < 80 && num70_79++;
                lesson.score >= 60 && lesson.score < 70 && num60_69++;
                lesson.score < 60 && num0_59++;
                totalNum++;
            }
        });
        const percent90_100 = (num90_100 / totalNum), percent80_89 = (num80_89 / totalNum), percent70_89 = (num70_79 / totalNum), ercent60_69 = (num60_69 / totalNum), ercent0_59 = (num0_59 / totalNum);
        this.setData({
            scoreArr: scoreArr,
            index: value,
            totalCredit: totalCredit.toFixed(2),
            totalPoint: totalPoint.toFixed(2),
            currentChoose: this.data.array[value],
        })
        bingData = [{
            name: '90-100分',
            percent: parseFloat(percent90_100),
            a: '1'
        }, {
            name: '80-90分 ',
            percent: parseFloat(percent80_89),
            a: '1'
        }, {
            name: '70-80分 ',
            percent: parseFloat(percent70_89),
            a: '1'
        }, {
            name: '60-70分 ',
            percent: parseFloat(ercent60_69),
            a: '1'
        }, {
            name: '0-60分  ',
            percent: parseFloat(ercent0_59),
            a: '1'
        }];
        map = {
            '90-100分': parseInt(parseFloat(percent90_100) * 100) + '%',
            '80-90分 ': parseInt(parseFloat(percent80_89) * 100) + '%',
            '70-80分 ': parseInt(parseFloat(percent70_89) * 100) + '%',
            '60-70分 ': parseInt(parseFloat(ercent60_69) * 100) + '%',
            '0-60分  ': parseInt(parseFloat(ercent0_59) * 100) + '%'
        };
        if (doubleLineChart != null) {


            //更新图表数据
            doubleLineData = doubleLineDataArr;
            doubleLineChart.changeData(doubleLineData);
            zhuData = zhuDataArr;
            zhuChart.changeData(zhuData);
            bingChart.changeData(bingData);
        }
    },
    tapScoreCard(event) {
        const data = event.currentTarget.dataset.item;
        let content = "性质:" + data.property + "\n学分:" + data.credit + " 绩点:" + data.point + "\n平时:" + data.usually_score + " 期末:" + data.last_score + " 成绩:" + data.score;
        if (data.hasOwnProperty('qzcj')) {
            content += "\n期中:" + data.qzcj;
        }
        if (data.hasOwnProperty('sycj')) {
            content += "\n实验成绩:" + data.sycj;
        }
        if (data.hasOwnProperty('bkcj')) {
            content += "\n补考成绩:" + data.bkcj;
        }
        if (data.hasOwnProperty('cxcj')) {
            content += "\n重修成绩:" + data.cxcj;
        }
        this.setData({
            dialogShow: true,
            dialogTitle: data.lesson_name,
            dialogContent: content
        });
    },
    initData(data) {
        //构造以学期名字，内容为课程数据的对象
        let yearAndSectionObj = {};
        const dataKeysArr = Object.keys(data);
        dataKeysArr.forEach(year => {//有几年
            let sectionArr = Object.keys(data[year]);
            sectionArr.forEach(section => {//这一年有几学期
                let sectionDataArr = data[year][section];
                yearAndSectionObj[year + ' 第' + section + '学期'] = sectionDataArr;
            });
        });
        //再加个全部的选项
        const allSectionKeysArr = Object.keys(yearAndSectionObj);
        let allSectionsArr = [];
        allSectionKeysArr.forEach(allSectionKey => {//每学期的所有课
            const sectionDataArr = yearAndSectionObj[allSectionKey];
            allSectionsArr.push.apply(allSectionsArr, sectionDataArr);//合并数组
        });
        yearAndSectionObj['全部'] = allSectionsArr;
        const objKeys = Object.keys(yearAndSectionObj);//下拉菜单的值
        //对所有成绩数据排序
        yearAndSectionObj = this.sortScoreData(yearAndSectionObj,objKeys);
        //默认获取数组倒数第二个元素--本学期的成绩(倒数第一是全部)
        const lastSecionKey = objKeys[objKeys.length - 2];
        const lastSectionArr = yearAndSectionObj[lastSecionKey];
        //计算总学分和总绩点
        //图表数据
        let doubleLineDataArr = [], zhuDataArr = [];
        let totalCredit = 0, totalPoint = 0;
        let totalNum = 0, num90_100 = 0, num80_89 = 0, num70_79 = 0, num60_69 = 0, num0_59 = 0;
        lastSectionArr.forEach(lesson => {
            totalCredit += lesson.credit;
            totalPoint += lesson.point;
            doubleLineDataArr.push({ name: lesson.lesson_name, value: lesson.credit, type: '学分' });
            doubleLineDataArr.push({ name: lesson.lesson_name, value: lesson.point, type: '绩点' });
            if (typeof (lesson.score) == 'number') {
                zhuDataArr.push({ name: lesson.lesson_name, value: lesson.score });
                lesson.score >= 90 && num90_100++;
                lesson.score >= 80 && lesson.score < 90 && num80_89++;
                lesson.score >= 70 && lesson.score < 80 && num70_79++;
                lesson.score >= 60 && lesson.score < 70 && num60_69++;
                lesson.score < 60 && num0_59++;
                totalNum++;
            }
        });
        const percent90_100 = (num90_100 / totalNum), percent80_89 = (num80_89 / totalNum), percent70_89 = (num70_79 / totalNum), ercent60_69 = (num60_69 / totalNum), ercent0_59 = (num0_59 / totalNum);
        this.setData({
            scoreArr: lastSectionArr,
            currentChoose: lastSecionKey + "（本学期）",
            totalCredit: totalCredit.toFixed(2),
            totalPoint: totalPoint.toFixed(2),
            array: objKeys,
            index: objKeys.length - 2,
            yearAndSectionObj: yearAndSectionObj
        });
        doubleLineData = doubleLineDataArr;
        zhuData = zhuDataArr;
        bingData = [{
            name: '90-100分',
            percent: parseFloat(percent90_100),
            a: '1'
        }, {
            name: '80-90分 ',
            percent: parseFloat(percent80_89),
            a: '1'
        }, {
            name: '70-80分 ',
            percent: parseFloat(percent70_89),
            a: '1'
        }, {
            name: '60-70分 ',
            percent: parseFloat(ercent60_69),
            a: '1'
        }, {
            name: '0-60分  ',
            percent: parseFloat(ercent0_59),
            a: '1'
        }];
        map = {
            '90-100分': parseInt(parseFloat(percent90_100) * 100) + '%',
            '80-90分 ': parseInt(parseFloat(percent80_89) * 100) + '%',
            '70-80分 ': parseInt(parseFloat(percent70_89) * 100) + '%',
            '60-70分 ': parseInt(parseFloat(ercent60_69) * 100) + '%',
            '0-60分  ': parseInt(parseFloat(ercent0_59) * 100) + '%'
        };

    },
    sortScoreData(objData,objKeys){
        objKeys.forEach(objKey => {
            let scoresDataArr = objData[objKey];
            scoresDataArr.sort((a,b)=>{
                return b.score - a.score;
            });
            objData[objKey]=scoresDataArr;
        });
        return objData;
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