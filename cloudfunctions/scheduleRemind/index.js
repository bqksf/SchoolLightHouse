// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got')
cloud.init({
  env: 'release-5gt6h0dtd3a72b90'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var d = new Date()
  var remindTime = d.getHours() + 1
  const temp = await db.collection('scheduleRemindList').where({}).get()
  const scheduleRemindList = temp.data
  for (let s in scheduleRemindList) {
    let schedule = scheduleRemindList[s]
    if (schedule.time.split(':')[0] == remindTime) {
      console.log("TODO:发送提醒消息")
      await cloud.openapi.uniformMessage.send({
        touser:schedule._openidGZH,
        mpTemplateMsg: {
          appid: 'wx3df92dead7bcd174',
          templateId: '-YwXVzr-AmtEGt0vXElhzIfDJRFuOqdSreDI0Og-Rg4',
          url: '',
          data:{
            "first": {
              "value": "课程即将开始",
              "color": "#173177"
            },
            "keyword1": {
              "value": schedule.name,
              "color": "#173177"
            },
            "keyword2": {
              "value": schedule.time,
              "color": "#173177"
            },
            "remark": {
              "value": "上课地点："+schedule.place+"不要迟到",
              "color": "#173177"
            }
          },
          miniprogram:{
            appid:'wxf203d0e6cfbed41a',
            page:'pages/index?foo=bar'
          }
        }
      })
      //用完就删
      await db.collection("scheduleRemindList").where({
        _id:schedule._id
      }).remove()
    }
  }
}