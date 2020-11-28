function success(data = null) {
  return {
    status: 'ok',
    data: data,
    msg: 'ok'
  }
}

function fail(msg = null,data = null) {
  return {
    status: 'error',
    data: data,
    msg: msg
  }
}

function stringifyError(e) {
  return JSON.stringify(e);
}

module.exports = {
  success, fail, stringifyError
}