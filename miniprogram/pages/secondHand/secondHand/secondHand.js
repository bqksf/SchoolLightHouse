// miniprogram/pages/secondHand/secondHand/secondHand.js
const db = wx.cloud.database()
const MAX_LIMIT = 100
Page({
  data: {
    imgWidth: 0,
    imgHeight: 0,
    goods: []
  },

  test(e) {
    let _id=e.currentTarget.dataset._id
    wx.navigateTo({
      url: '/pages/secondHand/detail/detail?_id' +_id
    });
  },
  //进行选项修改操作后
  async afterSet(){},
  async onLoad() {
    //此处代码实现了 获取集合中所有的内容 多线程
    const countResult = await db.collection('secondHand').count()
    const total=countResult.total
    const batchTimes = Math.ceil(total / 100)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('secondHand').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }

    //此处将获取到的tasks 进行二步转换 适配goods
    let goods=[]
    for(let a=0;a<batchTimes;a++){
      let dataTemp=(await tasks[a]).data
      for(let b=0;b<MAX_LIMIT&&b<dataTemp.length;b++){
        let goodTemp=dataTemp[b]
        let good={info:goodTemp.info,_id:goodTemp._id,fileID:goodTemp.fileID[0]}
        goods.push(good)
      }
    }
    this.setData({
      goods
    })
  },
})