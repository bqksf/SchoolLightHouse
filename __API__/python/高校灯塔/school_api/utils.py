import six
import requests
import re
from bs4 import BeautifulSoup
from school_api.exceptions import OtherException, SchoolException, LoginException


class Request(object):
    def __init__(self, config, _http, base_url, url_token, _proxy, user):
        self.base_url = base_url
        self.config = config
        self._http = _http
        self.url_token = url_token
        self._proxy = _proxy
        self.user = user

    def _request(self, url_suffix, **kwargs):
        url = '{base}{url_token}{url_suffix}'.format(
            base=self.base_url,
            url_suffix=url_suffix,
            url_token=self.url_token
        )
        kwargs['timeout'] = kwargs.get('timeout', self.config['timeout'])
        res = self._http.request(
            url=url,
            proxies=self._proxy,
            allow_redirects=False,
            **kwargs
        )

        res.raise_for_status()
        if res.status_code == 302:
            raise requests.TooManyRedirects

        return res

    def get(self, url, **kwargs):
        return self._request(url, method='GET', **kwargs)

    def post(self, url, **kwargs):
        return self._request(url, method='POST', **kwargs)

    def head(self, url, **kwargs):
        return self._request(url, method='HEAD', **kwargs)

    def switch_proxy(self, init=False):
        """ 设置代理 """
        self.user.proxy_state = True
        self.base_url = self.config['lan_url'] or self.base_url
        self._proxy = self.config['proxies']
        self._http.headers.update({
            'Referer': self.base_url + self.config['login_url']
        })

    def get_view_state(self, url_suffix, **kwargs):
        """ 获取页面 view_state 值"""
        res = self.get(url_suffix, **kwargs)
        return get_view_state_from_html(res.text)

    def update_url_token(self, url_token):
        # 兼容含token的教务系统请求地址 http://xxx.xxx/(35yxiq45pv0ojz45wcopgz45)/Default2.aspx
        self.url_token = url_token


def get_view_state_from_html(html):
    ''' 获取 __VIEWSTATE 值 '''
    pre_soup = BeautifulSoup(html, "html.parser")
    view_state_soup = pre_soup.find(attrs={"name": "__VIEWSTATE"})
    try:
        view_state = view_state_soup['value']
    except TypeError:
        if html.find("网站防火墙") > -1:
            raise OtherException('', "请求被防火墙所拦截, 请降低请求频率")
        raise OtherException('', '获取view_state失败')

    return view_state


def get_alert_tip(html):
    ''' 获取页面提示信息 '''
    tips = re.findall(r">alert\(\'(.*?)\'", html)
    if tips:
        return tips[0]
    return None


# class LoginFail():
#     ''' 登录失败返回错误信息 '''
#
#     def __init__(self, tip=''):
#         self.tip = tip
#
#     def __getattr__(self, name):
#         def func(*args, **kwargs):
#             return {'error': self.tip}
#
#         return func
#
#     def __nonzero__(self):
#         return True


def error_handle(func):
    def wrapper(self, *args, **kwargs):
        if not self.config['use_ex_handle']:
            result = func(self, *args, **kwargs)
        else:
            try:
                result = func(self, *args, **kwargs)

            except LoginException as reqe:
                # result = LoginFail(str(reqe))
                result = {'error': str(reqe)}

            except SchoolException as reqe:
                result = {'error': str(reqe)}

        return result

    return wrapper


def get_time_list(class_time):
    """ 上课时间处理
        只接受偶数时间情况
    """
    time_list = {1: [], 2: [], 3: [], 4: []}
    time_text = "{} ~ {}"
    for index, times in enumerate(class_time):
        if index % 2 == 0:
            time_list[1].append(time_text.format(times[0], times[1]))
            time_list[2].append(time_text.format(times[0], class_time[index + 1][1]))

            if index < 8:
                time_list[3].append(time_text.format(times[0], class_time[index + 2][1]))
                time_list[4].append(time_text.format(times[0], class_time[index + 3][1]))
    return time_list


def to_text(value, encoding='utf-8'):
    """:copyright: (c) 2014 by messense.
    Convert value to unicode, default encoding is utf-8

    :param value: Value to be converted
    :param encoding: Desired encoding
    """
    if not value:
        return ''
    if isinstance(value, six.text_type):
        return value
    if isinstance(value, six.binary_type):
        return value.decode(encoding)
    return six.text_type(value)


def to_binary(value, encoding='utf-8'):
    """Convert value to binary string, default encoding is utf-8

    :param value: Value to be converted
    :param encoding: Desired encoding
    """
    if not value:
        return b''
    if isinstance(value, six.binary_type):
        return value
    if isinstance(value, six.text_type):
        return value.encode(encoding)
    return to_text(value).encode(encoding)
