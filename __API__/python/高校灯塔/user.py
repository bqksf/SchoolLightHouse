import leancloud
from leancloud import LeanEngineError
from utils.WXBizDataCrypt import WXBizDataCrypt

user_engine = leancloud.Engine()


@user_engine.define
def getInfoInWechat(encrypted_data, iv):
    #  解密微信数据获取详细个人信息
    appid = 'wxf203d0e6cfbed41a'
    av_user = user_engine.current.user
    session_key = av_user.get('authData')['lc_weapp']['session_key']
    union_id = 0
    try:
        wx = WXBizDataCrypt(appid, session_key)
        decrypt_data = wx.decrypt(encrypted_data, iv)
    except Exception:
        raise LeanEngineError(1001, '微信数据解密失败')
    if decrypt_data is not None:
        try:
            av_user.set(decrypt_data)
            av_user.save()
        except Exception:
            raise LeanEngineError(1002, '更新用户数据失败')
        union_id = decrypt_data['unionId'] or 0
    return union_id
