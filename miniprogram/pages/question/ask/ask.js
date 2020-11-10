const AV = require('../../../utils/av-weapp-min.js');
import { showErrorModal } from '../../../utils/index.js';
Page({
    data: {
        files: [],
        title: "",
        content: ""
    },
    titleInput(e) {
        this.setData({
            title: e.detail.value
        });
    },
    contentInput(e) {
        this.setData({
            content: e.detail.value
        });
    },
    tapSubmitButton() {
        if (this.data.title) {
            wx.showLoading({
                title: "发布中"
            });
            //在question新建一行
            const avUser = AV.User.current();
            var question = new AV.Object('question');
            question.set('user', avUser);
            question.set('title', this.data.title);
            question.set('content', this.data.content);
            question.set('imgs', this.data.files);
            question.save().then(e => {
                wx.hideLoading();
                wx.navigateBack();
            }).catch(error => {
                wx.hideLoading();
                showErrorModal(error.message);
            });
        }else{
            showErrorModal('问题不能为空');
        }
    },
    chooseImage: function (e) {
        if (this.data.files.length < 3) {
            wx.showLoading({
                title: "上传中"
            });
            var that = this;
            wx.chooseImage({
                count: 1,
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                    const path = res.tempFilePaths[0];
                    new AV.File('question', {
                        blob: {
                            uri: path,
                        },
                    }).save()
                        // 上传成功
                        .then(file => {
                            let okArr = that.data.files;
                            okArr.push(file.url());
                            that.setData({
                                files: okArr
                            });
                            wx.hideLoading();
                        })
                        // 上传发生异常
                        .catch(error => {
                            wx.hideLoading();
                            showErrorModal(error.message);
                        });
                }
            })
        }
    },
    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
    }
});