# coding: utf-8

from leancloud import Engine
from leancloud import LeanEngineError

from study_data import study_data_engine
from user import user_engine

engine = Engine()
engine.register(user_engine)
engine.register(study_data_engine)


@engine.define
def hello(**params):
    if 'name' in params:
        return 'Hello, {}!'.format(params['name'])
    else:
        return 'Hello, kanux.cn'


@engine.before_save('Todo')
def before_todo_save(todo):
    content = todo.get('content')
    if not content:
        raise LeanEngineError('内容不能为空')
    if len(content) >= 240:
        todo.set('content', content[:240] + ' ...')
