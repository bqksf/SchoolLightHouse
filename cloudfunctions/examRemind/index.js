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
  //获取所有需要提醒的内容
  const temp = await db.collection('examRemindList').where({}).get()
  const examRemindList = temp.data
  for (let e in examRemindList) {
    let exam=examRemindList[e]
    //判断时间
    if (exam.examtime.split(':')[0] == remindTime) {
      await cloud.openapi.uniformMessage.send({
        touser: exam._openidGZH,
        mpTemplateMsg: {
          appid: 'wx3df92dead7bcd174',
          templateId: 'vaiyMl11zeD9l-nhBXPhxrZ2sbv9aD4Hb6ePed59ZT8',
          url: '',
          data: {
            "first": {
              "value": "考试即将开始",
              "color": "#173177"
            },
            "keyword1": {
              "value": exam.examName,
              "color": "#173177"
            },
            "keyword2": {
              "value": exam.examtime,
              "color": "#173177"
            },
            "remark": {
              "value": "请注意带好纸笔，不要迟到",
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
      await db.collection("examRemindList").where({
        _id:exam._id
      }).remove()
    }
  }
}