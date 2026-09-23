class SystemMonitor {
    constructor() {
        this.stats = {
            cpu: 0,
            memory: 0,
            disk: 85,
            network: {
                up: 0,
                down: 0
            }
        };
        
        this.updateInterval = null;
    }
    
    // 模拟数据更新
    updateStats() {
        this.stats.cpu = Math.floor(20 + Math.random() * 60);
        this.stats.memory = Math.floor(40 + Math.random() * 30);
        this.stats.network.up = Math.floor(Math.random() * 1000);
        this.stats.network.down = Math.floor(Math.random() * 1000);
    }
    
    // 生成进度条
    generateProgressBar(value, length = 20) {
        const filled = Math.floor(value * length / 100);
        return `[${'█'.repeat(filled)}${'-'.repeat(length - filled)}] ${value}%`;
    }
    
    // 格式化网络速度
    formatSpeed(speed) {
        return speed < 1000 ? `${speed} KB/s` : `${(speed/1000).toFixed(1)} MB/s`;
    }
    
    // 获取格式化的系统信息
    getFormattedStats() {
        this.updateStats();
        return `
╔════════ SYSTEM MONITOR ════════╗
║                                ║
║  CPU Usage:                    ║
║  ${this.generateProgressBar(this.stats.cpu)}    ║
║                                ║
║  Memory Usage:                 ║
║  ${this.generateProgressBar(this.stats.memory)}    ║
║                                ║
║  Disk Usage:                   ║
║  ${this.generateProgressBar(this.stats.disk)}    ║
║                                ║
║  Network:                      ║
║  ↑ ${this.formatSpeed(this.stats.network.up).padEnd(15)}           ║
║  ↓ ${this.formatSpeed(this.stats.network.down).padEnd(15)}           ║
║                                ║
╚════════════════════════════════╝
`;
    }
    
    start() {
        if (this.updateInterval) {
            return this.getFormattedStats();
        }
        
        const output = document.getElementById('output');
        const initialStats = this.getFormattedStats();
        
        this.updateInterval = setInterval(() => {
            if (output.lastChild && output.lastChild.textContent.includes('SYSTEM MONITOR')) {
                output.lastChild.textContent = this.getFormattedStats();
            }
        }, 1000);
        
        return initialStats;
    }
    
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

window.systemMonitor = new SystemMonitor(); 