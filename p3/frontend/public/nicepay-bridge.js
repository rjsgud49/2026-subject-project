/**
 * 나이스페이 SDK: fnError 가 function 키워드 형태가 아니면 "필수 파라미터 fnError Function 누락" 발생.
 * 구버전 번들·캐시 대비 — requestPay 호출 시 fnError 를 보장한다.
 */
(function () {
  function defaultFnError(result) {
    var msg = '';
    if (result) {
      msg = String(result.errorMsg || result.message || '').trim();
    }
    if (msg && !/취소|cancel|I009/i.test(msg)) {
      window.alert(msg);
    }
  }

  function needsFnErrorPatch(fn) {
    if (typeof fn !== 'function') return true;
    var src = Function.prototype.toString.call(fn);
    return src.indexOf('[native code]') === -1 && src.indexOf('function') !== 0;
  }

  function patchAuthNice() {
    var auth = window.AUTHNICE;
    if (!auth || typeof auth.requestPay !== 'function' || auth.__p3FnErrorPatch) return false;

    var original = auth.requestPay;
    auth.requestPay = function (opts) {
      var options = opts || {};
      var userFn = options.fnError;
      if (needsFnErrorPatch(userFn)) {
        options.fnError = function (result) {
          if (typeof userFn === 'function') {
            try {
              userFn(result);
            } catch (e) {
              console.error(e);
            }
          } else {
            defaultFnError(result);
          }
        };
      }
      return original.call(this, options);
    };
    auth.__p3FnErrorPatch = true;
    return true;
  }

  if (patchAuthNice()) return;

  var tries = 0;
  var timer = window.setInterval(function () {
    tries += 1;
    if (patchAuthNice() || tries > 150) {
      window.clearInterval(timer);
    }
  }, 200);
})();
