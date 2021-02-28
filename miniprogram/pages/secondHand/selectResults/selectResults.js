// miniprogram/pages/secondHand/selectResults/selectResults.js
const db = wx.cloud.database()
let app = getApp()
const MAX_LIMIT = 100
Page({
  data: {
    goods: []
  },
  goDetail(e) {
    let _id = e.currentTarget.dataset._id
    wx.navigateTo({
      url: '/pages/secondHand/detail/detail?_id=' + _id
    });
  },
  async onLoad(options) {
    // wx.showLoading({
    //   title: '正在加载',
    // })

    let {
      type,
      val
    } = options
    //如果是类型进入页面
    if (type != undefined) {
      //查询数据库
      const countResult = await db.collection('secondHand').where({
        type
      }).count()
      const total = countResult.total
      const batchTimes = Math.ceil(total / 100)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection('secondHand').where({
          type
        }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
      }
      //适配页面
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
      this.setData({
        goods
      })
    }
    //如果是搜索进入页面
    if (val != undefined) {
      await this.search(val)
    }
    //如果结果为空
    if (this.data.goods.length == 0) {
      wx.showToast({
        title: '无结果',
        icon: 'none'
      })
    }
  },
  //搜索功能 lc 
  async search(val) {
    // lc
    const _ = db.command
    await db.collection('secondHand').where(_.or([{
        info: db.RegExp({ //info属性筛选
          regexp: '.*' + val,
          options: 'i',
        })
      },
      //   {    //其他属性
      //     address: db.RegExp({
      //       regexp: '.*' + key,
      //       options: 'i',
      //     })
      //   }
    ])).get({})
    .then(res => {
      let goods = []
      let dataTemp = res.data
      for (let a in dataTemp) {
        let goodTemp = dataTemp[a]
        let good = {
          info: goodTemp.info,
          _id: goodTemp._id,
          fileID: goodTemp.fileID[0],
          type: goodTemp.type
        }
        goods.push(good)
      }
      this.setData({
        goods
      })
    }).catch(e => {
      console.error(e);
    })
  },
})