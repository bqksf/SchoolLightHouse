// miniprogram/pages/mine/suggest/suggest.js
Page({
    data: {

    },
    bindFormSubmit: function(e) {
        let msg = e.detail.value.msg  //留言内容
        let contact = e.detail.value.contact  //联系方式

        if(msg!='' && contact != '')  //留言和联系方式都不为空
        {
          // 调用云函数 setSuggest 将数据存入数据库
          wx.cloud.callFunction({
            name: 'addSuggest',
            data: {
              msg:msg, //输入框内的内容
              contact:contact
            },
          })
          .then(res => {
            console.log(res.result) 
          })
          .catch(console.error)

          wx.showToast({
            title: '感谢您的反馈',
            icon: 'succes',
            duration: 1000,
            mask:true
        })
          sleep(1000)
          wx.navigateBack({
            delta: 0,
          })
        }else{
          wx.showToast({
            title: '留言或联系方式不能为空',
            icon: 'none',
            duration: 2000,
            mask:true
        })
        }
    },

   
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})

function sleep(numberMillis) { 
    var now = new Date(); 
    var exitTime = now.getTime() + numberMillis; 
    while (true) { 
    now = new Date(); 
    if (now.getTime() > exitTime) 
    return; 
    } 
}