// 云函数入口文件
const cloud = require('wx-server-sdk')
// const sha1 = require('sha1')
const xml2js = require('xml2js')
const got = require('got');

cloud.init({
    env: 'release-5gt6h0dtd3a72b90'
})
const db = cloud.database()
const log = cloud.logger()

//Token:bug123
//EncodingAESKey:U8nGeCnqNDKhwBZzOprgevZf7M7j0VqcSTWYa3aPSni

const wechatConfig = {
    Token: 'bug123',
    EncodingAESKey: 'U8nGeCnqNDKhwBZzOprgevZf7M7j0VqcSTWYa3aPSni',
    openid: 'gh_2f7a0b598559'
}

// 云函数入口函数
exports.main = async (event, context) => {
    // 公众号后台开发配置添加服务器时的验证token
    // return checkToken(event);

    // 创建自定义菜单
    // return await createCustomMenu();


    try {
        // 解码收到的xml消息
        const { body, isBase64Encoded } = event;
        let xml = body;
        // 有base64编码的情况，先解码
        if (isBase64Encoded) {
            xml = Buffer.from(body, 'base64').toString('utf-8');
        }
        xml = await xml2js.parseStringPromise(xml, { explicitArray: false });
        xml = xml.xml;// 真实数据被<xml></xml>标签包起来了
        console.dir(xml);

        // 获取access_token
        const access_token = await getAccessToken();

        // 判断消息类型
        const fromOpenid = xml.FromUserName;
        const { MsgType } = xml;
        const Event = xml.Event || null;
        const Content = xml.Content || null;
        const EventKey = xml.EventKey || null;
        switch (MsgType) {
            case 'event':
                switch (Event) {
                    case 'subscribe':
                        // 关注公众号
                        // 用openid拿unionid
                        let url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + fromOpenid + '&lang=zh_CN';
                        let httpResp = await got(url);
                        httpResp = JSON.parse(httpResp.body);
                        const unionid = httpResp.unionid || null;
                        // 把两个id都保存到数据库
                        await db.collection('userGZH').add({
                            data: {
                                _openid: fromOpenid,
                                _unionid: unionid,
                                createAt: new Date()
                            }
                        });
                        // 如果user表里有这个unionid的话，就保存到openidGZH属性里
                        const userResp = await db.collection('user').where({
                            _unionid: unionid
                        }).get();
                        const user = userResp.data;
                        if (user.length !== 0) {
                            // 有这个小程序用户，更新openidGZH属性
                            await db.collection('user').doc(user._id).update({
                                data: {
                                    _openidGZH: fromOpenid
                                }
                            });
                        }
                        // 发送关注消息
                        return txtMsg(fromOpenid, '感谢关注，您现在可以使用小程序的课程提醒、考试提醒等功能了^_^\n快去试试把！');
                        break;

                    case 'unsubscribe':
                        // 取关公众号
                        // 根据openid在数据库里删除掉记录
                        await db.collection('userGZH').where({
                            _openid: fromOpenid
                        }).remove();
                        break;

                    case 'CLICK':
                        console.log('点击菜单：' + EventKey);
                        // 各种key的菜单按钮
                        switch (EventKey) {
                            case 'GROUP':
                                // 华广微信群
                                const kefuWechatResp = await db.collection('configGZH').where({
                                    key: 'kefuWechat'
                                }).get();
                                const kefuWechat = kefuWechatResp.data[0].value;
                                return txtMsg(fromOpenid, '请添加客服微信号：' + kefuWechat + '\n邀请您入群')
                                break;

                            default:
                                throw '其他按钮';
                                break;
                        }
                        break;

                    default:
                        throw '其他Event事件';
                        break;
                }
                break;

            case 'text':
                console.log('文本消息：' + Content);
                // 收到文字的各种情况
                switch (Content) {
                    case 'test':
                        return txtMsg(fromOpenid, '测试成功！');
                        break;

                    default:
                        break;
                }
                break;

            default:
                throw '其他MsgType事件';
                break;
        }
    }
    catch (e) {
        log.error({ message: '公众号处理云函数出错：', data: e.toString() });
    }
    return '';// 无论如何都要求返回一个空串，不然微信会重试3次
}

async function getAccessToken() {
    const configGZHResp = await db.collection('configGZH').where({
        key: 'access_token'
    }).get();
    return configGZHResp.data[0].value;
}

async function createCustomMenu() {
    dataJson = {
        "button": [
            {
                "type": "miniprogram",
                "name": "高校灯塔小程序",
                "appid": "wxf203d0e6cfbed41a",
                "url": "http://mp.weixin.qq.com",
                "pagepath": "pages/index/index"
            },
            {
                "type": "click",
                "name": "华广微信群",
                "key": "GROUP"
            }]
    }
    const access_token = await getAccessToken();
    let url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + access_token;
    let httpResp = await got.post(url, {
        json: dataJson,
        responseType: 'json'
    });
    const { errcode } = httpResp.body;
    if (errcode === 0) {
        console.log('设置菜单成功');
        return true;
    } else {
        console.dir(httpResp.body);
        return false;
    }
}

function checkToken(event) {
    const { signature, timestamp, nonce, echostr } = event.queryStringParameters;
    let str = [wechatConfig.Token, timestamp, nonce].sort().join('');
    let sha = sha1(str);
    console.log(sha, signature);
    if (sha == signature) {
        return echostr;
    } else {
        return false;
    }
}

function jsonToXml(obj) {
    const builder = new xml2js.Builder();
    return builder.buildObject(obj);
}

function txtMsg(to, content) {
    return jsonToXml({
        xml: {
            ToUserName: to,
            FromUserName: wechatConfig.openid,
            CreateTime: Date.now(),
            MsgType: 'text',
            Content: content
        }
    })
}