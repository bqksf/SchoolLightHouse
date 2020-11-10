from school_api.utils import to_text, Request, get_time_list, error_handle
from school_api.config import URL_PATH_LIST, CLASS_TIME
from school_api.api import *


class ZhengfangAPI:

    def __init__(self, url=None, account=None, password=None, name=None, code=None,
                 exist_verify=True, proxies=None, timeout=10, login_url_path=None, url_path_list=None,
                 class_time_list=None, use_proxy=False, **kwargs):
        self.config = {
            'code': code,
            'name': to_text(name),
            'exist_verify': exist_verify,
            'login_url': login_url_path or "/default2.aspx",
            'url_path_list': url_path_list or URL_PATH_LIST,
            'time_list': get_time_list(class_time_list or CLASS_TIME),
            'use_proxy': use_proxy
        }
        base_url = url.split('/default')[0] if url[-4:] == 'aspx' else url
        self.user = {
            'account': to_text(account),
            'password': password,
            'proxy_state': False
        }

        # 初始化请求类
        self.Request = Request(self.config, base_url, proxies, timeout)

    @error_handle
    def user_login(self, **kwargs):
        return Login(self.config, self.user, self.Request).get_login(**kwargs)

    @error_handle
    def get_schedule(self, *args, **kwargs):
        return Schedule(self.config, self.user, self.Request).get_schedule(*args, **kwargs)

    @error_handle
    def get_info(self, **kwargs):
        return UserlInfo(self.config, self.user, self.Request).get_info(**kwargs)

    @error_handle
    def get_score(self, *args, **kwargs):
        return Score(self.config, self.user, self.Request).get_score(*args, **kwargs)

    @error_handle
    def get_exam_time(self, **kwargs):
        return ExamTime(self.config, self.user, self.Request).get_exam_time(**kwargs)

    # @error_handle
    # def post_rate(self, **kwargs):
    # self.rate = Rate(self.config,self.user,self.Request)
    #     return self.rate.post_rate(**kwargs)
