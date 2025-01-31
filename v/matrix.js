class MatrixEffect {
    constructor() {
        this.style = document.createElement('style');
        this.style.textContent = `
            .matrix-canvas {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                opacity: 0.8;
                pointer-events: none;
                transition: opacity 0.5s;
            }
        `;
        document.head.appendChild(this.style);
        
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'matrix-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.fontSize = 14;
        this.animationId = null;
        
        // Matrix字符集
        this.chars = 'ラビットハウス0123456789ABCDEF'.split('');
        
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        window.addEventListener('resize', this.resize);
    }
    
    init() {
        document.body.appendChild(this.canvas);
        this.resize();
        
        // 初始化雨滴
        this.drops = Array(Math.ceil(this.canvas.width / this.fontSize))
            .fill(0)
            .map(() => -Math.floor(Math.random() * 100));
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.font = `${this.fontSize}px monospace`;
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#0F0';
        this.drops.forEach((y, i) => {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            
            this.ctx.fillText(char, x, y);
            
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            } else {
                this.drops[i] = y + this.fontSize;
            }
        });
        
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    start() {
        if (!this.canvas.parentNode) {
            this.init();
        }
        if (!this.animationId) {
            this.animate();
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.canvas.parentNode) {
            this.canvas.remove();
        }
    }
}

window.matrixEffect = new MatrixEffect(); 