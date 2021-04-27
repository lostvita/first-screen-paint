import { isSupport, warn, getImgSrc } from './util'

const ignoreTagReg = /style|script|link|br/i;

class FstPerform {
  constructor() {
    this.$data = {};
		this.$iso = null;
		this.$muo = null;
		this.$perf = null
    this._stopFlag = false;
		this._stopTime = 0;
		this._stepTime = 0;
		this._timeOrigin = null;
    this._imgResourceList = new Set();
    this._resourcePerfList = new Set();
    this.init()
  }
  _initConfig() {
    this._stopFlag = false;
    this._timeOrigin = performance.timeOrigin;
    // 首屏渲染时间
    let fst = { start: this._timeOrigin, end: null, duration: 0 };
    this.$data = { fst };
  }
  _initIsObserver() {
    let iso = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // 屏内元素
        if (entry.intersectionRatio > 0) {
          this._updateFstDur(entry.time);
          const src = getImgSrc(entry.target)
          src && this._imgResourceList.add(src);
        }
      });
    });
    this.$iso = iso;
  }
  _initMuObserver() {
    const muo = new MutationObserver((mutations) => {
      if (!mutations) return;
      mutations.forEach((mu) => {
        if (!mu.addedNodes || !mu.addedNodes.length) return;
        mu.addedNodes.forEach((ele) => {
          if (ele.nodeType === 1 && !ignoreTagReg.test(ele.nodeName)) {
            // 监听可视性变化
            this.$iso.observe(ele);
          }
        });
      });
    });
    muo.observe(document, {
      childList: true,
      subtree: true
    });
    this.$muo = muo;
  }
  _initPerfObserver() {
    const perf = new PerformanceObserver((list) => {
      const entries = list.getEntriesByType('resource');
      entries.forEach((item) => {
        // 滚动之后触发的请求忽略
        console.log(item.name, item.responseEnd)
        if (this._stopFlag && item.fetchStart > this._stopTime) return;
        if (this._imgResourceList.has(item.name)) {
          this._updateFstDur(item.responseEnd);
          this._imgResourceList.delete(item.name);
        }
        this._resourcePerfList.add(item);
      });
    });
    perf.observe({ entryTypes: ['resource'] });
    this.$perf = perf;
  }
  _updateFstStart() {
    this._stepTime = performance.now();
    this.$data.fst.start = this._timeOrigin + this._stepTime;
  }
  _setFstDur(dur) {
    this.$data.fst.duration = dur;
  }
  _updateFstDur(dur) {
    dur -= this._stepTime;
    const d = this.$data.fst.duration;
    this.$data.fst.duration = Math.max(d, dur);
  }
  _stopObserver() {
    if (this._stopFlag) return;
    this._stopTime = performance.now();
    this._stopFlag = true;
    this.$muo.disconnect();
    this.$iso.disconnect();
    this.$perf.disconnect();
  }
  init() {
    if (!isSupport()) {
      warn("current browser doesn't support performance.");
      return;
    }
    this._initConfig();
    this._initIsObserver();
    this._initMuObserver();
    this._initPerfObserver();

    window.addEventListener(
      'scroll',
      () => {
        this._stopObserver();
      },
      { capture: true, once: true }
    );
  }
  getFirstScreenTime(delay = 5000, stop = true) {
    return new Promise((resolve, reject) => {
      // if (!isSupport) {
      //   reject("current browser doesn't support performance.");
      //   return;
      // }
      setTimeout(() => {
        if (stop) {
          this._stopObserver();
        }
        this.$data.fst.end = this.$data.fst.start + this.$data.fst.duration;
        resolve(this.$data.fst);
      }, delay);
    });
  }
  getRequestTime(format, delay = 5000, stop = true) {
    if (!(format instanceof RegExp)) {
      warn('missing format or format should be a regexp.');
      return;
    }
    return new Promise((resolve, reject) => {
      // if (!isSupport) {
      //   reject("current browser doesn't support performance.");
      //   return;
      // }
      setTimeout(() => {
        if (stop) {
          this._stopObserver();
        }
        const data = [...this._resourcePerfList.values()]
          .filter((item) => format.test(item.name))
          .map((item) => ({
            fetchStart: item.fetchStart,
            responseEnd: item.responseEnd,
            name: item.name
          }))
          .reduce(
            (acc, curr) => {
              acc.start = Math.min(curr.fetchStart, acc.start || Number.MAX_SAFE_INTEGER);
              acc.end = Math.max(curr.responseEnd, acc.end || 0);
              acc.request.push(curr.name);
              return acc;
            },
            { request: [] }
          );
        const { start = 0, end = 0, request } = data;
        resolve({
          start: start + this.$data.fst.start,
          end: end + this.$data.fst.start,
          duration: end - start,
          request
        });
      }, delay);
    });
  }
  reopen(ele = document) {
    // if (!isSupport) {
    //   warn("current browser doesn't support performance.");
    //   return;
    // }
    this._stopFlag = false;
    this._updateFstStart();
    this._setFstDur(0);
    this._imgResourceList.clear();
    this._resourcePerfList.clear();
    // 启动子树监听
    this.$muo.observe(ele, {
      childList: true,
      subtree: true
    });
    // 启动资源请求监听
    this.$perf.observe({ entryTypes: ['resource'] });
  }
}

export default new FstPerform()