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
    isUpload: false,
    isSubmited: false,
    submitedID: '',
  },
  bindPickerChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  async pickPhoto() {
    if (this.data.fileID.length < 5) {
      await wx.chooseImage({
          count: 5-this.data.fileID.length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
        })
        .then(async res => {
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
            }).then(res => {
              //保存fileID
              this.data.fileID.push(res.fileID)
            })
          }
          this.setData({
            fileID: this.data.fileID,
            isUpload: true
          })
          wx.hideLoading()
        })
        .catch(e => {
          console.error('[上传文件] 失败：', e)
          wx.showToast({
            icon: 'none',
            title: '上传失败',
          })
        })
    } else {
      wx.showToast({
        title: '上传图片已到五张'
      })
    }
  },
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
    wx.showLoading({
      title: '上传中',
    })
    if (this.data.fileID.length == 0) {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '还未上传图片',
      })
    } else if (this.data.isSubmited) {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '本条信息已经上传',
      })
    } else {
      await db.collection('secondHand').add({
          data: {
            info: this.data.info,
            fileID: this.data.fileID,
            type: this.data.typeArray[this.data.typeIndex],
            price:this.data.price
          }
        }).then(res => {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '上传成功',
          })
          this.setData({
            submitedID: res._id,
            isSubmited: true
          })
          //TODO 返回上一页或者清空?
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
    if (this.data.isSubmited) {
      this.setData({
        isUpload: false,
        isSubmited: false,
        fileID: [],
        formData: {}
      })
    } else {
      await wx.cloud.deleteFile({
        fileList: this.data.fileID
      }).then(res => {
        this.setData({
          isUpload: false,
          isSubmited: false,
          fileID: [],
          typeIndex: 0,
          info: '',
          infolength: 0,
          submitedID: '',
          price: '',
          pricelenght: 0,
        })
      })
    }
  },
  onLoad() {},
})