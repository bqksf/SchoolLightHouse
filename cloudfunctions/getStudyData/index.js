// 云函数入口文件
const cloud = require('wx-server-sdk')
const returnRule = require('./returnRule')
const got = require('got');

cloud.init({
  env: 'release-5gt6h0dtd3a72b90'
})
const db = cloud.database()
const log = cloud.logger()

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
    const { examTime, schedule, score, updateAt, needChangePassword, stuID, stuPassword } = studyData;
    // 检查密码是否已更改
    if (needChangePassword) {
      return returnRule.success({
        needChangePassword: true
      });
    }
    // 检查获取爬虫信息的时间，大于7天就重新获取（包括有账号密码，但是没有获取到数据的）
    if ((isObjEmpty(examTime) && isObjEmpty(schedule) && isObjEmpty(score)) || is7DaysLater(updateAt)) {
      // 获取爬虫数据
      const data = await getPachongDataAndSafe(stuID, stuPassword, OPENID);
      if (!data) {
        // 密码错误
        return returnRule.success({
          needChangePassword: true
        });
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
      // 小于7天
      if ('error' in examTime || 'error' in schedule || 'error' in score) {
        // 有错误，重新获取爬虫再返回
        const data = await getPachongDataAndSafe(stuID, stuPassword, OPENID);
        if (!data) {
          // 密码错误
          return returnRule.success({
            needChangePassword: true
          });
        }
        // 返回数据
        returnData = {
          examTime: data.examTime,
          schedule: data.schedule,
          score: data.score,
          needChangePassword: false
        };
        return returnRule.success(returnData);
      }
      // 没错误，直接返回
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
    console.error(e);
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
      console.error(e);
    }
    return false;
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
    console.error(e);
  }
  return data;
}