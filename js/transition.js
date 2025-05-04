// 创建一个全局变量来追踪页面状态
window.isPageTransitioning = false;

// 创建加载提示元素
function createLoadingText() {
  const loading = document.createElement('div');
  loading.className = 'loading-text';
  loading.textContent = 'Loading';
  document.body.appendChild(loading);
  return loading;
}

document.addEventListener('DOMContentLoaded', function() {
  // 如果是新页面加载，立即添加黑屏和加载提示
  document.body.style.opacity = '0';
  document.body.style.visibility = 'hidden';
  const loadingText = createLoadingText();
  loadingText.style.opacity = '1';
  
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      if (
        this.hostname === window.location.hostname && 
        !this.hash && 
        !this.hasAttribute('target') &&
        !this.hasAttribute('download')
      ) {
        e.preventDefault();
        const targetUrl = this.href;
        
        // 设置转场状态
        window.isPageTransitioning = true;
        
        // 显示加载提示
        const loadingText = createLoadingText();
        requestAnimationFrame(() => {
          loadingText.style.opacity = '1';
        });
        
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 100);
      }
    });
  });
});

// 页面完全加载后执行转场动画
window.addEventListener('load', function() {
  // 确保所有资源都加载完毕
  Promise.all([
    ...Array.from(document.images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => img.addEventListener('load', resolve));
    }),
    new Promise(resolve => setTimeout(resolve, 100))
  ]).then(() => {
    // 创建遮罩
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    // 等待DOM更新
    requestAnimationFrame(() => {
      // 先恢复页面可见性
      document.body.style.visibility = 'visible';
      
      // 隐藏加载提示
      const loadingText = document.querySelector('.loading-text');
      if (loadingText) {
        loadingText.style.opacity = '0';
        setTimeout(() => loadingText.remove(), 300);
      }
      
      // 开始拉开动画
      requestAnimationFrame(() => {
        document.body.classList.add('page-transition');
        document.body.style.opacity = '1';
        
        // 动画完成后清理
        setTimeout(() => {
          document.body.classList.remove('page-transition');
          overlay.remove();
          window.isPageTransitioning = false;
        }, 500);
      });
    });
  });
}); 