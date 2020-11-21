const isPlainObject = target =>
  target &&
  target.toString() == '[object Object]' &&
  Object.getPrototypeOf(target) == Object.prototype;
const _jsonify = target => {
  if (target && typeof target.toJSON === 'function') return target.toJSON();
  if (Array.isArray(target)) return target.map(_jsonify);
  return target;
};

export function jsonify(target)
  {   return isPlainObject(target)
    ? Object.keys(target).reduce(
      (result, key) => ({
        ...result,
        [key]: _jsonify(target[key])
      }),
      {}
    )
    : _jsonify(target);   }

const systemInfo = wx.getSystemInfoSync();
export const isQQApp = systemInfo && systemInfo.AppPlatform === 'qq';

export function showErrorModal(content,e){
  if (e) {
    if (e instanceof Error) e = e.toString();
    e = JSON.stringify(e);
    wx.showModal({
      title: '错误',
      content: content+'：'+e,
      showCancel: false,
    });
  }else{
    wx.showModal({
      title: '错误',
      content: content,
      showCancel: false,
    });
  }
};
  
export function dateFormat( date ) {
  function zeroize( num ) {
      return (String(num).length == 1 ? '0' : '') + num;
  }
  var timestamp = date.getTime() / 1000;
  var curTimestamp = parseInt(new Date().getTime() / 1000); //当前时间戳
  var timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数

  var curDate = new Date( curTimestamp * 1000 ); // 当前时间日期对象
  var tmDate = new Date( timestamp * 1000 );  // 参数时间戳转换成的日期对象

  var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
  var H = tmDate.getHours(), i = tmDate.getMinutes(), s = tmDate.getSeconds();

  if ( timestampDiff < 60 ) { // 一分钟以内
      return "刚刚";
  } else if( timestampDiff < 3600 ) { // 一小时前之内
      return Math.floor( timestampDiff / 60 ) + "分钟前";
  } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
      return '今天' + zeroize(H) + ':' + zeroize(i);
  } else {
      var newDate = new Date( (curTimestamp - 86400) * 1000 ); // 参数中的时间戳加一天转换成的日期对象
      if ( newDate.getFullYear() == Y && newDate.getMonth()+1 == m && newDate.getDate() == d ) {
          return '昨天' + zeroize(H) + ':' + zeroize(i);
      } else if ( curDate.getFullYear() == Y ) {
          return  zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
      } else {
          return  Y + '年' + zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
      }
  }
}