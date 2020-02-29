import requests
from school_api.utils import to_text, Request, get_time_list, error_handle
from school_api.config import URL_PATH_LIST, CLASS_TIME
from school_api.api import *


class ZhengfangAPI:

    def __init__(self, url=None, account=None, password=None, name=None, code=None, use_ex_handle=True, exist_verify=True, lan_url=None, proxies=None,
                 priority_proxy=False, timeout=10, login_url_path=None, url_path_list=None,
                 class_time_list=None, **kwargs):
        self.config = {
            'code': code,
            'lan_url': lan_url,
            'proxies': proxies,
            'timeout': timeout,
            'name': to_text(name),
            'exist_verify': exist_verify,
            'use_ex_handle': use_ex_handle,
            'priority_proxy': priority_proxy,
            'login_url': login_url_path or "/default2.aspx",
            'url_path_list': url_path_list or URL_PATH_LIST,
            'time_list': get_time_list(class_time_list or CLASS_TIME)
        }
        self.base_url = url.split('/default')[0] if url[-4:] == 'aspx' else url
        self.session = None
        self._http = requests.Session()
        self.user = {
            'account': to_text(account),
            'password': password,
            'proxy_state': False
        }
        self._http.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) '
                          'AppleWebKit/537.36 (KHTML, like Gecko) '
                          'Chrome/62.0.3202.89 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': self.base_url + self.config['login_url']
        })
        self._proxy = None
        self.url_token = ''
        self.Request = Request(self.config, self._http, self.base_url, self.url_token, self._proxy, self.user)
        self.login = Login(self.config,self.user,self.Request)
        self.score = Score(self.config,self.user,self.Request)
        self.info = UserlInfo(self.config,self.user,self.Request)
        self.schedule = Schedule(self.config,self.user,self.Request)
        self.exam_time = ExamTime(self.config,self.user,self.Request)
        #self.rate = Rate(self.config,self.user,self.Request)


    @error_handle
    def user_login(self, **kwargs):
        return self.login.get_login(**kwargs)

    @error_handle
    def get_schedule(self, *args, **kwargs):
        return self.schedule.get_schedule(*args, **kwargs)

    @error_handle
    def get_info(self, **kwargs):
        return self.info.get_info(**kwargs)

    @error_handle
    def get_score(self, *args, **kwargs):
        return self.score.get_score(*args, **kwargs)

    @error_handle
    def get_exam_time(self, **kwargs):
        return self.exam_time.get_exam_time(**kwargs)

    # @error_handle
    # def post_rate(self, **kwargs):
    #     return self.rate.post_rate(**kwargs)
