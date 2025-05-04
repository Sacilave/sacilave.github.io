// 在文件开头添加全局状态
let isTransitioning = false;
let mouseEffect = null;
let isMobileDevice = false;

// 检测是否为移动设备
function detectMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (window.innerWidth <= 768);
}

class MouseEffect {
    constructor() {
        // 检测是否为移动设备
        isMobileDevice = detectMobileDevice();
        if (isMobileDevice) {
            console.log('Mobile device detected, disabling mouse effects');
            return;
        }
        
        // 如果正在转场，不初始化鼠标效果
        if (isTransitioning) return;
        
        // 检查是否已经初始化
        if (document.querySelector('.cursor-effect-container')) {
            return;
        }
        
        console.log('Initializing MouseEffect');
        this.initAudio();
        this.init();
    }

    destroy() {
        // 移除所有鼠标相关元素
        const container = document.querySelector('.cursor-effect-container');
        if (container) {
            container.remove();
        }
        
        // 移除所有事件监听
        document.removeEventListener('mousemove', this.mouseMoved);
        document.removeEventListener('click', this.mouseClicked);
    }

    init() {
        // 创建容器
        this.container = document.createElement('div');
        this.container.className = 'cursor-effect-container';
        document.body.appendChild(this.container);

        // 创建主光标和跟随光标
        this.cursor = document.createElement('div');
        this.cursor.className = 'main-cursor';
        this.container.appendChild(this.cursor);
        
        this.follower = document.createElement('div');
        this.follower.className = 'cursor-follower';
        this.container.appendChild(this.follower);

        // 确保在所有页面元素上都禁用默认光标
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            * { cursor: none !important; }
            a, button, [role="button"] { cursor: none !important; }
        `;
        document.head.appendChild(styleSheet);

        // 初始化位置
        this.cursorPos = { x: -100, y: -100 };
        this.followerPos = { x: -100, y: -100 };
        
        // 绑定事件处理器
        this.mouseMoved = this.mouseMoved.bind(this);
        this.mouseClicked = this.mouseClicked.bind(this);
        this.animate = this.animate.bind(this);
        
        // 添加事件监听
        document.addEventListener('mousemove', this.mouseMoved);
        document.addEventListener('click', this.mouseClicked);
        
        // 开始动画循环
        requestAnimationFrame(this.animate);
        
        console.log('MouseEffect initialized');
    }

    mouseMoved(e) {
        this.cursorPos.x = e.clientX;
        this.cursorPos.y = e.clientY;
        
        // 在可点击元素上时显示特殊效果
        const target = e.target;
        if (target.closest('a') || target.closest('button') || 
            target.classList.contains('clickable') ||
            target.closest('#tagCanvas')) {
            this.cursor.classList.add('active');
            this.follower.classList.add('active');
        } else {
            this.cursor.classList.remove('active');
            this.follower.classList.remove('active');
        }
    }

    animate() {
        // 降低 ease 值以增加延迟感
        const ease = 0.08;
        
        // 计算跟随者的新位置
        this.followerPos.x += (this.cursorPos.x - this.followerPos.x) * ease;
        this.followerPos.y += (this.cursorPos.y - this.followerPos.y) * ease;
        
        // 应用位置，添加 -50% 偏移以使光标居中
        this.cursor.style.transform = `translate(${this.cursorPos.x}px, ${this.cursorPos.y}px) translate(-50%, -50%)`;
        this.follower.style.transform = `translate(${this.followerPos.x}px, ${this.followerPos.y}px) translate(-50%, -50%)`;
        
        requestAnimationFrame(this.animate);
    }

    mouseClicked(e) {
        // 如果正在转场，不创建点击效果
        if (isTransitioning) return;
        
        // 播放点击音效
        this.createClickSound();

        // 创建扩散环
        const ring = document.createElement('div');
        ring.className = 'click-ring';
        ring.style.left = `${e.clientX}px`;
        ring.style.top = `${e.clientY}px`;
        this.container.appendChild(ring);

        // 创建粒子爆炸效果
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            particle.style.left = `${e.clientX}px`;
            particle.style.top = `${e.clientY}px`;
            
            const angle = (Math.PI * 2 * i) / 12;
            const velocity = 2 + Math.random() * 2;
            
            particle.style.setProperty('--angle', `${angle}rad`);
            particle.style.setProperty('--velocity', `${velocity}`);
            
            this.container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }

        setTimeout(() => ring.remove(), 1000);
    }

    initAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized');
        } catch(e) {
            console.log('Web Audio API not supported');
            this.audioCtx = null;
        }
    }

    createClickSound() {
        if (!this.audioCtx) return;

        // 创建音频节点
        const mainGain = this.audioCtx.createGain();
        mainGain.connect(this.audioCtx.destination);
        mainGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

        // 主音色 - 高频清脆音
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        osc1.connect(gain1);
        gain1.connect(mainGain);
        
        gain1.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

        // 低频补充音
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(600, this.audioCtx.currentTime);
        osc2.connect(gain2);
        gain2.connect(mainGain);
        
        gain2.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.03);

        osc1.start(this.audioCtx.currentTime);
        osc2.start(this.audioCtx.currentTime);
        
        osc1.stop(this.audioCtx.currentTime + 0.05);
        osc2.stop(this.audioCtx.currentTime + 0.03);
    }
}

// 修改转场相关代码
document.addEventListener('DOMContentLoaded', function() {
    // 检测是否为移动设备
    isMobileDevice = detectMobileDevice();
    
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
                isTransitioning = true;
                
                // 销毁当前鼠标效果实例（仅在非移动设备上）
                if (!isMobileDevice && mouseEffect) {
                    mouseEffect.destroy();
                    mouseEffect = null;
                }
                
                // 直接黑屏
                document.body.style.opacity = '0';
                document.body.style.visibility = 'hidden';
                
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 100);
            }
        });
    });
});

// 页面加载时初始化（仅在非移动设备上）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!detectMobileDevice()) {
            mouseEffect = new MouseEffect();
        }
    });
} else {
    if (!detectMobileDevice()) {
        mouseEffect = new MouseEffect();
    }
}

// 处理页面切换
document.addEventListener('pjax:complete', () => {
    isTransitioning = false;
    if (!detectMobileDevice()) {
        mouseEffect = new MouseEffect();
    }
});

// 页面加载完成后重置状态
window.addEventListener('load', function() {
    isTransitioning = false;
    if (!detectMobileDevice() && !mouseEffect) {
        mouseEffect = new MouseEffect();
    }
});

// 处理窗口大小变化
window.addEventListener('resize', function() {
    const wasMobile = isMobileDevice;
    isMobileDevice = detectMobileDevice();
    
    // 如果设备类型改变
    if (wasMobile !== isMobileDevice) {
        if (isMobileDevice && mouseEffect) {
            // 从桌面变为移动设备
            mouseEffect.destroy();
            mouseEffect = null;
        } else if (!isMobileDevice && !mouseEffect) {
            // 从移动设备变为桌面
            mouseEffect = new MouseEffect();
        }
    }
}); 