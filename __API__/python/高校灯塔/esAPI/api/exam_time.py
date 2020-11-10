import re
from bs4 import BeautifulSoup
from requests import RequestException, TooManyRedirects
from school_api.exceptions import ExamTimeException


class ExamTime:
    """ 用户考试时间查询模块 """

    def __init__(self, config, user, request):
        self.config = config
        self.user = user
        self.Request = request

    def get_exam_time(self, **kwargs):
        """ 用户信息 获取入口 """
        exam_time_url = self.config['url_path_list'][0]['TEST_TIME_URL'] + self.user['account']

        try:
            res = self.Request.get(exam_time_url, **kwargs)
        except TooManyRedirects:
            raise ExamTimeException(self.config['code'], '用户考试时间接口已关闭：TooManyRedirects')
        except RequestException:
            raise ExamTimeException(self.config['code'], '获取用户信息请求失败：RequestException')

        return ExamTimeParse(self.config['code'], res.text).exam_time


class ExamTimeParse:
    """ 信息页面解析模块 """

    def __init__(self, code, html):
        self.data = {}
        self.code = code
        self.soup = BeautifulSoup(html, "html.parser")
        self._html_parse_of_exam_time()

    def _html_parse_of_exam_time(self):
        table = self.soup.find("table", attrs={"id": "DataGrid1"})
        if not table:
            raise ExamTimeException(self.code, '获取成绩信息失败')
        rows = table.find_all('tr')
        rows.pop(0)
        self.exam_time_info = {}
        for row in rows:
            cells = row.find_all("td")
            no = cells[0].text  # 选课课号
            year = re.match(r'\((.+)\)', no).group(1)   # 学年学期
            lesson_name = cells[1].text.strip()    # 课程名称
            self.exam_time_dict = {
                "no": no,
                "lesson_name": lesson_name,
            }
            # 有其他考试内容则输出
            time = cells[3].text  # 考试时间
            if time != '\xa0':
                self._parse_exam_time(time)
                self.exam_time_dict['time_str'] = time
            location = cells[4].text  # 考试地点
            if location != '\xa0':
                self.exam_time_dict['location'] = location
            form = cells[5].text or 0  # 考试形式
            if form != '\xa0':
                self.exam_time_dict['form'] = form
            sit_id = cells[6].text or 0  # 座位号
            if sit_id != '\xa0':
                self.exam_time_dict['sit_id'] = int(sit_id)
            sch_place = cells[7].text or 0  # 校区
            if sch_place != '\xa0':
                self.exam_time_dict['sch_place'] = sch_place
            self.exam_time_info[year] = self.exam_time_info.get(year, [])
            self.exam_time_info[year].append(self.exam_time_dict)

    def _parse_exam_time(self, time):
        #  第19周周2(2019-12-31) 09:00-11:00
        texts = re.match(r'^(.+)\((.+)\)\s(.+)$', time)
        self.exam_time_dict['date'] = texts.group(1)
        self.exam_time_dict['day'] = texts.group(2)
        self.exam_time_dict['time'] = texts.group(3)

    @property
    def exam_time(self):
        """
        返回用户考试时间json格式
        """
        return self.exam_time_info
