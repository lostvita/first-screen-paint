export const isSupport = () => {
  return !!(window.performance &&
    window.PerformanceObserver &&
    window.IntersectionObserver &&
    window.MutationObserver);
}

export const warn = (info) => {
	console.warn(info);
}

export const getImgSrc = (dom) => {
  const imgTagReg = /img/i;
  const imgBgUrlReg = /(?<=^url\([\'\"]?).+(?=[\'\"]?\)$)/g;
  if (imgTagReg.test(dom.nodeName)) {
    return dom.getAttribute('data-src')
  } else {
    const computedStyle = window.getComputedStyle(dom);
    const bgImg = computedStyle.getPropertyValue('background-image') || computedStyle.getPropertyValue('background');
    const matches = bgImg.replace(/[\'\"]?/g, '').match(imgBgUrlReg)
    return matches ? matches[0] : null
  }
}
