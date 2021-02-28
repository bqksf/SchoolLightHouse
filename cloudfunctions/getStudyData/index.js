// 云函数入口文件
const cloud = require('wx-server-sdk')
const returnRule = require('./returnRule')
const got = require('got');

cloud.init({
  env: 'release-5gt6h0dtd3a72b90'
})
const db = cloud.database()
const log = cloud.logger()
let getPachongErrorMsg = ""

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  // 先检查有没有绑定账号密码
  try {
    const studyDataResp = await db.collection('studyData').where({
      _openid: OPENID
    }).get();
    let studyData = studyDataResp.data;
    if (studyData.length === 0) {
      // 没有绑定
      return returnRule.fail('noBind');
    }

    // 有绑定
    studyData = studyData[0];
    const { updateAt, needChangePassword, stuID, stuPassword } = studyData;
    let { examTime, schedule, score } = studyData;
    // 检查密码是否已更改
    if (needChangePassword) {
      return returnRule.success({
        needChangePassword: true
      });
    }
    // 检查获取爬虫信息的时间，大于7天就重新获取（包括有账号密码，但是没有获取到数据的）
    if ((isObjEmpty(examTime) && isObjEmpty(schedule) && isObjEmpty(score)) || is7DaysLater(updateAt) || event.refresh) {
      // 获取爬虫数据
      let data = await getPachongDataAndSafe(stuID, stuPassword, OPENID);
      if (!data) {
        // 爬虫返回的错误提示处理
        switch (getPachongErrorMsg) {
          case 'password':
            // 密码错误
            return returnRule.success({
              needChangePassword: true
            });
            break;
          case 'notRegister':
            // 学籍提示未注册，一般在还没开学的时候
            // 如果有旧内容，就正常返回，然后在小程序公告提示未开学
            if (isObjEmpty(examTime) && isObjEmpty(schedule) && isObjEmpty(score)) {
              // 没有旧内容，直接提示未开学错误
              return returnRule.fail('notRegister',"您还没在新学期注册或学校未开学，教务系统无法获取最新信息。请开学时在教务处注册后再刷新重试。");
            } else {
              // 2020.12.8 对象为空的时候返回给小程序为null就不会加载了
              if (isObjEmpty(examTime)) {
                examTime = null;
              }
              if (isObjEmpty(schedule)) {
                schedule = null;
              }
              if (isObjEmpty(score)) {
                score = null;
              }
              returnData = {
                examTime: examTime,
                schedule: schedule,
                score: score,
                needChangePassword: false,
                notRegister: true
              };
              return returnRule.success(returnData);
            }
            break;
          default:
            // 其他错误，直接throw到小程序里提示
            throw getPachongErrorMsg;
            break;
        }

      }
      // 2020.12.8 对象为空的时候返回给小程序为null就不会加载了
      if (isObjEmpty(data.examTime)) {
        data.examTime = null;
      }
      if (isObjEmpty(data.schedule)) {
        data.schedule = null;
      }
      if (isObjEmpty(data.score)) {
        data.score = null;
      }
      // 返回数据
      returnData = {
        examTime: data.examTime,
        schedule: data.schedule,
        score: data.score,
        needChangePassword: false
      };
      return returnRule.success(returnData);

    } else {
      // 小于7天，直接返回
      // 2020.12.8 对象为空的时候返回给小程序为null就不会加载了
      if (isObjEmpty(examTime)) {
        examTime = null;
      }
      if (isObjEmpty(schedule)) {
        schedule = null;
      }
      if (isObjEmpty(score)) {
        score = null;
      }
      returnData = {
        examTime: examTime,
        schedule: schedule,
        score: score,
        needChangePassword: false
      };
      return returnRule.success(returnData);
    }
  } catch (e) {
    log.error({ message: '查询studyData数据库失败：', data: e.toString(), _openid: OPENID });
    return returnRule.fail('查询studyData数据库失败', e.toString());
  }

}

function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function is7DaysLater(date) {
  const nowTime = Math.round(new Date().getTime() / 1000);
  const dateTime = Math.round(date.getTime() / 1000);
  return (nowTime - dateTime) > (86400 * 7) ? true : false;
}

async function getPachongDataAndSafe(stuID, stuPassword, OPENID) {
  let url = 'https://service-66dnrqg4-1252070599.gz.apigw.tencentcs.com/release/getStudyData?account=' + stuID + '&password=' + encodeURIComponent(stuPassword);
  let httpResp = await got(url);
  httpResp = JSON.parse(httpResp.body);
  const { data } = httpResp;
  // 保存到数据库
  if (httpResp.status === 'loginError' && data.error.msg.includes('密码错误')) {
    // 密码错误
    try {
      await db.collection('studyData').where({
        _openid: OPENID
      }).update({
        data: {
          needChangePassword: true,
          updateAt: new Date()
        },
      });
    } catch (e) {
      log.error({ message: '更新为密码错误数据库失败：', data: e.toString(), _openid: OPENID });
    }
    getPachongErrorMsg = "password";
    return false;
  }
  if (httpResp.status === 'loginError' && data.error.msg.includes('您还未注册，请到学院或教务管理部门进行注册。')) {
    // 开学前会提示未注册
    getPachongErrorMsg = "notRegister";
    return false;
  }
  if (httpResp.status === 'loginError') {
    // 其他登陆错误
    getPachongErrorMsg = data.error.msg;
    return false;
  }
  // 2020.12.8 针对单项错误，传入空对象作为处理方案
  if ('error' in data.examTime) {
    log.warn({ message: '查询考试时间失败：', data: JSON.stringify(data), _openid: OPENID });
    data.examTime = {};
  }
  if ('error' in data.schedule) {
    log.warn({ message: '查询课程表失败：', data: JSON.stringify(data), _openid: OPENID });
    data.schedule = {};
  }
  if ('error' in data.score) {
    log.warn({ message: '查询考试成绩失败：', data: JSON.stringify(data), _openid: OPENID });
    data.score = {};
  }
  try {
    await db.collection('studyData').where({
      _openid: OPENID
    }).update({
      data: {
        examTime: data.examTime,
        schedule: data.schedule,
        score: data.score,
        updateAt: new Date()
      },
    });
  } catch (e) {
    log.error({ message: '更新学生所有信息数据库失败：', data: e.toString(), _openid: OPENID });
  }
  return data;
}