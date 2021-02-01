// miniprogram/pages/secondHand/add/add.js
Page({
  data: {
    formData: {},
    length: 0,
    fileID: [],
    isUpload: false,
  },
  async pickPhoto() {
      await  wx.chooseImage({
      count: 5,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],})
      .then(async res=>{
        wx.showLoading({
          title: '上传中',
        })
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          let filePath = res.tempFilePaths[i]
          //上传图片
          //时间戳+随机数
          let cloudPath = `secondHand/image-${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}${filePath.match(/\.[^.]+?$/)[0]}`
          await wx.cloud.uploadFile({
            cloudPath,
            filePath,
          }).then(res=>{
              //保存fileID
              this.data.fileID.push(res.fileID)
              console.log(res);
          })
        }
        this.setData({
          fileID:this.data.fileID,
          isUpload:true
        })
        wx.hideLoading()
      }).catch(e=>{
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      })
  },
  formInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
    })
    this.setData({
      length: this.data.formData.message.length
    })
    console.log(this.data.formData);
  },
  async submit(){
    const db = wx.cloud.database()
    await db.collection('secondHand').add({
      data:{
        info:this.data.formData.message,
        fileID:this.data.fileID
      }
    }).then(res=>{
      console.log('tuip123');
      //TODO 返回上一页或者清空？
    })
  },
  async cancel(){
    
    wx.showLoading({
      title: '删除中',
    })
    await wx.cloud.deleteFile({
      fileList: this.data.fileID
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '取消图片上传',
      })
      this.setData({
        isUpload:false,
        fileID:[],
      })
    }).catch(error => {
    })
  },
  onLoad() {},
})