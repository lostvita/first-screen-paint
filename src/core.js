import { isSupport, warn, getImgSrc } from './util'

const ignoreTagReg = /style|script|link|br/i;

class FspPerform {
  constructor() {
    this.$data = {};
		this.$iso = null;
		this.$muo = null;
		this.$perf = null
    this._stopFlag = false;
		this._stopTime = 0;
    this._stepTime = 0; // record step time from timeorigin
		this._timeOrigin = null;
    this._imgUrlList = new Set();
    this._resourceList = new Set();
    this.init()
  }
  initConfig() {
    this._stopFlag = false;
    this._timeOrigin = performance.timeOrigin;
    // the first screen paint time
    let fspTime = { start: this._timeOrigin, end: null, duration: 0 };
    this.$data = { fspt: fspTime };
  }
  initIsObserver() {
    let iso = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // element in viewport
        if (entry.intersectionRatio > 0) {
          this.updateFspTime({ duration: entry.time })
          // collect img url
          const src = getImgSrc(entry.target)
          src && this._imgUrlList.add(src);
        }
      });
    });
    this.$iso = iso;
  }
  initMuObserver() {
    const muo = new MutationObserver((mutations) => {
      if (!mutations) return;
      mutations.forEach((mu) => {
        if (!mu.addedNodes || !mu.addedNodes.length) return;
        mu.addedNodes.forEach((ele) => {
          if (ele.nodeType === 1 && !ignoreTagReg.test(ele.nodeName)) {
            // listening element visibility
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
  initPerfObserver() {
    const perf = new PerformanceObserver((list) => {
      const entries = list.getEntriesByType('resource');
      entries.forEach((item) => {
        // ignore resources emitted after scroll
        if (this._stopFlag && item.fetchStart > this._stopTime) return;
        if (this._imgUrlList.has(item.name)) {
          this.updateFspTime({ duration: item.responseEnd });
          this._imgUrlList.delete(item.name);
        }
        // collect all recouses
        this._resourceList.add(item);
      });
    });
    perf.observe({ entryTypes: ['resource'] });
    this.$perf = perf;
  }
  updateFspTime(data = {}) {
    if (data.start) {
      this._stepTime = data.start;
      data.start += this._timeOrigin;
    }
    if (data.duration) {
      data.duration -= this._stepTime;
      data.duration = Math.max(data.duration, this.$data.fspt.duration)
    }
    Object.assign(this.$data.fspt, data)
  }
  stopObserver() {
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
    this.initConfig();
    this.initIsObserver();
    this.initMuObserver();
    this.initPerfObserver();

    window.addEventListener(
      'scroll',
      () => {
        this.stopObserver();
      },
      { capture: true, once: true }
    );
  }
  getFirstScreenTime(delay = 5000, stop = true) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (stop) {
          this.stopObserver();
        }
        this.updateFspTime({ end: this.$data.fspt.start + this.$data.fspt.duration })
        resolve(this.$data.fspt);
      }, delay);
    });
  }
  getRequestTime(format, delay = 5000, stop = true) {
    if (!(format instanceof RegExp)) {
      warn('missing format or format should be a regexp.');
      return;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (stop) {
          this.stopObserver();
        }
        const data = [...this._resourceList.values()]
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
          start: start + this.$data.fspt.start,
          end: end + this.$data.fspt.start,
          duration: end - start,
          request
        });
      }, delay);
    });
  }
  reopen(ele = document) {
    this._stopFlag = false;
    this.updateFspTime({ start: performance.now(), duration: 0 })
    this._imgUrlList.clear();
    this._resourceList.clear();
    // listening subtree
    this.$muo.observe(ele, {
      childList: true,
      subtree: true
    });
    // listening rescorce performace
    this.$perf.observe({ entryTypes: ['resource'] });
  }
}

export default new FspPerform()