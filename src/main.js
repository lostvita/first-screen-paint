/*
 * @Author: Wilton.Qiu
 * @Date: 2021-03-29 15:50:50
 * @Description: first screen time api
 */

const isSupport =
	!!(window.performance &&
	window.PerformanceObserver &&
	window.IntersectionObserver &&
	window.MutationObserver);

// if (!isSupport) return
// console.log(isSupport)

const ignoreTagReg = /style|script|link|br/i;
const imgTagReg = /img/i;
const imgBgUrlReg = /(?<=^url\([\'\"]?).+(?=[\'\"]?\)$)/g

let imgResourceList = new Set();
let resourcePerfList = new Set();

const warn = (info) => {
	console.warn(info);
};

const $fstp = (function() {
	const _global = {
		$data: {},
		_stopFlag: false,
		_stopTime: 0,
		_stepTime: 0,
		_timeOrigin: null,
		$iso: null,
		$muo: null,
		$perf: null
	};

	const utils = {
		_initConfig() {
			_global._stopFlag = false;
			_global._timeOrigin = performance.timeOrigin;
			// 首屏渲染时间
			const fst = { start: _global._timeOrigin, end: null, duration: 0 };
			_global.$data = { fst };
		},
		_initIsObserver() {
			let iso = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					// 屏内元素
					if (entry.intersectionRatio > 0) {
						this._updateFstDur(entry.time);
						const src = this._getImgSrc(entry.target)
						src && imgResourceList.add(src);
					}
				});
			});
			_global.$iso = iso;
		},
		_initMuObserver() {
			const muo = new MutationObserver((mutations) => {
				if (!mutations) return;
				mutations.forEach((mu) => {
					if (!mu.addedNodes || !mu.addedNodes.length) return;
					mu.addedNodes.forEach((ele) => {
						if (ele.nodeType === 1 && !ignoreTagReg.test(ele.nodeName)) {
							// 监听可视性变化
							_global.$iso.observe(ele);
						}
					});
				});
			});
			muo.observe(document, {
				childList: true,
				subtree: true
			});
			_global.$muo = muo;
		},
		_initPerfObserver() {
			const perf = new PerformanceObserver((list) => {
				const entries = list.getEntriesByType('resource');
				entries.forEach((item) => {
					// 滚动之后触发的请求忽略
					console.log(item.name, item.responseEnd)
					if (_global._stopFlag && item.fetchStart > _global._stopTime) return;
					if (imgResourceList.has(item.name)) {
						this._updateFstDur(item.responseEnd);
						imgResourceList.delete(item.name);
					}
					resourcePerfList.add(item);
				});
			});
			perf.observe({ entryTypes: ['resource'] });
			_global.$perf = perf;
		},
		_updateFstStart() {
			_global._stepTime = performance.now();
			_global.$data.fst.start = _global._timeOrigin + _global._stepTime;
		},
		_setFstDur(dur) {
			_global.$data.fst.duration = dur;
		},
		_updateFstDur(dur) {
			dur -= _global._stepTime;
			const d = _global.$data.fst.duration;
			_global.$data.fst.duration = Math.max(d, dur);
		},
		_stopObserver() {
			if (_global._stopFlag) return;
			_global._stopTime = performance.now();
			_global._stopFlag = true;
			_global.$muo.disconnect();
			_global.$iso.disconnect();
			_global.$perf.disconnect();
		},
		_getImgSrc(dom) {
			if (imgTagReg.test(dom)) {
				entry.target.getAttribute('data-src')
			} else {
				const computedStyle = window.getComputedStyle(dom);
				const bgImg = computedStyle.getPropertyValue('background-image') || computedStyle.getPropertyValue('background');
				const matches = bgImg.replace(/[\'\"]?/g, '').match(imgBgUrlReg)
				return matches ? matches[0] : null
			}
		},
		run() {
			if (!isSupport) {
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
	};
	utils.run();

	const api = {
		getFirstScreenTime(delay = 5000, stop = true) {
			return new Promise((resolve, reject) => {
				if (!isSupport) {
					reject("current browser doesn't support performance.");
					return;
				}
				setTimeout(() => {
					if (stop) {
						utils._stopObserver();
					}
					_global.$data.fst.end = _global.$data.fst.start + _global.$data.fst.duration;
					resolve(_global.$data.fst);
				}, delay);
			});
		},
		getRequestTime(format, delay = 5000, stop = true) {
			if (!(format instanceof RegExp)) {
				warn('missing format or format should be a regexp.');
				return;
			}
			return new Promise((resolve, reject) => {
				if (!isSupport) {
					reject("current browser doesn't support performance.");
					return;
				}
				setTimeout(() => {
					if (stop) {
						utils._stopObserver();
					}
					const data = [...resourcePerfList.values()]
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
						start: start + _global.$data.fst.start,
						end: end + _global.$data.fst.start,
						duration: end - start,
						request
					});
				}, delay);
			});
		},
		reopen(ele = document) {
			if (!isSupport) {
				warn("current browser doesn't support performance.");
				return;
			}
			_global._stopFlag = false;
			utils._updateFstStart();
			utils._setFstDur(0);
			imgResourceList.clear();
			resourcePerfList.clear();
			// 启动子树监听
			_global.$muo.observe(ele, {
				childList: true,
				subtree: true
			});
			// 启动资源请求监听
			_global.$perf.observe({ entryTypes: ['resource'] });
		}
	};

	return {
		version: '1.0.0',
		...api
	};
})();

window.$fstp = $fstp;
