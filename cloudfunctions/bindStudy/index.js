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
  const { stuID, stuPassword } = event;

  // 存不存在
  const studyDataResp = await db.collection('studyData').where({
    _openid: OPENID
  }).get();
  let studyData = studyDataResp.data;
  if (studyData.length !== 0) {
    // 已经绑定
    return returnRule.fail('您已绑定，请不要重复绑定！');
  }

  // 访问爬虫
  let url = 'https://service-lbinlxgu-1252070599.gz.apigw.tencentcs.com/release/getBindData?account=' + stuID + '&password=' + encodeURIComponent(stuPassword);
  let httpResp = await got(url);
  httpResp = JSON.parse(httpResp.body);
  let { data } = httpResp;

  if (httpResp.status === 'loginError') {
    // 登录失败
    log.error({ message: '添加学生所有信息数据库失败：', data: data.error.msg, _openid: OPENID });
    return returnRule.fail('登录教务系统失败', data.error.msg);
  }
  if ('error' in data.examTime && 'error' in data.schedule && 'error' in data.score) {
    // 爬虫失败
    // 2020.12.8 改为全部错误，不然新生是没有考试成绩的，就会直接考试失败了
    log.error({ message: '查询教务系统失败：', data: JSON.stringify(data), _openid: OPENID });
    return returnRule.fail('查询教务系统失败', JSON.stringify(data));
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

  // 保存到数据库
  try {
    await db.collection('studyData').add({
      data: {
        _openid: OPENID,
        createAt: new Date(),
        needChangePassword: false,
        examTime: data.examTime,
        schedule: data.schedule,
        score: data.score,
        info: data.info,
        stuID: stuID,
        stuPassword: stuPassword,
        updateAt: new Date()
      },
    });
  } catch (e) {
    log.error({ message: '添加学生所有信息数据库失败：', data: e.toString(), _openid: OPENID });
    return returnRule.fail('添加信息失败：', e.toString());
  }
  return returnRule.success();
}