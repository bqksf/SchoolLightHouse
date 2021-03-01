// miniprogram/pages/secondHand/detail/detail.js
const db = wx.cloud.database()
let app = getApp()
Page({
  data: {
    _id: '',
    fileID: [],
    info: '',
    type: '',
    typeArray: [],
    typeIndex: 0,
    admin: false,
    changemode: false,
    price: '',
    describe: '',
    admin: false
  },
  bindPickerChange(e) {
    this.setData({
      newType: this.data.typeArray[e.detail.value]
    })
  },
  async change() {
    this.setData({
      changemode: true,
      newType: this.data.type
    })
  },
  textareaInput(e) {
    let info = e.detail.value
    let infolength = info.length
    this.setData({
      info,
      infolength
    })
  },
  changePrice(e){
    let newprice=e.detail.value
    this.setData({
      price:newprice
    })
  },
  changeDescribe(e){
    let newdescribe=e.detail.value
    this.setData({
      describe:newdescribe
    })
  },

  async changePhoto() {
    await wx.chooseImage({
      count: 5,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    }).then(async res => {
      wx.showLoading({
        title: '上传中',
      })
      let newFileID = []
      for (let i = 0; i < res.tempFilePaths.length; i++) {
        let filePath = res.tempFilePaths[i]
        let cloudPath = `secondHand/image-${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}${filePath.match(/\.[^.]+?$/)[0]}`
        await wx.cloud.uploadFile({
          cloudPath,
          filePath,
        }).then(res => {
          //记录新的照片fileID
          newFileID.push(res.fileID)
        }).catch(e => {
          newFileID = []
          console.error(e);
        })
      }
      wx.hideLoading()
      wx.showLoading({
        title: '正在更新',
      })
      //更新数据库
      if (newFileID.length > 0) {
        console.log('保存数据库');
        await db.collection('secondHand').where({
          _id: this.data._id
        }).update({
          data: {
            fileID: newFileID
          }
        }).then(async res => {
          //删除原有的fileID的文件
          await wx.cloud.deleteFile({
            fileList: this.data.fileID
          })
          //修改fileID指示的文件
          this.setData({
            fileID: newFileID
          })
        }).catch(e => {
          console.error(e);
        })
      }
    }).catch(e => {
      console.error('[上传文件] 失败：', e)
      wx.showToast({
        icon: 'none',
        title: '上传失败',
      })
    })
    wx.hideLoading()
  },
  async changeInfo() {
    wx.showLoading({
      title: '正在保存',
    })
    let {
      _id
    } = this.data
    await db.collection('secondHand').where({
      _id
    }).update({
      data: {
        info: this.data.info,
        type: this.data.newType,
        price: this.data.price,
        describe: this.data.describe
      }
    }).then(res => {
      wx.hideLoading();
      let obj = { _id:this.data._id};
      this.onLoad(obj);
      this.setData({
        changemode:false
      })
    }).catch(e => {
      console.error(e);
    })
  },
  async delete() {
    console.log(this.data._id);
    console.log(this.data.fileID);
    wx.showLoading({
      title: '正在删除',
    })
    await db.collection("secondHand").doc(this.data._id).remove().then(async res => {
      await wx.cloud.deleteFile({
        fileList: this.data.fileID
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
            icon: 'success',
            title: '删除成功',
            duration: 1000,
            success: function () {
              setTimeout(function() {
                wx.navigateBack({
                  delta: 0,
                })
              }, 1000);
            }
          })
      })
    }).catch(err => {
      wx.hideLoading({})
      console.error(err);
    })
  },
  clickIWant() {
    wx.showModal({
      title: "提示",
      content: '添加客服微信号：xxxx进行购买',
      showCancel: !1
  });
  },
  async onLoad(options) {
    wx.showLoading({
      title: '正在加载',
    })
    let {
      _id
    } = options
    await db.collection('secondHand').where({
        _id
      }).get()
      .then(res => {
        let {
          fileID,
          info,
          type,
          price,
          describe,
        } = res.data[0]
        this.setData({
          fileID,
          info,
          _id,
          type,
          price,
          describe,
        })
      })
      .catch(e => {
        console.error(e);
      })
      const types=await db.collection('configGZH').get()
    this.setData({
      admin: !app.globalData.firstlogin && app.globalData.userInfo.secondHandAdmin ? true : false,
      typeArray:types.data[2].typeitems
    })
    wx.hideLoading({})
  },
})