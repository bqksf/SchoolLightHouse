// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

    db.collection('suggest').add({
        // 向suggest表中添加数据
        data: {
          msg:event.msg,
          contact:event.contact
        }
      })
      .then(res => {
        console.log(res)
      })
}