const AV = require('../../../utils/av-weapp-min.js');
import { showErrorModal, dateFormat } from '../../../utils/index.js';
Page({
    data: {
        question: {
            id: "",
            title: "",
            content: "",
            time: "",
            watch: 0,
            author: {
                id: "",
                name: "",
                avatar: "",
                classs: ""
            },
            imgArr: []
        },
        answerInput: "",
        answerArr: [],
        replyInput: "",
        showReply: false,
        replyOriginData: null,
        replyValue: '',
        answerValue: ''
    },
    onLoad(options) {
        const { id } = options;
        this.initQuestion(id);
        this.addOneWatch(id);
        this.initAnswer(id);
        console.log(this.data.answerArr);
    },
    addOneWatch(id){
        var que = AV.Object.createWithoutData('question', id);
        que.increment('watch', 1);
        que.save();
    },
    tapMoreReplyButton(e) {
        wx.navigateTo({
            url: '../moreanswer/moreanswer?id=' + e.currentTarget.dataset.item + '&queID=' + this.data.question.id
        });
    },
    tapReplyButton() {
        if (this.data.replyInput) {
            wx.showLoading({
                title: "回复中"
            });
            //在answer新建一行
            const avUser = AV.User.current();
            var answer = new AV.Object('answer');
            var quePointer = AV.Object.createWithoutData('question', this.data.question.id);
            const ansID = this.data.replyOriginData.id;
            const ansUserID = this.data.replyOriginData.author.id;
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
                    showReply: false,
                    replyValue: ""
                });
                this.onLoad({id:this.data.question.id});
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
            showReply: true,
            replyOriginData: item
        });
    },
    tapGoodToTrue(e){
        let oldAnswer = e.currentTarget.dataset.item;
        const answerIndex = e.currentTarget.dataset.index;
        var answer = AV.Object.createWithoutData('answer', oldAnswer.id);
        answer.addUnique('like',AV.User.current());
        answer.save().then(()=>{
            oldAnswer.isMelike = true;
            let answerArr = this.data.answerArr;
            answerArr[answerIndex] = oldAnswer;
            this.setData({
                answerArr: answerArr
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    tapGoodToFalse(e){
        let oldAnswer = e.currentTarget.dataset.item;
        const answerIndex = e.currentTarget.dataset.index;
        var answer = AV.Object.createWithoutData('answer', oldAnswer.id);
        answer.remove('like',AV.User.current());
        answer.save().then(()=>{
            oldAnswer.isMelike = false;
            let answerArr = this.data.answerArr;
            answerArr[answerIndex] = oldAnswer;
            this.setData({
                answerArr: answerArr
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    initAnswer(id) {
        var query = new AV.Query('answer');
        var que = AV.Object.createWithoutData('question', id);
        //TODO 限制找10个回答
        query.equalTo('toQuestion', que);
        query.include('user');
        query.doesNotExist('toAnswer');
        query.find().then(anss => {
            anss.forEach(ans => {
                //对于每个答案
                const user = ans.get('user');
                let ansObj = {};
                //每个答案ans找对应评论数量和前两个评论
                var query2 = new AV.Query('answer');
                query2.equalTo('toAnswer', ans);
                query2.count().then(count => {
                    //这个答案对应的评论
                    if (count == 0) {
                        //这个答案没评论
                        //处理时间
                        const timeStr = dateFormat(ans.createdAt);
                        const likeArr = ans.get('like');
                        const isMelike = likeArr.indexOf(AV.User.current()) > -1 ? true : false;
                        ansObj = {
                            id: ans.id,
                            content: ans.get('content'),
                            like: likeArr.length,
                            isMelike: isMelike,
                            author: {
                                id: user.id,
                                name: user.get('nickName'),
                                avatar: user.get('avatarUrl'),
                            },
                            time: timeStr,
                            replyNum: 0
                        }
                        console.log(ansObj);
                        let { answerArr } = this.data;
                        answerArr.push(ansObj);
                        this.setData({
                            answerArr: answerArr
                        });
                    } else {
                        //有评论，拿前两个评论
                        var query3 = new AV.Query('answer');
                        query3.equalTo('toAnswer', ans);
                        query3.include('toUser');
                        query3.include('user');
                        query3.limit(2);
                        let replyArr = new Array();
                        query3.find().then(replys => {
                            replys.forEach(reply => {
                                const userReply = reply.get('user');
                                const usertoReply = reply.get('toUser');
                                let replyObj = {
                                    content: reply.get('content'),
                                    author: {
                                        id: userReply.id,
                                        name: userReply.get('nickName'),
                                        avatar: userReply.get('avatarUrl'),
                                    },
                                    to: {
                                        id: usertoReply.id,
                                        name: usertoReply.get('nickName'),
                                        avatar: usertoReply.get('avatarUrl'),
                                    },
                                }
                                replyArr.push(replyObj);
                            });
                            //处理时间
                            const timeStr = dateFormat(ans.createdAt);
                            console.log(ans.createdAt);
                            const likeArr = ans.get('like');
                            const isMelike = likeArr.indexOf(AV.User.current()) > -1 ? true : false;
                            ansObj = {
                                id: ans.id,
                                content: ans.get('content'),
                                like: likeArr.length,
                                isMelike: isMelike,
                                author: {
                                    id: user.id,
                                    name: user.get('nickName'),
                                    avatar: user.get('avatarUrl'),
                                },
                                time: timeStr,
                                replyNum: count,
                                replyArr: replyArr
                            }
                            let { answerArr } = this.data;
                            answerArr.push(ansObj);
                            console.log(ansObj);
                            this.setData({
                                answerArr: answerArr
                            });
                        }).catch(error => {
                            showErrorModal(error.message);
                        });
                    }
                }).catch(error => {
                    showErrorModal(error.message);
                });
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    tapAnswerButton() {
        if (this.data.answerInput) {
            wx.showLoading({
                title: "发布中"
            });
            //在answer新建一行
            const avUser = AV.User.current();
            var answer = new AV.Object('answer');
            var quePointer = AV.Object.createWithoutData('question', this.data.question.id);
            answer.set('content', this.data.answerInput);
            answer.set('toQuestion', quePointer);
            answer.set('user', avUser);
            answer.save().then(e => {
                wx.hideLoading();
                wx.showToast({
                    title: '回答成功',
                    icon: 'success',
                    duration: 1500
                });
                this.setData({
                    answerInput: "",
                    answerValue: ''
                });
                this.onLoad({id:this.data.question.id});
            }).catch(error => {
                wx.hideLoading();
                showErrorModal(error.message);
            });
        } else {
            showErrorModal('回答不能为空');
        }
    },
    replyInput(e) {
        this.setData({
            replyInput: e.detail.value
        });
    },
    answerInput(e) {
        this.setData({
            answerInput: e.detail.value
        });
    },
    initQuestion(id) {
        var query = new AV.Query('question');
        query.include('user');
        query.get(id).then((que) => {
            const user = que.get('user');
            //处理年级班级显示
            let classs = JSON.parse(user.get('userInfo'));
            //取class_name前4个数字，为年份
            //取specialty专业，两个拼起来
            const { class_name, specialty } = classs;
            const year = class_name.substr(0, 4);
            //处理时间
            const timeStr = dateFormat(que.createdAt);
            this.setData({
                question: {
                    id: id,
                    title: que.get('title'),
                    content: que.get('content'),
                    time: timeStr,
                    watch: que.get('watch'),
                    author: {
                        id: user.id,
                        name: user.get('nickName'),
                        avatar: user.get('avatarUrl'),
                        classs: year + specialty
                    },
                    imgArr: que.get('imgs')
                }
            })
            console.log(this.data);
        }).catch(error => {
            showErrorModal(error.message);
        });;
    },
    onShareAppMessage() {
        return {
            title: this.data.question.content,
            path: "pages/question/answer/answer?id=" + this.data.question.id,
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