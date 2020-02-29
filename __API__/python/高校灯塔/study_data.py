import leancloud
from leancloud import LeanEngineError
from school_api import ZhengfangAPI
import json

study_data_engine = leancloud.Engine()


# zhengfang = ZhengfangAPI(url='http://jwxt.gcu.edu.cn', class_time_list=time_list_json, account='201810132092', password='lvjiajian*2001/')
#  schedule_data = student.get_schedule(schedule_year='2019-2020', schedule_term='2')

@study_data_engine.define
def saveOneStudyData(is_register=0):
    av_user = study_data_engine.current.user
    need_change_pass = av_user.get('needChangePass')
    if need_change_pass == 0:
        #  密码有效才继续

        #  开始执行爬虫
        account = av_user.get('stuID')
        password = av_user.get('stuPassword')
        zhengfang = ZhengfangAPI(url='http://jwxt.gcu.edu.cn', account=account, password=password)
        login_result = zhengfang.user_login()
        for i in range(9):
            login_result_str = str(json.dumps(login_result))
            if i == 8:
                raise LeanEngineError(1002, 'AI绑定教务系统验证码错误，请尝试再次提交或联系客服')
            if login_result_str == '{"error": "\u9a8c\u8bc1\u7801\u4e0d\u6b63\u786e\uff01\uff01"}':
                #  验证码错误 重试一下
                login_result = zhengfang.user_login()
            else:
                break

        Study_data = leancloud.Object.extend('study_data')
        query = Study_data.query
        query.equal_to('user', av_user)
        #  是否study_data表已存在此用户
        this_study_data = None
        try:
            this_study_data = query.first()
        except leancloud.errors.LeanCloudError as e:
            if e.code == 101:
                #  不存在，先创建
                study_data = Study_data()
                study_data.set('user', av_user)
                study_data.save()
                this_study_data = study_data

        #  保存学习数据
        if login_result is True:
            schedule_data = str(json.dumps(zhengfang.get_schedule()))
            score_data = str(json.dumps(zhengfang.get_score(use_api=3)))
            exam_data = str(json.dumps(zhengfang.get_exam_time()))

            #  保存用户教务信息数据
            if is_register == 1:
                info_data = str(json.dumps(zhengfang.get_info()))
                # 注册时候，顺便拿用户教务信息保存到user表中
                av_user.set('userInfo', info_data)
                av_user.save()

            #  开始保存
            this_study_data.set('schedule', schedule_data)
            this_study_data.set('score', score_data)
            this_study_data.set('exam', exam_data)
            this_study_data.save()
            return 'ok'
        else:
            if is_register == 0:
                #  自动任务
                av_user.set('needChangePass', 1)
                av_user.save()
            #  用户问题
            this_study_data.set('loginError', login_result['error'])
            this_study_data.save()
            raise LeanEngineError(2001, login_result['error'])

# TODO 每天自动执行
