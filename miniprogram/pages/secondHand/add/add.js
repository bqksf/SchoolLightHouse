// miniprogram/pages/secondHand/add/add.js
const db = wx.cloud.database()
Page({
  data: {
    typeArray: ['A', 'B', 'C', 'D'],
    typeIndex: 0,
    info: '',
    infolength: 0,
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
          count: 5,
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
        }).catch(e => {
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
  textareaInput(e) {
    let info = e.detail.value
    let infolength = info.length
    this.setData({
      info,
      infolength
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
            type: this.data.typeArray[this.data.typeIndex]
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
  async cancel() {
    wx.showLoading({
      title: '删除中',
    })
    //如果还没上传
    if (!this.data.isSubmited) {
      await wx.cloud.deleteFile({
        fileList: this.data.fileID
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '取消图片上传',
        })
        this.setData({
          isUpload: false,
          fileID: [],
          typeIndex: 0,
          info: '',
          infolength: 0,
          submitedID: '',
        })
        //TODO 返回上一页
      }).catch(e => {
        console.error(e);
      })
    } else //TODO 如果已经上传
    {
      await wx.cloud.deleteFile({
        fileList: this.data.fileID
      }).then(async res => {
        await db.collection('secondHand').doc(this.data.submitedID).remove()
          .then(res => {
            wx.hideLoading()
            wx.showToast({
              icon: 'none',
              title: '取消图片上传',
            })
            this.setData({
              isUpload: false,
              isSubmited: false,
              fileID: [],
              typeIndex: 0,
              info: '',
              infolength: 0,
              submitedID: '',
            })
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
      this.cancel()
    }
  },
  onLoad() {},
})