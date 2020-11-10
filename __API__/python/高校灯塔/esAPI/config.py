# -*- coding: utf-8 -*-
LOGIN_SESSION_SAVE_TIME = 3600 * 2

URL_PATH_LIST = [
    {
        # 学生
        "HOME_URL": "/xs_main.aspx?xh=",
        "SCORE_URL": [
            "/xscj_gc.aspx?xh=",
            "/xscj_gc2.aspx?xh=",
            "/Xscjcx.aspx?xh=",
            "/xscjcx.aspx?xh=",
            "/xscjcx_dq.aspx?xh="
        ],
        "INFO_URL": "/xsgrxx.aspx?gnmkdm=N121501&xh=",
        "SCHEDULE_URL": [
            "/xskbcx.aspx?gnmkdm=N121603&xh=",
            "/tjkbcx.aspx?gnmkdm=N121601&xh="
        ],
        "TEST_TIME_URL": "/xskscx.aspx?gnmkdm=N121604&xh="
    },
    {
        # 教师
        "HOME_URL": "/js_main.aspx?xh=",
        "INFO_URL": "/lw_jsxx.aspx?gnmkdm=N122502&zgh=",
        "SCHEDULE_URL": ["", "/jstjkbcx.aspx?gnmkdm=N122303&zgh="]
    },
    {
        # 部门
        "HOME_URL": "/bm_main.aspx?xh=",
        "SCHEDULE_URL": ["", "/tjkbcx.aspx?gnmkdm=N120313&xh="],
        "PLACE_SCHEDULE_URL": "/kbcx_jxcd.aspx?gnmkdm=N120314&xh="
    }
]

CLASS_TIME = [
        ["8:40", "9:25"],
        ["9:30", "10:15"],
        ["10:25", "11:10"],
        ["11:15", "12:00"],
        ["14:15", "15:00"],
        ["15:05", "15:50"],
        ["16:00", "16:40"],
        ["16:40", "17:20"],
        ["19:00", "19:45"],
        ["19:50", "20:35"],
        ["20:45", "21:25"],
        ["21:25", "22:00"]
    ]
