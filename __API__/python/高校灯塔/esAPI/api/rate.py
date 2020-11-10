import random
from bs4 import BeautifulSoup
from requests import RequestException, TooManyRedirects
from school_api.client.api.base import BaseSchoolApi
from school_api.exceptions import RateException


class Rate(BaseSchoolApi):
    ''' 自动评教课程 '''

    def post_rate(self, **kwargs):
        ''' 评教课程 操作入口 '''
        rate_url = self.school_url['HOME_URL'] + self.user.account

        try:
            res = self._get(rate_url, **kwargs)
        except TooManyRedirects:
            raise RateException(self.code, '评教接口已关闭')
        except RequestException:
            raise RateException(self.code, '获取主菜单信息失败')

        rate_urls = []
        soup = BeautifulSoup(res.text, "html.parser")
        menu = next(
            filter(
                lambda x: str(x).find('教学质量评价') != -1,
                soup.find_all('li', {'class': 'top'})
            )
        )
        for li in menu.find_all('li'):
            rate_urls.append(li.a.get('href'))
        try:
            ress = self._get(rate_urls[0], **kwargs)
        except IndexError:
            raise RateException(self.code, '该学生已完成评教')
        except TooManyRedirects:
            raise RateException(self.code, '评教页面接口已关闭')
        except RequestException:
            raise RateException(self.code, '获取评教信息失败')

        try:
            view_state = self._get_view_state(rate_url, **kwargs)
        except TooManyRedirects:
            raise RateException(self.code, '评教页面接口已关闭')
        except RequestException:
            raise RateException(self.code, '获取评教请求参数失败')

        i = 0
        while i < len(rate_urls):
            pjkc = self._doEvaluate(ress.text, rate_urls, i)
            payload = {
                '__EVENTTARGET': pjkc,
                '__EVENTARGUMENT': '',
                '__VIEWSTATE': view_state,
                'pjkc': pjkc,
                'txt1': '',
                'TextBox1': '0',
                'pjxx': '',
                'Button1': u'保  存'.encode('gb2312')
            }
            # 从第一页进入，post和refer的url皆为第一页的url
            try:
                ress = self._post(rate_urls[0], data=payload, **kwargs)
            except TooManyRedirects:
                raise RateException(self.code, '评教页面接口已关闭')
            except RequestException:
                raise RateException(self.code, '执行评教失败')
            i += 1

        return {"msg": "ok"}

    def _doEvaluate(self, response, pj_url, index):
        evaluateResults = []
        print('正在评价第' + str(index + 1) + u'位教师，一共有' + str(len(pj_url)) + u'位教师')
        pjkc = pj_url[index][pj_url[index].find('=') + 1: pj_url[index].find('&')]  # 如(2016-2017-2)-02013024-1001945-3
        soup = BeautifulSoup(response, "html.parser")
        dataGird = soup.find(id='DataGrid1')
        pjkc_name = soup.find(id='pjkc').find_all('option')  # 评教课程名称
        Js1 = {}  # DataGrid1:_ctl2:JS1
        txtjs1 = {}  # DataGrid1:_ctl2:txtjs1
        tr = dataGird.find_all('tr')
        # 设置评价
        for i in range(1, len(tr)):
            select = tr[i].find('select')
            if select is not None:
                if random.random() < 0.15:
                    Js1[select.get('name')] = u'4(良好)'.encode('gb2312')
                    evaluateResults.append('B')
                else:
                    Js1[select.get('name')] = u'5(优秀)'.encode('gb2312')
                    evaluateResults.append('A')
                txtjs1[select.get('name')] = ''
        print(pjkc_name[index].string + str(evaluateResults))
        return pjkc
