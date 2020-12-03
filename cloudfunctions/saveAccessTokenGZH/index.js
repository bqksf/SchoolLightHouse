// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');

cloud.init({
  env: 'release-5gt6h0dtd3a72b90'
})
const db = cloud.database()
const log = cloud.logger()
const AppID = 'wx3df92dead7bcd174';
const AppSecret = 'c90a38d328c6c9ab5fb542b977e21195';

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + AppID + '&secret=' + AppSecret;
    let httpResp = await got(url);
    httpResp = JSON.parse(httpResp.body);
    await db.collection('configGZH').where({
      key: 'access_token'
    }).update({
      data: {
        value: httpResp.access_token,
        updateAt: new Date()
      },
    });
    return httpResp.access_token;
  } catch (e) {
    log.error({ message: '保存access_token失败：', data: e.toString()});
    return false;
  }
}