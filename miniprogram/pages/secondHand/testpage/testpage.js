const db = wx.cloud.database()
Page({
  data: {
    files: [],
    fileID:[]
  },
  onLoad() {
    this.setData({
      uplaodFile: this.uplaodFile.bind(this)
    })
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  uplaodFile(files) {
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      let fileID = []
      for (let i = 0; i < files.tempFiles.length; i++) {
        let filePath = files.tempFilePaths[i]
        let cloudPath = `secondHand/image-${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath
        }).then(res => {
          fileID.push(res.fileID)
          //上传个数和返回个数相同时返回
          if (fileID.length == files.tempFiles.length) {
            resolve({
              urls: fileID
            })
          }
        }).catch(e => {
          reject('error')
        })
      }
    })
  },
  uploadError(e) {
    console.log('upload error', e.detail)
  },
  uploadSuccess(e) {
    console.log('upload success', e.detail)
    this.setData({
      fileID:e.detail.urls
    })
  },
 async uploaddelete(e){
    let deletefile=[]
    deletefile.push(e.detail.item.url)
    this.data.fileID.splice(e.detail.index,1)
    await wx.cloud.deleteFile({
      fileList:deletefile
    })
  }
});