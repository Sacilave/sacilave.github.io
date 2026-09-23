class CodeRain {
    constructor() {
        this.chars = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
        this.streams = [];
        this.fontSize = 16;
        this.isRunning = false;
        this.canvas = null;
        this.animationId = null;
    }

    createStream(x) {
        return {
            x,
            y: 0,
            speed: 1 + Math.random() * 3,
            chars: Array(Math.floor(10 + Math.random() * 20)).fill(0)
                .map(() => this.chars[Math.floor(Math.random() * this.chars.length)])
        };
    }

    start() {
        if (this.isRunning) return;
        
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;opacity:0.7;';
        document.body.appendChild(this.canvas);
        
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.streams = Array(Math.floor(this.canvas.width / this.fontSize))
                .fill(0)
                .map((_, i) => this.createStream(i * this.fontSize));
        };
        
        window.addEventListener('resize', resize);
        resize();
        
        const ctx = this.canvas.getContext('2d');
        ctx.font = `${this.fontSize}px monospace`;
        
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.streams.forEach(stream => {
                stream.chars.forEach((char, i) => {
                    const y = stream.y - i * this.fontSize;
                    const alpha = (1 - i / stream.chars.length) * 0.8;
                    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                    ctx.fillText(char, stream.x, y);
                });
                
                stream.y += stream.speed;
                if (stream.y > this.canvas.height + stream.chars.length * this.fontSize) {
                    Object.assign(stream, this.createStream(stream.x));
                    stream.y = 0;
                }
                
                if (Math.random() < 0.005) {
                    stream.chars[Math.floor(Math.random() * stream.chars.length)] =
                        this.chars[Math.floor(Math.random() * this.chars.length)];
                }
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.isRunning = true;
        animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.isRunning = false;
            if (this.canvas) {
                this.canvas.remove();
                this.canvas = null;
            }
        }
    }
}

// 创建全局实例
window.codeRain = new CodeRain(); 