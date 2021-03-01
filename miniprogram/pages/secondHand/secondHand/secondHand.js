// miniprogram/pages/secondHand/secondHand/secondHand.js
const db = wx.cloud.database()
let app = getApp()
const MAX_LIMIT = 100
Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    theme: wx.getSystemInfoSync().theme,
    isShow: false,
    imgWidth: 0,
    imgHeight: 0,
    showGoods: [],
    allGoods: [],
    search_msg: "",
    typeMenuOpen: false,
    type_items: [],
    admin: false
  },
  // 显示搜索蒙层
  showMask() {
    this.setData({
      isShow: true
    })
  },
  // 隐藏搜索蒙层
  hideMask() {
    this.setData({
      isShow: false
    })
  },
  async onPullDownRefresh() {
    wx.vibrateShort();
    await this.onLoad();
    wx.stopPullDownRefresh();
  },
  goAdd(e) {
    if (this.data.admin) {
      wx.navigateTo({
        url: '/pages/secondHand/add/add',
      })
    } else {
      wx.showModal({
        title: '发布商品',
        content: '您可以加客服xxxx来发布商品噢',
        showCancel: false,
      });
    }
  },
  goDetail(e) {
    let _id = e.currentTarget.dataset._id
    wx.navigateTo({
      url: '/pages/secondHand/detail/detail?_id=' + _id
    });
  },
  //进行选项修改操作后
  async afterSet() { },
  async onLoad() {
    wx.showLoading({
      title: '正在加载',
    })
    //此处代码实现了 获取集合中所有的内容 多线程
    const countResult = await db.collection('secondHand').count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / 100)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('secondHand').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }

    //此处将获取到的tasks 进行二步转换 适配goods
    let goods = []
    for (let a = 0; a < batchTimes; a++) {
      let dataTemp = (await tasks[a]).data
      for (let b = 0; b < MAX_LIMIT && b < dataTemp.length; b++) {
        let goodTemp = dataTemp[b]
        let good = {
          info: goodTemp.info,
          _id: goodTemp._id,
          fileID: goodTemp.fileID[0],
          type: goodTemp.type,
          price: goodTemp.price
        }
        goods.push(good)
      }
    }
    
    const types=await db.collection('configGZH').get()

    this.setData({
      allGoods: goods,
      showGoods: goods,
      admin: !app.globalData.firstlogin && app.globalData.userInfo.secondHandAdmin ? true : false,
      type_items:types.data[2].typeitems
    })
    wx.hideLoading({})
  },

  getInputVal(e) {
    var value = e.detail.value
    this.setData({
      search_msg: value
    })
  },

  showTypes() {
    console.log("click typeMenu")
    if (this.data.typeMenuOpen) {
      this.setData({
        typeMenuOpen: false
      })
    } else {
      this.setData({
        typeMenuOpen: true
      })
    }
  },

  search() {
    // lc
    let val = this.data.search_msg
    console.log("查询的内容：", val)
    wx.navigateTo({
      url: '/pages/secondHand/selectResults/selectResults?val=' + val,
    })
    // const db = wx.cloud.database();
    // const _ = db.command

    // db.collection('secondHand').where(_.or([{
    //     info: db.RegExp({ //info属性筛选
    //       regexp: '.*' + val,
    //       options: 'i',
    //     })
    //   },
    //   //   {    //其他属性
    //   //     address: db.RegExp({
    //   //       regexp: '.*' + key,
    //   //       options: 'i',
    //   //     })
    //   //   }
    // ])).get({
    //   success: res => {
    //     let goods = []
    //     let dataTemp = res.data
    //     for (let a in dataTemp) {
    //       console.log(dataTemp[a]);
    //       let goodTemp = dataTemp[a]
    //       let good = {
    //         info: goodTemp.info,
    //         _id: goodTemp._id,
    //         fileID: goodTemp.fileID[0],
    //         type: goodTemp.type
    //       }
    //       goods.push(good)
    //     }
    //     this.setData({
    //       showGoods:goods
    //     })
    //   },
    //   fail: err => {
    //     console.error(err)
    //   }
    // })

  },

  tap_item(e) {
    //跳转到新页面再搜索
    let selectedType = e.currentTarget.dataset.typename
    wx.navigateTo({
      url: '/pages/secondHand/selectResults/selectResults?type=' + selectedType,
    })
    // this.setData({
    //   showGoods: []
    // })
    // let allGoods = this.data.allGoods
    // let showGoods = []
    // for (let a in allGoods) {
    //   if (allGoods[a].type === selectedType) {
    //     showGoods.push(allGoods[a])
    //   }
    // }
    // this.setData({
    //   showGoods
    // })
  },

})