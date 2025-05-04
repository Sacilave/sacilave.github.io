function initTagCanvas() {
  try {
    if (!window.TagCanvas) {
      console.error('TagCanvas not loaded');
      return;
    }

    // 检查必要的元素是否存在
    const canvas = document.getElementById('tagCanvas');
    const tagList = document.getElementById('tagList');
    if (!canvas || !tagList) {
      console.log('Tag cloud elements not found');
      return;
    }

    // 重置画布
    const container = document.getElementById('myCanvasContainer');
    if (container) {
      const oldCanvas = container.querySelector('canvas');
      if (oldCanvas) {
        TagCanvas.Delete('tagCanvas');
        oldCanvas.getContext('2d').clearRect(0, 0, oldCanvas.width, oldCanvas.height);
      }
    }

    const options = {
      textColour: '#ffa3bD',
      outlineColour: '#000000',
      outlineThickness: 1,
      maxSpeed: 0.03,
      depth: 0.75,
      wheelZoom: false,
      initial: [0.1, -0.1],
      decel: 0.95,
      reverse: true,
      radiusX: 0.9,
      radiusY: 0.9,
      radiusZ: 0.9,
      stretchX: 1,
      stretchY: 1,
      shape: 'sphere',
      fadeIn: 800,
      dragControl: true,
      textHeight: 14,
      textFont: 'Microsoft YaHei, monospace',
      shadow: '#000',
      shadowBlur: 2,
      shadowOffset: [1,1]
    };

    console.log('Starting TagCanvas with options:', options);
    const success = TagCanvas.Start('tagCanvas', 'tagList', options);
    
    if (!success) {
      console.error('Failed to start TagCanvas');
      return;
    }
    console.log('Tag cloud started successfully');
  } catch(e) {
    console.error('Tag cloud error:', e);
  }
}

// 页面加载完成时初始化
window.addEventListener('load', initTagCanvas);

// 监听页面可见性变化
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    initTagCanvas();
  }
});

// 监听 PJAX 完成事件（如果使用了 PJAX）
document.addEventListener('pjax:complete', initTagCanvas);

// 监听转场动画完成
document.addEventListener('transitionend', function(e) {
  if (e.target === document.body && !document.body.classList.contains('page-transition')) {
    initTagCanvas();
  }
});

// 定期检查标签云状态
setInterval(function() {
  const canvas = document.getElementById('tagCanvas');
  const container = document.getElementById('myCanvasContainer');
  if (canvas && container && !canvas.getContext('2d').canvas.width) {
    initTagCanvas();
  }
}, 2000);