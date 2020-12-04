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
    await db.collection('examRemindList').where({
      examtime: _.exists(true)
    }).remove()
    // 获取当前日期
    const date = new Date();
    let dt = ''
    if ((dt + (date.getDate() + 1)).length === 1) {dt = '0'}
    const today = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + dt + (date.getDate()  + 1)
    console.log(today);
    // 获取所有 需要提醒的用户 的 考试信息，添加到提醒列表数据库
    // 先取出集合记录总数
    const countResult = await db.collection('studyData').where({
      needExamRemind: true
    }).count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组 
    const studyDataRespArr = []
    // 获取所有数据
    for (let i = 0; i < batchTimes; i++) {
      const promise = await db.collection('studyData').where({
        needExamRemind: true
      }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      studyDataRespArr.push(promise)
    }
    // 遍历promise数组
    for (let i in studyDataRespArr) {
      // 对于每一个promise，它data里面有MAX_LIMIT个对象
      const promise = studyDataRespArr[i];
      // 遍历promise的data，有MAX_LIMIT个学习信息对象
      for (let a in promise.data) {
        // 对于每一个对象，就是学习信息了
        const studyData = promise.data[a]
        const {
          _openid
        } = studyData
        const userResp = await db.collection('user').where({
          _openid
        }).get()
        const {
          _openidGZH
        } = userResp.data[0]
        // 判断公众号id，只有存在（关注了公众号）才进行后续判断
        if (_openidGZH && _openidGZH.length > 0) {
          // 获取所有考试信息
          const {
            examTime
          } = studyData
          const dataKeysArr = Object.keys(examTime)
          const yearTitle = dataKeysArr[0];
          const sectionExamArr = examTime[yearTitle];
          for (let e in sectionExamArr) {
            // 对于每一个考试信息 判断时间 添加到提醒列表数据库
            const exam = sectionExamArr[e]
            if (exam.day === today) {
              await db.collection('examRemindList').add({
                data: {
                  _openidGZH,
                  examName: exam.lesson_name,
                  examDay: exam.day,
                  examtime: exam.time,
                  location: exam.location
                }
              })
            }
          }
        } else {
          // 取关了公众号，关闭用户的提醒设置
          await db.collection('studyData').doc(studyData._id).update({
            data: {
              needExamRemind: false
            }
          });
        }

      }
    }

  } catch (e) {
    log.error({
      message: '设置考试提醒列表失败：',
      data: e.toString()
    });
    return false;
  }
  return true;
}