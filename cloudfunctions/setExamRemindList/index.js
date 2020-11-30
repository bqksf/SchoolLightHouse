// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const log = cloud.logger()
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  //清空列表
  const _ = db.command
  try {
    const a=await db.collection('examRemindList').where({
      exam: _.exists(true)
    }).remove()
  } catch (e) {
    console.error(e)
  }
  //获取当前日期
  var d = new Date();
  var today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDay()
  console.log(today)
  try {
    // 先取出集合记录总数
    const countResult = await db.collection('studyData').count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组 
    const studyDataResp = []
    //获取所有数据
    for (let i = 0; i < batchTimes; i++) {
      const promise = await db.collection('studyData').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
        needExamRemind: true
      }).get()
      studyDataResp.push(promise)
    }
    //遍历学习信息数组，获取考试信息
    for (let a in studyDataResp[0].data) {
      let studyData=studyDataResp[0].data[a]
      let _openid=studyData._openid
      let temp= await db.collection('user').where({
        _openid
      }).get()
      let {_openidGZH}=temp.data[0]
      //判断公众号id，只有存在（关注了公众号）才进行后续判断
      if(_openidGZH.length>0){
        let examTime=studyData.examTime
        let dataKeysArr = Object.keys(examTime)
        let yearTitle = dataKeysArr[0];
        let sectionExamArr = examTime[yearTitle];
        for (let e in sectionExamArr) {
          //获取考试信息 判断时间 添加到提醒库
          let exam=sectionExamArr[e]
          if(sectionExamArr[e].day==today){
            await db.collection('examRemindList').add({
              data:{
                _openidGZH,
                examName:exam.lesson_name,
                examDay:exam.day,
                examtime:exam.time
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
    return returnRule.fail('查询studyData数据库失败', e.toString());
  }
}