// miniprogram/pages/secondHand/add/add.js
const db = wx.cloud.database()
Page({
  data: {
    typeArray: ["科学", "经济", "名著", "漫画", "小说", "数学", "语言", "计算机", "机械", "网络"],
    typeIndex: 0,
    info: '',
    infolength: 0,
    price: '',
    pricelenght: 0,
    fileID: [],
    files:[],
    isSubmited: false,
    submitedID: '',
  },
  //选择器
  bindPickerChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  //两个文本框的输入
  infoInput(e) {
    let info = e.detail.value
    let infolength = info.length
    this.setData({
      info,
      infolength
    })
  },
  priceInput(e) {
    let price = e.detail.value
    let pricelenght = price.length
    this.setData({
      price,
      pricelenght
    })
  },

  async submit() {
    console.log(this.data);
    wx.showLoading({
      title: '上传中',
    })

    if (this.data.fileID.length == 0) {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '还未上传图片',
      })
    } 
    else if (this.data.isSubmited) {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '本条信息已经上传',
      })
    } 
    else {
      await db.collection('secondHand').add({
          data: {
            info: this.data.info,
            fileID: this.data.fileID,
            type: this.data.typeArray[this.data.typeIndex],
            price: this.data.price
          }
        })
        .then(res => {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '上传成功',
          })
          this.setData({
            submitedID: res._id,
            isSubmited: true
          })
          wx.navigateBack({
            delta: 0,
          })
        })
        .catch(e => {
          console.error(e);
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '上传失败',
          })
        })
    }
  },

  async back() {
    wx.showLoading({
      title: '正在返回',
    })
    if (this.data.isSubmited) {
      wx.navigateBack({
        delta: 0,
      })
    } else {
      //删除上传的文件
      await wx.cloud.deleteFile({
        fileList: this.data.fileID
      }).then(res => {
        wx.navigateBack({
          delta: 0,
        })
      })
    }
  },

  async next() {
    console.log(this.data);

    // if (this.data.isSubmited) {
    //   this.setData({
    //     isSubmited: false,
    //     fileID: [],
    //     formData: {}
    //   })
    // } else {
    //   await wx.cloud.deleteFile({
    //     fileList: this.data.fileID
    //   }).then(res => {
    //     this.setData({
    //       isUpload: false,
    //       isSubmited: false,
    //       fileID: [],
    //       typeIndex: 0,
    //       info: '',
    //       infolength: 0,
    //       submitedID: '',
    //       price: '',
    //       pricelenght: 0,
    //     })
    //   })
    // }
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
        let cloudPath = `secondHand-t/image-${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}${filePath.match(/\.[^.]+?$/)[0]}`
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
      fileID: e.detail.urls
    })
  },
  async uploaddelete(e) {
    let deletefile = []
    deletefile.push(e.detail.item.url)
    this.data.fileID.splice(e.detail.index, 1)
    await wx.cloud.deleteFile({
      fileList: deletefile
    })
  }
})