class SchoolException(Exception):
    """
    esAPI所有错误基类
    """

    def __init__(self, name, school_code, errmsg):
        self.class_name = name
        self.school_code = school_code
        self.errmsg = errmsg

    def __repr__(self):
        _repr = 'school_code:{school_code}, Error message: {name}，{msg}'.format(
            school_code=self.school_code,
            name=self.class_name,
            msg=self.errmsg
        )
        return _repr

    def __str__(self):
        _repr = '{msg}'.format(
            msg=self.errmsg
        )
        return _repr


class LoginException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('登录接口', school_code, errmsg)


class IdentityException(LoginException):
    pass


class CheckCodeException(LoginException):
    pass


class ScheduleException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('课表接口', school_code, errmsg)


class ScoreException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('成绩接口', school_code, errmsg)


class UserInfoException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('用户信息接口', school_code, errmsg)


class ExamTimeException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('用户考试时间接口', school_code, errmsg)


class RateException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('评教课程接口', school_code, errmsg)


class PermissionException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('接口权限', school_code, errmsg)


class OtherException(SchoolException):

    def __init__(self, school_code, errmsg):
        super().__init__('Other', school_code, errmsg)
