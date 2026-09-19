class Minesweeper {
    constructor(width = 10, height = 10, mines = 10) {
        this.width = width;
        this.height = height;
        this.mines = mines;
        this.grid = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.firstMove = true;
        
        // 创建游戏容器
        this.container = document.createElement('div');
        this.container.className = 'minesweeper-container';
        this.container.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: #000;
            border: 1px solid #0f0;
            padding: 20px;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
            display: none;
        `;
        
        // 添加标题栏
        this.titleBar = document.createElement('div');
        this.titleBar.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 5px;
            border-bottom: 1px solid #0f0;
        `;
        
        const title = document.createElement('span');
        title.textContent = 'Minesweeper';
        title.style.color = '#0f0';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #0f0;
            font-size: 20px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => this.stop();
        
        this.titleBar.appendChild(title);
        this.titleBar.appendChild(closeBtn);
        this.container.appendChild(this.titleBar);
        
        // 创建游戏网格
        this.gameGrid = document.createElement('div');
        this.gameGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${width}, 30px);
            gap: 1px;
            background: #0f0;
            padding: 1px;
        `;
        
        document.body.appendChild(this.container);
    }

    createCell(x, y) {
        const cell = document.createElement('div');
        cell.style.cssText = `
            width: 30px;
            height: 30px;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0f0;
            font-family: monospace;
            cursor: pointer;
            user-select: none;
        `;
        
        cell.onclick = (e) => {
            if (this.firstMove) {
                this.placeMines(x, y);
                this.firstMove = false;
            }
            this.revealCell(x, y);
        };
        
        cell.oncontextmenu = (e) => {
            e.preventDefault();
            this.flagCell(x, y);
        };
        
        return cell;
    }

    init() {
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
        this.revealed = Array(this.height).fill().map(() => Array(this.width).fill(false));
        this.flagged = Array(this.height).fill().map(() => Array(this.width).fill(false));
        this.gameOver = false;
        this.firstMove = true;
        
        // 清空并重建游戏网格
        this.gameGrid.innerHTML = '';
        this.cells = Array(this.height).fill().map(() => Array(this.width));
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.createCell(x, y);
                this.cells[y][x] = cell;
                this.gameGrid.appendChild(cell);
            }
        }
        
        this.container.appendChild(this.gameGrid);
        this.container.style.display = 'block';
    }

    placeMines(firstX, firstY) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            // 避免在第一次点击的位置及其周围放置地雷
            if (this.grid[y][x] !== -1 && 
                Math.abs(x - firstX) > 1 || Math.abs(y - firstY) > 1) {
                this.grid[y][x] = -1;
                minesPlaced++;
            }
        }

        // 计算数字
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== -1) {
                    let count = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const ny = y + dy;
                            const nx = x + dx;
                            if (ny >= 0 && ny < this.height && 
                                nx >= 0 && nx < this.width && 
                                this.grid[ny][nx] === -1) {
                                count++;
                            }
                        }
                    }
                    this.grid[y][x] = count;
                }
            }
        }
    }

    revealCell(x, y) {
        if (this.flagged[y][x] || this.revealed[y][x] || this.gameOver) return;
        
        this.revealed[y][x] = true;
        const cell = this.cells[y][x];
        
        if (this.grid[y][x] === -1) {
            cell.textContent = '💣';
            cell.style.background = '#f00';
            this.gameOver = true;
            setTimeout(() => alert('Game Over!'), 100);
            return;
        }
        
        if (this.grid[y][x] === 0) {
            cell.style.background = '#111';
            // 自动揭开周围的空格
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        this.revealCell(nx, ny);
                    }
                }
            }
        } else {
            cell.textContent = this.grid[y][x];
            cell.style.background = '#111';
        }
        
        // 修改胜利检查逻辑
        if (!this.gameOver) {  // 只在游戏未结束时检查胜利
            let unrevealed = 0;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (!this.revealed[y][x] && this.grid[y][x] !== -1) {
                        unrevealed++;
                    }
                }
            }
            if (unrevealed === 0) {
                this.gameOver = true;  // 先设置游戏结束
                setTimeout(() => alert('🎉 YOU WIN 🎉'), 100);  // 修改胜利消息
            }
        }
    }

    flagCell(x, y) {
        if (this.revealed[y][x] || this.gameOver) return;
        
        this.flagged[y][x] = !this.flagged[y][x];
        const cell = this.cells[y][x];
        cell.textContent = this.flagged[y][x] ? '🚩' : '';
    }

    stop() {
        this.container.style.display = 'none';
        this.gameOver = true;
    }
}

// 确保 showMinesweeperConfig 函数在全局作用域中
window.showMinesweeperConfig = function() {
    const configContainer = document.createElement('div');
    configContainer.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: #000;
        border: 1px solid #0f0;
        padding: 20px;
        z-index: 1000;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
        font-family: monospace;
        color: #0f0;
    `;
    
    const form = document.createElement('form');
    form.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    
    const inputStyle = `
        background: #000;
        border: 1px solid #0f0;
        color: #0f0;
        padding: 5px;
        width: 60px;
        font-family: monospace;
        margin-left: 10px;
    `;
    
    form.innerHTML = `
        <div>Width: <input type="number" name="width" value="10" min="5" max="30" style="${inputStyle}"></div>
        <div>Height: <input type="number" name="height" value="10" min="5" max="30" style="${inputStyle}"></div>
        <div>Mines: <input type="number" name="mines" value="10" min="1" max="100" style="${inputStyle}"></div>
        <button type="submit" style="
            background: #000;
            border: 1px solid #0f0;
            color: #0f0;
            padding: 8px;
            margin-top: 10px;
            cursor: pointer;
            font-family: monospace;
            transition: background-color 0.2s;
        ">Start Game</button>
    `;
    
    form.querySelector('button').onmouseover = (e) => {
        e.target.style.backgroundColor = '#0f0';
        e.target.style.color = '#000';
    };
    
    form.querySelector('button').onmouseout = (e) => {
        e.target.style.backgroundColor = '#000';
        e.target.style.color = '#0f0';
    };
    
    form.onsubmit = (e) => {
        e.preventDefault();
        const width = parseInt(form.width.value);
        const height = parseInt(form.height.value);
        const mines = parseInt(form.mines.value);
        
        // 验证输入
        const maxMines = Math.floor((width * height) * 0.8);
        if (mines > maxMines) {
            alert(`Too many mines! Maximum allowed: ${maxMines}`);
            return;
        }
        
        if (window.minesweeperGame) {
            window.minesweeperGame.stop();
        }
        window.minesweeperGame = new Minesweeper(width, height, mines);
        window.minesweeperGame.init();
        
        configContainer.remove();
    };
    
    configContainer.appendChild(form);
    document.body.appendChild(configContainer);
};

window.minesweeperGame = null;