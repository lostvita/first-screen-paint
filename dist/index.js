/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["firstScreenTime"] = factory();
	else
		root["firstScreenTime"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ (() => {

eval("/*\n * @Author: Wilton.Qiu\n * @Date: 2021-03-29 15:50:50\n * @Description: first screen time Api\n */\n\nconst ignoreTagReg = /style|script|link|br/i;\nconst imgTagReg = /img/i;\n\nconst isSupport =\n\twindow.performance &&\n\twindow.PerformanceObserver &&\n\twindow.IntersectionObserver &&\n\twindow.MutationObserver;\n\nlet imgResourceList = new Set();\nlet resourcePerfList = new Set();\n\nconst warn = (info) => {\n\tconsole.warn(info);\n};\n\nconst $fstp = (function() {\n\tconst _global = {\n\t\t$data: {},\n\t\t_stopFlag: false,\n\t\t_stopTime: 0,\n\t\t_stepTime: 0,\n\t\t_timeOrigin: null,\n\t\t$iso: null,\n\t\t$muo: null,\n\t\t$perf: null\n\t};\n\n\tconst utils = {\n\t\t_initConfig() {\n\t\t\t_global._stopFlag = false;\n\t\t\t_global._timeOrigin = performance.timeOrigin;\n\t\t\t// 首屏渲染时间\n\t\t\tconst fst = { start: _global._timeOrigin, end: null, duration: 0 };\n\t\t\t_global.$data = { fst };\n\t\t},\n\t\t_initIsObserver() {\n\t\t\tlet iso = new IntersectionObserver((entries) => {\n\t\t\t\tentries.forEach((entry) => {\n\t\t\t\t\t// 屏内元素\n\t\t\t\t\tconsole.log(entry.intersectionRatio, entry.target, entry.time)\n\t\t\t\t\tif (entry.intersectionRatio > 0) {\n\t\t\t\t\t\tthis._updateFstDur(entry.time);\n\t\t\t\t\t\tif (imgTagReg.test(entry.target.nodeName)) {\n\t\t\t\t\t\t\timgResourceList.add(entry.target.getAttribute('data-src'));\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t});\n\t\t\t_global.$iso = iso;\n\t\t},\n\t\t_initMuObserver() {\n\t\t\tconst muo = new MutationObserver((mutations) => {\n\t\t\t\tif (!mutations) return;\n\t\t\t\tmutations.forEach((mu) => {\n\t\t\t\t\tif (!mu.addedNodes || !mu.addedNodes.length) return;\n\t\t\t\t\tmu.addedNodes.forEach((ele) => {\n\t\t\t\t\t\tif (ele.nodeType === 1 && !ignoreTagReg.test(ele.nodeName)) {\n\t\t\t\t\t\t\t// 监听可视性变化\n\t\t\t\t\t\t\t_global.$iso.observe(ele);\n\t\t\t\t\t\t}\n\t\t\t\t\t});\n\t\t\t\t});\n\t\t\t});\n\t\t\tmuo.observe(document, {\n\t\t\t\tchildList: true,\n\t\t\t\tsubtree: true\n\t\t\t});\n\t\t\t_global.$muo = muo;\n\t\t},\n\t\t_initPerfObserver() {\n\t\t\tconst perf = new PerformanceObserver((list) => {\n\t\t\t\tconst entries = list.getEntriesByType('resource');\n\t\t\t\tentries.forEach((item) => {\n\t\t\t\t\t// 滚动之后触发的请求忽略\n\t\t\t\t\tconsole.log(item.name, item.responseEnd)\n\t\t\t\t\tif (_global._stopFlag && item.fetchStart > _global._stopTime) return;\n\t\t\t\t\tif (imgResourceList.has(item.name)) {\n\t\t\t\t\t\tthis._updateFstDur(item.responseEnd);\n\t\t\t\t\t\timgResourceList.delete(item.name);\n\t\t\t\t\t}\n\t\t\t\t\tresourcePerfList.add(item);\n\t\t\t\t});\n\t\t\t});\n\t\t\tperf.observe({ entryTypes: ['resource'] });\n\t\t\t_global.$perf = perf;\n\t\t},\n\t\t_updateFstStart() {\n\t\t\t_global._stepTime = performance.now();\n\t\t\t_global.$data.fst.start = _global._timeOrigin + _global._stepTime;\n\t\t},\n\t\t_setFstDur(dur) {\n\t\t\t_global.$data.fst.duration = dur;\n\t\t},\n\t\t_updateFstDur(dur) {\n\t\t\tdur -= _global._stepTime;\n\t\t\tconst d = _global.$data.fst.duration;\n\t\t\t_global.$data.fst.duration = Math.max(d, dur);\n\t\t},\n\t\t_stopObserver() {\n\t\t\tif (_global._stopFlag) return;\n\t\t\t_global._stopTime = performance.now();\n\t\t\t_global._stopFlag = true;\n\t\t\t_global.$muo.disconnect();\n\t\t\t_global.$iso.disconnect();\n\t\t\t_global.$perf.disconnect();\n\t\t},\n\t\trun() {\n\t\t\tthis._initConfig();\n\t\t\tthis._initIsObserver();\n\t\t\tthis._initMuObserver();\n\t\t\tthis._initPerfObserver();\n\n\t\t\twindow.addEventListener(\n\t\t\t\t'scroll',\n\t\t\t\t() => {\n\t\t\t\t\tthis._stopObserver();\n\t\t\t\t},\n\t\t\t\t{ capture: true, once: true }\n\t\t\t);\n\t\t}\n\t};\n\tutils.run();\n\n\tconst api = {\n\t\tgetFirstScreenTime(delay = 5000, stop = true) {\n\t\t\treturn new Promise((resolve, reject) => {\n\t\t\t\tif (!isSupport) {\n\t\t\t\t\treject(\"current browser doesn't support performance.\");\n\t\t\t\t\treturn;\n\t\t\t\t}\n\t\t\t\tsetTimeout(() => {\n\t\t\t\t\tif (stop) {\n\t\t\t\t\t\tutils._stopObserver();\n\t\t\t\t\t}\n\t\t\t\t\t_global.$data.fst.end = _global.$data.fst.start + _global.$data.fst.duration;\n\t\t\t\t\tresolve(_global.$data.fst);\n\t\t\t\t}, delay);\n\t\t\t});\n\t\t},\n\t\tgetRequestTime(format, delay = 5000, stop = true) {\n\t\t\tif (!(format instanceof RegExp)) {\n\t\t\t\twarn('missing format or format should be a Regexp.');\n\t\t\t\treturn;\n\t\t\t}\n\t\t\treturn new Promise((resolve, reject) => {\n\t\t\t\tif (!isSupport) {\n\t\t\t\t\treject(\"current browser doesn't support performance.\");\n\t\t\t\t\treturn;\n\t\t\t\t}\n\t\t\t\tsetTimeout(() => {\n\t\t\t\t\tif (stop) {\n\t\t\t\t\t\tutils._stopObserver();\n\t\t\t\t\t}\n\t\t\t\t\tconst data = [...resourcePerfList.values()]\n\t\t\t\t\t\t.filter((item) => format.test(item.name))\n\t\t\t\t\t\t.map((item) => ({\n\t\t\t\t\t\t\tfetchStart: item.fetchStart,\n\t\t\t\t\t\t\tresponseEnd: item.responseEnd,\n\t\t\t\t\t\t\tname: item.name\n\t\t\t\t\t\t}))\n\t\t\t\t\t\t.reduce(\n\t\t\t\t\t\t\t(acc, curr) => {\n\t\t\t\t\t\t\t\tacc.start = Math.min(curr.fetchStart, acc.start || Number.MAX_SAFE_INTEGER);\n\t\t\t\t\t\t\t\tacc.end = Math.max(curr.responseEnd, acc.end || 0);\n\t\t\t\t\t\t\t\tacc.request.push(curr.name);\n\t\t\t\t\t\t\t\treturn acc;\n\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\t{ request: [] }\n\t\t\t\t\t\t);\n\t\t\t\t\tconst { start = 0, end = 0, request } = data;\n\t\t\t\t\tresolve({\n\t\t\t\t\t\tstart: start + _global.$data.fst.start,\n\t\t\t\t\t\tend: end + _global.$data.fst.start,\n\t\t\t\t\t\tduration: end - start,\n\t\t\t\t\t\trequest\n\t\t\t\t\t});\n\t\t\t\t}, delay);\n\t\t\t});\n\t\t},\n\t\treopen(ele = document) {\n\t\t\t_global._stopFlag = false;\n\t\t\tutils._updateFstStart();\n\t\t\tutils._setFstDur(0);\n\t\t\timgResourceList.clear();\n\t\t\tresourcePerfList.clear();\n\t\t\t// 启动子树监听\n\t\t\t_global.$muo.observe(ele, {\n\t\t\t\tchildList: true,\n\t\t\t\tsubtree: true\n\t\t\t});\n\t\t\t// 启动资源请求监听\n\t\t\t_global.$perf.observe({ entryTypes: ['resource'] });\n\t\t}\n\t};\n\n\treturn {\n\t\tversion: '1.0.0',\n\t\t...api\n\t};\n})();\n\nwindow.$fstp = $fstp;\n\n\n//# sourceURL=webpack://firstScreenTime/./index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./index.js"]();
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});