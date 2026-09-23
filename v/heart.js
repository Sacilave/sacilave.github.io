// 首先定义 HeartAnimation 类
class HeartAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.A = 1;
        this.B = 1;
        
        // 设置画布大小
        this.canvas.width = 120;
        this.canvas.height = 120;
        
        // ASCII字符集，从暗到亮
        this.ascii = '█▓▒░,.·:;=+*%#@'.split('');
        
        // 预计算
        this.cosA = Math.cos(this.A);
        this.sinA = Math.sin(this.A);
        this.cosB = Math.cos(this.B);
        this.sinB = Math.sin(this.B);
        
        // 缓冲区
        this.buffer = new Array(120 * 120).fill(' ');
        this.zbuffer = new Array(120 * 120).fill(0);
        
        this.animate = this.animate.bind(this);
        this.animationId = null;
    }
    
    // 心形方程
    heartShape(u, v) {
        // 参数范围：u, v ∈ [0, 2π]
        const cu = Math.cos(u);
        const su = Math.sin(u);
        const cv = Math.cos(v);
        const sv = Math.sin(v);
        
        // 调整心形方程的参数以增大心形
        const x = 3 * su * su * su; // 增大 x 轴比例
        const y = (13 * cu - 5 * Math.cos(2*u) - 2 * Math.cos(3*u) - Math.cos(4*u)) / 8;
        const z = 1.2 * sv * Math.pow(Math.abs(cu), 0.5); // 增大 z 轴比例
        
        return { x, y: z, z: y };
    }
    
    start() {
        this.animate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 清空缓冲区
        this.buffer.fill(' ');
        this.zbuffer.fill(0);
        
        // 旋转角度
        this.A += 0.07;
        this.B += 0.03;
        
        this.cosA = Math.cos(this.A);
        this.sinA = Math.sin(this.A);
        this.cosB = Math.cos(this.B);
        this.sinB = Math.sin(this.B);
        
        // 渲染心形
        for(let u = 0; u < 2 * Math.PI; u += 0.05) {
            for(let v = 0; v < 2 * Math.PI; v += 0.05) {
                const point = this.heartShape(u, v);
                
                // 3D旋转
                let x = point.x;
                let y = point.y;
                let z = point.z;
                
                // 绕Y轴旋转
                const x1 = x * this.cosA - z * this.sinA;
                const z1 = x * this.sinA + z * this.cosA;
                
                // 绕X轴旋转
                const y1 = y * this.cosB - z1 * this.sinB;
                const z2 = y * this.sinB + z1 * this.cosB;
                
                // 增大投影比例
                const scale = 25; // 增大比例
                const xp = Math.floor(this.canvas.width/2 + scale * x1 / (z2 + 5));
                const yp = Math.floor(this.canvas.height/2 + scale * y1 / (z2 + 5));
                
                // 计算光照
                const L = 0.7 * (x1 * 0.5 + y1 * 0.5 + z2 * 0.5);
                
                if (xp >= 0 && xp < this.canvas.width && yp >= 0 && yp < this.canvas.height) {
                    const o = xp + this.canvas.width * yp;
                    const luminance = Math.floor((L + 1) * 7);
                    
                    if (z2 > this.zbuffer[o]) {
                        this.zbuffer[o] = z2;
                        this.buffer[o] = this.ascii[Math.max(0, Math.min(luminance, this.ascii.length - 1))];
                    }
                }
            }
        }
        
        // 绘制到画布
        this.ctx.fillStyle = '#ff69b4'; // 粉色
        this.ctx.font = '3px monospace';
        
        for(let i = 0; i < this.canvas.width; i++) {
            for(let j = 0; j < this.canvas.height; j++) {
                const char = this.buffer[i + this.canvas.width * j];
                if (char !== ' ') {
                    this.ctx.fillText(char, i, j);
                }
            }
        }
        
        this.animationId = requestAnimationFrame(this.animate);
    }
}

