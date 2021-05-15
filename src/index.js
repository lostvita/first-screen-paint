import fspPerform from './core'
import { isSupport } from './util'

;(function() {
  if (!isSupport()) return
  const $fsp = {
    version: '1.0.0',
    getFirstScreenTime: fspPerform.getFirstScreenTime.bind(fspPerform),
    getRequestTime: fspPerform.getRequestTime.bind(fspPerform),
    reopen: fspPerform.reopen.bind(fspPerform)
  }
  window.$fsp = $fsp;
})();
