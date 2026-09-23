/*!
 * js/site-fixes.js
 *
 * 站点兼容性/性能补丁，由 _config.butterfly*.yml inject.bottom 引入。
 *
 * A) heading icon font-weight: 600 -> 900 (FA6 solid)
 * B) 修补 Butterfly 旧 lazyload 残留：data-lazy-src -> src
 * C) 首屏可见图（viewport 内）loading=eager，其它 loading=lazy
 * D) 全站 img 加 decoding=async + onerror 兜底
 * E) 给已知阻塞脚本补 defer
 */
(function () {
  // A) heading icon 字体权重
  try {
    var s = document.createElement('style');
    s.textContent = "#article-container.post-content h1:before,#article-container.post-content h2:before,#article-container.post-content h3:before,#article-container.post-content h4:before,#article-container.post-content h5:before,#article-container.post-content h6:before,#article-container.post-content hr:before,#post .post-copyright:before,#post .post-outdate-notice:before,.note:not(.no-icon)::before,.search-dialog hr:before{font-weight:900!important;}";
    document.head.appendChild(s);
  } catch (e) {}

  // B) 修补 Butterfly 旧 lazyload 残留
  document.querySelectorAll('img[data-lazy-src]').forEach(function (img) {
    var real = img.getAttribute('data-lazy-src');
    if (real && (!img.getAttribute('src') || /\/img\/Loading\.png$/.test(img.getAttribute('src')))) {
      img.setAttribute('src', real);
      img.removeAttribute('data-lazy-src');
    }
  });

  // C+D) 全站图片
  var viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
  document.querySelectorAll('img').forEach(function (img) {
    if (!img.hasAttribute('onerror')) {
      img.setAttribute('onerror', "this.onerror=null;this.src='/img/friend_404.gif'");
    }
    img.addEventListener('error', function () {
      if (!this.dataset.fallbackApplied) {
        this.dataset.fallbackApplied = '1';
        this.src = '/img/friend_404.gif';
      }
    }, { once: true });
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    if (!img.hasAttribute('loading')) {
      try {
        var r = img.getBoundingClientRect();
        if (r.top < viewportH + 200) img.setAttribute('loading', 'eager');
        else img.setAttribute('loading', 'lazy');
      } catch (e) {
        img.setAttribute('loading', 'lazy');
      }
    }
  });

  // E) 阻塞脚本补 defer
  ['/js/utils.js', '/js/main.js', '/js/tw_cn.js'].forEach(function (src) {
    var found = document.querySelector('script[src="' + src + '"]');
    if (found && !found.defer && !found.async) found.defer = true;
  });
})();