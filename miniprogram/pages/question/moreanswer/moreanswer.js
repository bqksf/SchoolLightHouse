const AV = require('../../../utils/av-weapp-min.js');
import { showErrorModal, dateFormat } from '../../../utils/index.js';
Page({
    data: {
        answer: null,
        replysArr: [],
        replyOriginData: null,
        replyInput: "",
        questionID: null,
        replyTip: "写回复",
        replyValue: '',
        id: null
    },
    onLoad(options) {
        const { id, queID } = options;
        this.setData({
            questionID: queID,
            id: id
        });
        this.initAnswer(id);
        this.initReply(id);
    },
    tapGoodToTrue(e) {
        let oldAnswer = e.currentTarget.dataset.item;
        const replyIndex = e.currentTarget.dataset.index;
        var answer = AV.Object.createWithoutData('answer', oldAnswer.id);
        answer.addUnique('like', AV.User.current());
        answer.save().then(() => {
            oldAnswer.isMelike = true;
            let replysArr = this.data.replysArr;
            replysArr[replyIndex] = oldAnswer;
            this.setData({
                replysArr: replysArr
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    tapGoodToFalse(e) {
        let oldAnswer = e.currentTarget.dataset.item;
        const replyIndex = e.currentTarget.dataset.index;
        var answer = AV.Object.createWithoutData('answer', oldAnswer.id);
        answer.remove('like', AV.User.current());
        answer.save().then(() => {
            oldAnswer.isMelike = false;
            let replysArr = this.data.replysArr;
            replysArr[replyIndex] = oldAnswer;
            this.setData({
                replysArr: replysArr
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    tapReplyButton() {
        if (this.data.replyInput) {
            let ansUserID = null;
            if (!this.data.replyOriginData) {
                //针对答案回复
                ansUserID = this.data.answer.author.id;
            } else {
                ansUserID = this.data.replyOriginData.author.id;
            }
            wx.showLoading({
                title: "回复中"
            });
            //在answer新建一行
            const avUser = AV.User.current();
            var answer = new AV.Object('answer');
            var quePointer = AV.Object.createWithoutData('question', this.data.questionID);
            const ansID = this.data.answer.id;
            const toUserPointer = AV.Object.createWithoutData('_User', ansUserID);
            var ansPointer = AV.Object.createWithoutData('answer', ansID);
            answer.set('content', this.data.replyInput);
            answer.set('toQuestion', quePointer);
            answer.set('toAnswer', ansPointer);
            answer.set('toUser', toUserPointer);
            answer.set('user', avUser);
            answer.save().then(e => {
                wx.hideLoading();
                wx.showToast({
                    title: '回复成功',
                    icon: 'success',
                    duration: 1500
                });
                this.setData({
                    replyInput: "",
                    replyValue: "",
                    replyOriginData: null, //还原初始回复本答案
                    replyTip: "写回复"
                });
                this.onLoad({id:this.data.id,queID: this.data.questionID});
            }).catch(error => {
                wx.hideLoading();
                showErrorModal(error.message);
            });
        } else {
            showErrorModal('回复不能为空');
        }
    },
    tapReply(e) {
        const { item } = e.currentTarget.dataset;
        this.setData({
            replyOriginData: item,
            replyTip: "向 " + item.author.name + " 回复"
        });
    },
    replyInput(e) {
        this.setData({
            replyInput: e.detail.value
        });
    },
    initReply(id) {
        var query = new AV.Query('answer');
        var ans = AV.Object.createWithoutData('toAnswer', id);
        //TODO 限制只获取10个回复
        query.equalTo('toAnswer', ans);
        query.include('toUser');
        query.include('user');
        query.find().then(replys => {
            replys.forEach(reply => {
                const user = reply.get('user');
                const usertoReply = reply.get('toUser');
                //处理时间
                const timeStr = dateFormat(reply.createdAt);
                const likeArr = reply.get('like');
                const isMelike = likeArr.indexOf(AV.User.current()) > -1 ? true : false;
                let replyObj = {
                    id: reply.id,
                    content: reply.get('content'),
                    like: likeArr.length,
                    isMelike: isMelike,
                    author: {
                        id: user.id,
                        name: user.get('nickName'),
                        avatar: user.get('avatarUrl'),
                    },
                    time: timeStr,
                    to: {
                        id: usertoReply.id,
                        name: usertoReply.get('nickName'),
                        avatar: usertoReply.get('avatarUrl'),
                    },
                }
                let { replysArr } = this.data;
                replysArr.push(replyObj);
                this.setData({
                    replysArr: replysArr
                });
                console.log(this.data);
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    initAnswer(id) {
        var query = new AV.Query('answer');
        query.include('user');
        query.get(id).then(ans => {
            const user = ans.get('user');
            //处理年级班级显示
            let classs = JSON.parse(user.get('userInfo'));
            //取class_name前4个数字，为年份
            //取specialty专业，两个拼起来
            const { class_name, specialty } = classs;
            const year = class_name.substr(0, 4);
            //处理时间
            const timeStr = dateFormat(ans.createdAt);
            this.setData({
                answer: {
                    id: id,
                    content: ans.get('content'),
                    time: timeStr,
                    author: {
                        id: user.id,
                        name: user.get('nickName'),
                        avatar: user.get('avatarUrl'),
                        classs: year + specialty
                    }
                }
            })
            console.log(this.data);
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    onShareAppMessage() {
        return {
            title: this.data.answer.content,
            path: "pages/question/answer/answer?id=" + this.data.questionID,
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