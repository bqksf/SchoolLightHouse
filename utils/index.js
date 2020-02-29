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

export function showErrorModal(content){
  wx.showModal({
    title: '错误',
    content: content,
    showCancel: false,
  });
};
  