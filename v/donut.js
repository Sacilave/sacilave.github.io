class DonutAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.A = 1;
        this.B = 1;
        
        // 设置画布大小
        this.canvas.width = 80;
        this.canvas.height = 80;
        
        // ASCII字符集
        this.ascii = '.,-~:;=!*#$@'.split('');
        
        // 预计算
        this.cosA = Math.cos(this.A);
        this.sinA = Math.sin(this.A);
        this.cosB = Math.cos(this.B);
        this.sinB = Math.sin(this.B);
        
        // 缓冲区
        this.buffer = new Array(80 * 80).fill(' ');
        this.zbuffer = new Array(80 * 80).fill(0);
        
        this.animate = this.animate.bind(this);
        this.animationId = null;
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
        this.ctx.fillRect(0, 0, 80, 80);
        
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
        
        // 渲染甜甜圈
        for(let theta = 0; theta < 6.28; theta += 0.07) {
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);
            
            for(let phi = 0; phi < 6.28; phi += 0.02) {
                const cosPhi = Math.cos(phi);
                const sinPhi = Math.sin(phi);
                
                const h = cosTheta + 2;
                const D = 1 / (sinPhi * h * this.sinA + sinTheta * this.cosA + 5);
                const t = sinPhi * h * this.cosA - sinTheta * this.sinA;
                
                const x = Math.floor(40 + 30 * D * (cosPhi * h * this.cosB - t * this.sinB));
                const y = Math.floor(40 + 15 * D * (cosPhi * h * this.sinB + t * this.cosB));
                const o = x + 80 * y;
                const N = Math.floor(8 * ((sinTheta * this.sinA - sinPhi * cosTheta * this.cosA) * this.cosB - sinPhi * cosTheta * this.sinA - sinTheta * this.cosA - cosPhi * cosTheta * this.sinB));
                
                if(y < 80 && y >= 0 && x >= 0 && x < 80 && D > this.zbuffer[o]) {
                    this.zbuffer[o] = D;
                    this.buffer[o] = this.ascii[N > 0 ? N : 0];
                }
            }
        }
        
        // 绘制到画布
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '2px monospace';
        
        for(let i = 0; i < 80; i++) {
            for(let j = 0; j < 80; j++) {
                this.ctx.fillText(this.buffer[i + 80 * j], i, j);
            }
        }
        
        this.animationId = requestAnimationFrame(this.animate);
    }
}

class DonutManager {
    constructor() {
        this.donuts = [];
        this.style = document.createElement('style');
        this.style.textContent = `
            .donut-container {
                position: fixed;
                width: 300px;
                height: 300px;
                background: #000;
                border: 1px solid #0f0;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
                overflow: hidden;
                z-index: 1000;
                display: flex;
                flex-direction: column;
            }
            .donut-titlebar {
                height: 30px;
                background: rgba(0, 255, 0, 0.2);
                display: flex;
                align-items: center;
                padding: 0 10px;
                cursor: move;
                user-select: none;
            }
            .donut-buttons {
                display: flex;
                gap: 8px;
                margin-right: 10px;
            }
            .donut-button {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 1px solid rgba(0, 255, 0, 0.4);
            }
            .donut-close {
                background: #500;
                border-color: #f00;
            }
            .donut-minimize {
                background: #550;
                border-color: #ff0;
            }
            .donut-maximize {
                background: #050;
                border-color: #0f0;
            }
            .donut-title {
                color: #0f0;
                font-family: monospace;
                font-size: 12px;
                flex-grow: 1;
            }
            .donut-canvas-container {
                flex-grow: 1;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .donut-canvas {
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
            const titlebar = e.target.closest('.donut-titlebar');
            if (titlebar) {
                draggedWindow = titlebar.parentElement;
                const rect = draggedWindow.getBoundingClientRect();
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
                draggedWindow.style.zIndex = 1001; // 提升正在拖动的窗口
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
    
    createDonut() {
        const container = document.createElement('div');
        container.className = 'donut-container';
        container.style.left = Math.random() * (window.innerWidth - 300) + 'px';
        container.style.top = Math.random() * (window.innerHeight - 300) + 'px';
        
        // 添加标题栏
        const titlebar = document.createElement('div');
        titlebar.className = 'donut-titlebar';
        
        // 添加按钮组
        const buttons = document.createElement('div');
        buttons.className = 'donut-buttons';
        ['close', 'minimize', 'maximize'].forEach(type => {
            const button = document.createElement('div');
            button.className = `donut-button donut-${type}`;
            if (type === 'close') {
                button.onclick = () => {
                    this.removeDonut(container);
                };
            }
            buttons.appendChild(button);
        });
        
        // 添加标题
        const title = document.createElement('div');
        title.className = 'donut-title';
        title.textContent = 'Donut Animation - Terminal';
        
        titlebar.appendChild(buttons);
        titlebar.appendChild(title);
        container.appendChild(titlebar);
        
        // 添加画布容器
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'donut-canvas-container';
        const canvas = document.createElement('canvas');
        canvas.className = 'donut-canvas';
        canvasContainer.appendChild(canvas);
        container.appendChild(canvasContainer);
        
        const donut = new DonutAnimation(canvas);
        this.donuts.push({ container, animation: donut });
        
        document.body.appendChild(container);
        donut.start();
    }
    
    removeDonut(container) {
        const index = this.donuts.findIndex(d => d.container === container);
        if (index !== -1) {
            this.donuts[index].animation.stop();
            container.remove();
            this.donuts.splice(index, 1);
        }
    }
    
    start(count = 20) { // 增加默认窗口数量
        this.stop();
        for(let i = 0; i < count; i++) {
            this.createDonut();
        }
    }
    
    stop() {
        this.donuts.forEach(donut => {
            donut.animation.stop();
            donut.container.remove();
        });
        this.donuts = [];
    }
}

// 导出管理器实例
window.donutManager = new DonutManager(); 