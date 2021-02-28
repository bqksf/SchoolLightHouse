// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'release-5gt6h0dtd3a72b90'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  return db.collection('suggest').add({
    // 向suggest表中添加数据
    data: {
      msg: event.msg,
      contact: event.contact,
      createAt: new Date()
    }
  })
}