// 然后定义 HeartManager 类
class HeartManager {
    constructor() {
        this.hearts = [];
        
        this.style = document.createElement('style');
        this.style.textContent = `
            .heart-container {
                position: fixed;
                width: 300px;
                height: 300px;
                background: #000;
                border: 1px solid #ff69b4;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(255, 105, 180, 0.2);
                overflow: hidden;
                z-index: 1000;
                display: flex;
                flex-direction: column;
            }
            .heart-titlebar {
                height: 30px;
                background: rgba(255, 105, 180, 0.2);
                display: flex;
                align-items: center;
                padding: 0 10px;
                cursor: move;
                user-select: none;
            }
            .heart-buttons {
                display: flex;
                gap: 8px;
                margin-right: 10px;
            }
            .heart-button {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 1px solid rgba(255, 105, 180, 0.4);
            }
            .heart-close {
                background: #500;
                border-color: #f00;
            }
            .heart-minimize {
                background: #550;
                border-color: #ff0;
            }
            .heart-maximize {
                background: #050;
                border-color: #0f0;
            }
            .heart-title {
                color: #ff69b4;
                font-family: monospace;
                font-size: 12px;
                flex-grow: 1;
            }
            .heart-canvas-container {
                flex-grow: 1;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .heart-canvas {
                width: 100%;
                height: 100%;
            }
        `;
        document.head.appendChild(this.style);
        this.setupDragHandling();
    }
    
    setupDragHandling() {
        let draggedWindow = null;
        let initialX = 0;
        let initialY = 0;
        
        document.addEventListener('mousedown', (e) => {
            const titlebar = e.target.closest('.heart-titlebar');
            if (titlebar) {
                draggedWindow = titlebar.parentElement;
                const rect = draggedWindow.getBoundingClientRect();
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
                draggedWindow.style.zIndex = 1001;
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (draggedWindow) {
                const x = e.clientX - initialX;
                const y = e.clientY - initialY;
                draggedWindow.style.left = `${x}px`;
                draggedWindow.style.top = `${y}px`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (draggedWindow) {
                draggedWindow.style.zIndex = 1000;
                draggedWindow = null;
            }
        });
    }
    
    createHeart() {
        const container = document.createElement('div');
        container.className = 'heart-container';
        container.style.left = Math.random() * (window.innerWidth - 300) + 'px';
        container.style.top = Math.random() * (window.innerHeight - 300) + 'px';
        
        const titlebar = document.createElement('div');
        titlebar.className = 'heart-titlebar';
        
        const buttons = document.createElement('div');
        buttons.className = 'heart-buttons';
        ['close', 'minimize', 'maximize'].forEach(type => {
            const button = document.createElement('div');
            button.className = `heart-button heart-${type}`;
            if (type === 'close') {
                button.onclick = () => {
                    this.removeHeart(container);
                };
            }
            buttons.appendChild(button);
        });
        
        const title = document.createElement('div');
        title.className = 'heart-title';
        title.textContent = 'Heart Animation - Terminal';
        
        titlebar.appendChild(buttons);
        titlebar.appendChild(title);
        container.appendChild(titlebar);
        
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'heart-canvas-container';
        const canvas = document.createElement('canvas');
        canvas.className = 'heart-canvas';
        canvasContainer.appendChild(canvas);
        container.appendChild(canvasContainer);
        
        const heart = new HeartAnimation(canvas);
        this.hearts.push({ container, animation: heart });
        
        document.body.appendChild(container);
        heart.start();
    }
    
    removeHeart(container) {
        const index = this.hearts.findIndex(h => h.container === container);
        if (index !== -1) {
            this.hearts[index].animation.stop();
            container.remove();
            this.hearts.splice(index, 1);
        }
    }
    
    start(count = 20) {
        if (this.hearts) {
            this.stop();
        }
        this.hearts = [];
        for(let i = 0; i < count; i++) {
            this.createHeart();
        }
    }
    
    stop() {
        if (this.hearts) {
            this.hearts.forEach(heart => {
                if (heart.animation) heart.animation.stop();
                if (heart.container) heart.container.remove();
            });
            this.hearts = [];
        }
    }
}

// 确保全局实例被创建
window.heartManager = new HeartManager(); 