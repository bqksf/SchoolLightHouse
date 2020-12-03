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

  try {
    // 清空数据库列表
    const _ = db.command
    await db.collection('scheduleRemindList').where({
      time: _.exists(true)
    }).remove()


    // 今天星期几
    const nowDate = new Date();
    let dayOfTheWeek = nowDate.getDay(); //获取当前星期X(0-6,0代表星期天)
    dayOfTheWeek = dayOfTheWeek == 0 ? 7 : dayOfTheWeek;
    // 获取所有 需要提醒的用户 的 考试信息，添加到提醒列表数据库
    // 先取出集合记录总数
    const countResult = await db.collection('studyData').where({
      needScheduleRemind: true
    }).count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组 
    const studyDataRespArr = []
    // 获取所有数据
    for (let i = 0; i < batchTimes; i++) {
      const promise = await db.collection('studyData').where({
        needScheduleRemind: true
      }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      studyDataRespArr.push(promise)
    }
    // 遍历promise数组
    for (let i in studyDataRespArr) {
      // 对于每一个promise，它data里面有MAX_LIMIT个对象
      const promise = studyDataRespArr[i];
      // 遍历promise的data，有MAX_LIMIT个学习信息对象
      for (let s in promise.data) {
        // 对于每一个对象，就是学习信息了
        const studyData = promise.data[s]
        //课程表
        const day_schedule = studyData.schedule.schedule[dayOfTheWeek - 1]
        //通过openid找公众号openid和学校代码（用于找学期开始时间）
        const { _openid } = studyData
        const userResp = await db.collection('user').where({
          _openid
        }).get()
        //获取到的学校代码和公众号openid
        const {
          schoolCode,
          _openidGZH
        } = userResp.data[0]
        // 判断公众号id，只有存在（关注了公众号）才进行后续判断
        if (_openidGZH && _openidGZH.length > 0) {
          //获取到学期开始时间
          const schoolResp = await db.collection('school').where({
            code: schoolCode
          }).get()
          const {
            startTime
          } = schoolResp.data[0]
          //计算第几周
          const weekNum = getWhichWeek(startTime)
          //判断课程是否再本周
          for (let d in day_schedule) {
            const section_schedule = day_schedule[d]
            for (let s in section_schedule) {
              // 对于每一个课程信息 判断时间 添加到提醒列表数据库
              const schedule = section_schedule[s]
              if (schedule['weeks_arr'].indexOf(weekNum) != -1) {
                const {
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
        } else {
          // 取关了公众号，关闭用户的提醒设置
          await db.collection('studyData').doc(studyData._id).update({
            data: {
              needScheduleRemind: false
            }
          });
        }
      }
    }
  } catch (e) {
    log.error({
      message: '设置课程提醒列表失败：',
      data: e.toString()
    });
    return false;
  }
  return true;
}

//根据开始时间计算第几周
function getWhichWeek(startTime) {
  //哪一周
  const startTimeStamp = Math.round(startTime.getTime() / 1000);
  const nowTimeStamp = Math.round(new Date().getTime() / 1000);
  let weekNum = parseInt((nowTimeStamp - startTimeStamp) / 60 / 60 / 24 / 7) + 1; //度过了几个7天
  return weekNum;
}