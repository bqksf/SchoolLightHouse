// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'release-5gt6h0dtd3a72b90'
})
const db = cloud.database()
const log = cloud.logger()
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  //清空列表
  const _ = db.command
  try {
    const a = await db.collection('scheduleRemindList').where({
      lessontime: _.exists(true)
    }).remove()
  } catch (e) {
    console.error(e)
  }


  //今天星期几
  const nowDate = new Date();
  let dayOfTheWeek = nowDate.getDay(); //获取当前星期X(0-6,0代表星期天)
  dayOfTheWeek = dayOfTheWeek == 0 ? 7 : dayOfTheWeek;

  try {
    //获取所有 需要提醒的用户 的个人信息
    //先取出集合记录总数
    const countResult = await db.collection('studyData').count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组 
    const studyDataResp = []
    //获取所有数据
    for (let i = 0; i < batchTimes; i++) {
      const promise = await db.collection('studyData').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
        needScheduleRemind: true
      }).get()
      studyDataResp.push(promise)
    }

    //遍历学习数据
    for (let s in studyDataResp[0].data) {
      let studyData = studyDataResp[0].data[s]
      //课程表
      let day_schedule = studyData.schedule.schedule[dayOfTheWeek - 1]

      //通过openid找公众号openid和学校代码（用于找学期开始时间）
      let _openid = studyData._openid
      let user = await db.collection('user').where({
        _openid
      }).get()
      //获取到的学校代码和公众号openid
      let {
        schoolCode,
        _openidGZH
      } = user.data[0]
      //获取到学期开始时间
      let schoolTemp = await db.collection('school').where({
        code: schoolCode
      }).get()
      let {
        startTime
      } = schoolTemp.data[0]
      //计算第几周
      let weekNum = getWhichWeek(startTime)
      //判断课程是否再本周
      for (let d in day_schedule) {
        let section_schedule = day_schedule[d]
        for (let s in section_schedule) {
          let schedule = section_schedule[s]
          if (schedule['weeks_arr'].indexOf(weekNum) != -1) {
            let {
              name,
              place,
              time,
              teacher
            } = schedule

            await db.collection('scheduleRemindList').add({
              data: {
                _openidGZH,
                name,
                place,
                time,
                teacher
              }
            })
          }
        }
      }
    }
  } catch (e) {
    log.error({
      message: '查询studyData数据库失败：',
      data: e.toString(),
      _openid: OPENID
    });
  }
}
//根据开始时间计算第几周
function getWhichWeek(startTime) {
  //哪一周
  const startTimeStamp = Math.round(startTime.getTime() / 1000);
  const nowTimeStamp = Math.round(new Date().getTime() / 1000);
  let weekNum = parseInt((nowTimeStamp - startTimeStamp) / 60 / 60 / 24 / 7) + 1; //度过了几个7天
  return weekNum;
}