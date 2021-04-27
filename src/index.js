import fstp from './core'
import { isSupport } from './util'

;(function() {
  if (!isSupport()) return
  const $fstp = {
    version: '1.0.0',
    getFirstScreenTime: fstp.getFirstScreenTime.bind(fstp),
    getRequestTime: fstp.getRequestTime.bind(fstp),
    reopen: fstp.reopen.bind(fstp)
  }
  window.$fstp = $fstp;
})();
