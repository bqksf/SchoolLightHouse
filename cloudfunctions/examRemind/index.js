// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  //TODO! 1.判断时间是否到需要提醒范围 2.发送模板提醒
  var d = new Date()
  var remindTime = d.getHours() + 1
  //获取所有需要提醒的内容
  const temp = await db.collection('examRemindList').where({}).get()
  const examRemindList = temp.data
  
  for (let e in examRemindList) {
    console.log(examRemindList[e]._id);
    //用完就删
    if (examRemindList[e].examtime.split(':')[0] == remindTime) {
      console.log("todo:发送提醒消息")
      await db.collection("examRemindList").where({
        _id:examRemindList[e]._id
      }).remove()
    }

  }
  // await got.post('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=ACCESS_TOKEN',{
  //   json:{
  //     //TODO 公众号的openid
  //     "touser": "",
  //     //TODO 模板id
  //     "template_id": "",
  //     //TODO 跳转页面
  //     "url": "",
  //     "topcolor": "#FF0000",
  //     //TODO 数据，event中或者数据库中提供
  //     "data": {
  //       "first": {
  //         "value": "tuip123",
  //         "color": "#173177"
  //       },
  //       "keyword1": {
  //         "value": "tuip123-kw1",
  //         "color": "#173177"
  //       },
  //       "keyword2": {
  //         "value": "tuip123-kw2",
  //         "color": "#173177"
  //       },
  //       "keyword3": {
  //         "value": "tuip123-kw3",
  //         "color": "#173177"
  //       },
  //       "remark": {
  //         "value": "tuipcain",
  //         "color": "#173177"
  //       }
  //     }
  //   },
  //   responseType:'json'
  // })
}