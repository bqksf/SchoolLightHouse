import { showErrorModal } from '../../../utils/index.js';

let app = getApp();
let db = wx.cloud.database({
    env: 'release-5gt6h0dtd3a72b90'
});

Page({
    data: {
        stuID: "加载失败",
        stuPassword: "",
        theme: wx.getSystemInfoSync().theme,
    },
    async onLoad() {
        try {
            const { stuID, stuPassword } = await this.getStuIDandPassword();
            this.setData({
                stuID: stuID,
                stuPassword: stuPassword
            });
        } catch (e) {
            return;
        }
    },
    async tapChangeButton() {
        wx.showModal({
            title: "确认修改",
            content: "确定将您的新密码修改为" + this.data.stuPassword,
            confirmColor: "#3e6ae1",
            success: async (res)=> {
                if (res.confirm) {
                    wx.showLoading({
                        title: '修改中',
                    });
                    try {
                        //判断是不是23点后修改
                        var now = new Date();
                        const hour = now.getHours();
                        if (hour == 23 || hour <= 7) {
                            throw '23:00～07:00因教务系统关闭，请换个时间再来修改！';
                        }
                        const { stuID, stuPassword } = this.data;
                        //验证输入的内容
                        if (!(stuID || stuPassword)) {
                            //是否为空
                            throw "内容不能为空";
                        }

                        await db.collection('studyData').where({
                            _openid: app.globalData._openid,
                        }).update({
                            data: {
                                stuPassword: stuPassword,
                                needChangePassword: false
                            }
                        });
                        await wx.cloud.callFunction({
                            name: 'getStudyData',
                            data: {
                                refresh: true
                            }
                        });
                        app.globalData.needChangePassword = false;
                        wx.removeStorageSync('studyData');
                        wx.hideLoading();
                        wx.reLaunch({
                            url: '/pages/index/index',
                        });
                    } catch (e) {
                        showErrorModal('修改失败', e);
                    }
                    wx.hideLoading();
                }
            }
        });
    },
    async getStuIDandPassword() {
        try {
            const studyDataResp = await db.collection('studyData').where({
                _openid: app.globalData._openid
            }).get();
            return studyDataResp.data[0];
        }
        catch (e) {
            showErrorModal('获取学习数据失败', e);
            throw '获取学习数据失败'
        }
    },
    stuPasswordKeyInput(e) {
        this.setData({
            stuPassword: e.detail.value
        });
    },
})