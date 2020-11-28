var app = getApp();
import { showErrorModal, dateFormat } from '../../utils/index.js';
Page({
    data: {
        isShow: false,
        isActive: 0,
        animationData: {},
        historyList: [],
        searchVal: '',
        requesting: false,
        emptyShow: false,
        end: false,
        listData: [],
        color: "#3F82FD",
        page: 0,
    },
    onLoad() {
        // this.getList('refresh', 0);
    },
    getListPopular(type, currentPage){
        this.setData({
            requesting: true
        })
        //刷新模式
        if (type === 'refresh') {
            this.setData({
                listData: [],
                page: currentPage + 1
            });
        } else {
            this.setData({
                page: currentPage + 1,
                end: false
            });
        }
        var query = new AV.Query('question');
        query.ascending('watch');//Popular
        query.limit(10);
        query.skip(10 * (this.data.page - 1));//上面增加了1，当前页面应该-1
        query.find().then((questions) => {
            //10个问题
            console.log(questions);
            let queCount = 0;
            questions.forEach(que => {
                //每个问题
                var answerC = new AV.Query('answer');
                answerC.equalTo('toQuestion', que);
                answerC.doesNotExist('toAnswer');
                answerC.count().then((count) => {
                    //这个问题的回答数
                    var answer = new AV.Query('answer');
                    answer.equalTo('toQuestion', que);
                    answer.doesNotExist('toAnswer');
                    answer.descending('like');
                    answer.first().then((ans) => {
                        //最高赞的回答
                        const ansContent = ans.get('content');
                        const like = ans.get('like');
                        const likeNum = like.length;
                        //提问时间
                        const timeStr = dateFormat(que.createdAt);
                        //提问图片
                        const imgArr = que.get('imgs');
                        const haveImg = imgArr.length > 0 ? true : false;
                        //只显示第一张图片
                        const imgUrl = imgArr.length > 0 && imgArr[0];
                        let queObj = {
                            'title': que.get('title'),
                            'objectId': que.id,
                            'content': ansContent,
                            'likeNum': likeNum,
                            'answerNum': count,
                            'time': timeStr,
                            'haveImg': haveImg,
                            'imgUrl': imgUrl
                        };
                        const { listData } = this.data;
                        listData.push(queObj);
                        this.setData({
                            listData: listData,
                        });
                        queCount++;
                        if (queCount == 1) {
                            //只要加载成功一次就算请求成功了，去掉加载中，可优化！！！
                            this.setData({
                                requesting: false
                            });
                        }
                    }).catch(error => {
                        showErrorModal(error.message);
                        this.setData({
                            requesting: false
                        });
                    });
                }).catch(error => {
                    showErrorModal(error.message);
                    this.setData({
                        requesting: false
                    });
                });
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    getList(type, currentPage) {
        this.setData({
            requesting: true
        })
        //刷新模式
        if (type === 'refresh') {
            this.setData({
                listData: [],
                page: currentPage + 1
            });
        } else {
            this.setData({
                page: currentPage + 1,
                end: false
            });
        }
        var query = new AV.Query('question');
        query.ascending('createdAt');
        query.limit(10);
        query.skip(10 * (this.data.page - 1));//上面增加了1，当前页面应该-1
        query.find().then((questions) => {
            //10个问题
            console.log(questions);
            let queCount = 0;
            questions.forEach(que => {
                //每个问题
                var answerC = new AV.Query('answer');
                answerC.equalTo('toQuestion', que);
                answerC.doesNotExist('toAnswer');
                answerC.count().then((count) => {
                    //这个问题的回答数
                    var answer = new AV.Query('answer');
                    answer.equalTo('toQuestion', que);
                    answer.doesNotExist('toAnswer');
                    answer.descending('like');
                    answer.first().then((ans) => {
                        //最高赞的回答
                        const ansContent = ans.get('content');
                        const like = ans.get('like');
                        const likeNum = like.length;
                        //提问时间
                        const timeStr = dateFormat(que.createdAt);
                        //提问图片
                        const imgArr = que.get('imgs');
                        const haveImg = imgArr.length > 0 ? true : false;
                        //只显示第一张图片
                        const imgUrl = imgArr.length > 0 && imgArr[0];
                        let queObj = {
                            'title': que.get('title'),
                            'objectId': que.id,
                            'content': ansContent,
                            'likeNum': likeNum,
                            'answerNum': count,
                            'time': timeStr,
                            'haveImg': haveImg,
                            'imgUrl': imgUrl
                        };
                        const { listData } = this.data;
                        listData.push(queObj);
                        this.setData({
                            listData: listData,
                        });
                        queCount++;
                        if (queCount == 1) {
                            //只要加载成功一次就算请求成功了，去掉加载中，可优化！！！
                            this.setData({
                                requesting: false
                            });
                        }
                    }).catch(error => {
                        showErrorModal(error.message);
                        this.setData({
                            requesting: false
                        });
                    });
                }).catch(error => {
                    showErrorModal(error.message);
                    this.setData({
                        requesting: false
                    });
                });
            });
        }).catch(error => {
            showErrorModal(error.message);
        });
    },
    // 刷新数据
    refresh2() {
        this.getListPopular('refresh', 0);
        this.setData({
            empty: false
        })
    },
    // 加载更多
    more2() {
        this.getListPopular('more', this.data.page);
    },
    // 刷新数据
    refresh() {
        this.getList('refresh', 0);
        this.setData({
            empty: false
        })
    },
    // 加载更多
    more() {
        this.getList('more', this.data.page);
    },
    // 显示搜索蒙层
    showMask: function () {
        var that = this;
        this.setData({
            isShow: true,
            searchVal: ''
        })
        wx.getStorage({
            key: 'searchHistory',
            success: function (res) {
                that.setData({
                    historyList: res.data
                })
            }
        });
    },
    tapQuesButton: function () {
        wx.navigateTo({
            url: './ask/ask'
        });
    },
    // 隐藏搜索蒙层
    hideMask: function () {
        this.setData({
            isShow: false
        })
    },
    // 设置显示的tab
    setActive: function (e) {

        // 获取当前点击的index
        var index = e.target.dataset.index;
        // 初始化动画数据
        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease-out',
            delay: 0
        })
        // 距离左边位置
        index == 0 && animation.left((187.5 - 40) + 'rpx').step() && this.getList('refresh', 0);;
        index == 1 && animation.left((562.5 - 40) + 'rpx').step() && this.getListPopular('refresh', 0);;
        // 设置动画
        this.setData({
            animationData: animation.export()
        })
        // 设置对应class
        this.setData({
            isActive: index
        })
    },
    // 搜索话题
    searchTopic(e) {
        var that = this;
        wx.getStorage({
            key: 'searchHistory',
            success: function (res) {
                that.setData({
                    historyList: res.data
                })
            }
        });
        console.log('存储搜索历史');
        e.detail.value && that.data.historyList.indexOf(e.detail.value) === -1 && that.setData({
            historyList: that.data.historyList.concat(e.detail.value)
        })
        wx.setStorage({
            key: 'searchHistory',
            data: this.data.historyList
        });
        wx.navigateTo({
            url: '../../pages/searchResult/searchResult?key=' + e.detail.value,
            complete: function (res) {
                console.log(res, '跳转到搜索结果页')
                that.setData({
                    isShow: false
                })
            }
        });
    },
    clearAll() {
        wx.removeStorage({
            key: 'searchHistory',
            success: function (res) {
                console.log(res, '清除成功')
            }
        })
        this.setData({
            historyList: []
        })
    },
    clearItem(e) {
        // 获取当前点击的index
        var index = e.target.dataset.index;
        this.data.historyList.splice(index, 1);
        // console.log(history, this.data.historyList)
        this.setData({
            historyList: this.data.historyList
        })
        wx.setStorage({
            key: 'searchHistory',
            data: this.data.historyList
        });
    },
    goDetail(item) {
        item = item.currentTarget.dataset.item;
        const { objectId } = item;
        wx.navigateTo({
            url: './answer/answer?id=' + objectId
        })
    },
    onShareAppMessage() {
        return {
            title: "高校灯塔·问问(小程序)",
            path: "pages/question/question",
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