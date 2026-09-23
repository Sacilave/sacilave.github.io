document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('output');
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const style = document.createElement('style');
    style.textContent = `
        #snakeCanvas {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            display: none;
            border: 1px solid #0f0;
            background: #000;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
    
    let currentGame = null;
    // 在文件开头添加命令历史相关变量
    let commandHistory = [];
    let historyIndex = -1;
    let tempInput = '';

    const directories = {
        'Home': 'https://lave.fun/',
        'Gallery': 'https://lave.fun/gallery/',
        'Tag': 'https://lave.fun/tags/',
        'Categories': 'https://lave.fun/categories/',
        'Old': 'https://lave.fun/old/',
        'About': 'https://lave.fun/about/',
        'Link': 'https://lave.fun/link/',
        'Diary': 'https://lave.fun/shuoshuo/'
    };

    const commands = {
        help: `Available commands (可用命令):
    - help      : Show this help message (显示帮助信息)
    - clear     : Clear the terminal (清空终端)
    - date      : Show current date and time (显示当前日期时间)
    - echo      : Echo back your input (回显输入内容)
    - whoami    : Show site owner (显示网站所有者)
    - hello     : Show welcome message (显示欢迎信息)
    - ls        : List available directories (列出可用目录)
    - cd        : Change directory (切换目录)
    - quit      : Return to home page (返回主页)
    - lave      : Visit My Twitter profile (访问我的推特主页)
    - games     : List available games (显示可用游戏列表)
    - logo      : Show logo (显示Logo)
    - donut     : Start donut animation (开始甜甜圈动画)
    - matrix    : Toggle matrix rain effect（切换矩阵雨效果开启）
    - rain      : Toggle Japanese style code rain effect（切换日式代码雨效果开启）
    - system    : Toggle system monitor（切换系统监控开启）
    - heart     : Toggle heart animation（切换爱心动画开启）
    - sound     : Toggle sound effects（切换音效开启）
    

Available games (可用游戏):
    - snake     : Classic snake game (经典贪吃蛇)
                  Controls: Arrow keys or WASD
                  控制: 方向键或WASD, ESC退出
    - tetris    : Classic tetris (经典俄罗斯方块)
                  Controls: Arrow keys, Space to rotate
                  控制: 方向键移动, 空格旋转, ESC退出
    - breakout  : Classic breakout (经典打砖块)
                  Controls: Left/Right arrows or A/D
                  控制: 左右方向键或AD移动, ESC退出
    - pong      : Classic pong game (经典乒乓球)
                  Controls: W/S and Up/Down arrows
                  控制: WS和方向键上下控制, ESC退出
    - minesweeper : Minesweeper game（扫雷游戏）
                   Controls: Click to reveal, Right click to mark
                   控制: 点击揭露, 右键标记
    `,
        clear: () => output.innerHTML = '',
        date: () => new Date().toString(),
        echo: (args) => args.join(' '),
        whoami: 'Sacilave / Lave',
        hello: 'Hello there~ Welcome to the Lave\'s Cabin',
        ls: () => Object.keys(directories).join('\n'),
        cd: (args) => {
            const dir = args[0];
            if (!dir) return 'Please specify a directory';
            const url = directories[dir];
            if (!url) return `Directory not found: ${dir}`;
            window.location.href = url;
            return `Navigating to ${dir}...`;
        },
        quit: () => {
            window.location.href = 'https://lave.fun/';
            return 'Redirecting to home page...';
        },
        lave: () => {
            window.location.href = 'https://x.com/Sacilave2';
            return 'Redirecting to Twitter...';
        },
        games: () => `Available games (可用游戏):
    - snake    : Classic snake game (经典贪吃蛇)
    - tetris   : Classic tetris (经典俄罗斯方块)
    - breakout : Classic breakout (经典打砖块)
    - pong     : Classic pong game (经典乒乓球)
    - minesweeper : Minesweeper game（扫雷游戏）
    
Type the game name to start playing! (输入游戏名开始游戏!)
Press ESC to exit any game. (按ESC退出游戏)`,
        snake: () => {
            if (currentGame) {
                return 'A game is already running! Press ESC to exit current game first.';
            }
            startGame('snake');
            return 'Starting snake game... Use arrow keys or WASD to control, press ESC to exit.';
        },
        tetris: () => {
            if (currentGame) {
                return 'A game is already running! Press ESC to exit current game first.';
            }
            startGame('tetris');
            return 'Starting Tetris... Arrow keys to move, Space to rotate, press ESC to exit.';
        },
        breakout: () => {
            if (currentGame) {
                return 'A game is already running! Press ESC to exit current game first.';
            }
            startGame('breakout');
            return 'Starting Breakout... Use Left/Right arrows or A/D to move, press ESC to exit.';
        },
        pong: () => {
            if (currentGame) {
                return 'A game is already running! Press ESC to exit current game first.';
            }
            startGame('pong');
            return 'Starting Pong... W/S for left paddle, Up/Down for right paddle, press ESC to exit.';
        },
        logo: `
        ------------------------------------- Lave's Cabin ------------------------------------------
        
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠌⠚⢁⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⠒⠋⢦⡀⠀⠀⠀⠀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡤⠖⠁⢠⠀⠈⡄⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠀⠀⠀⠀⠈⠢⡀⠀⣸⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡤⠞⠉⠀⠀⠀⡞⠀⠀⠸⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡆⠀⡇⠀⠀⠀⠀⠈⣶⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠖⠋⠀⠀⠀⠀⠀⢠⠇⠀⠀⠀⡇⠀⠀⠀⠀
        ⠀⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡸⠀⠀⠁⠀⠀⠀⢀⣼⠋⠙⢦⡀⢀⣀⣤⠤⠤⠤⠶⠒⠒⠒⠒⠚⠣⠄⠀⠀⠀⠀⠀⠀⡞⠀⠈⠦⢤⣰⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⡄⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡇⠀⠀⠀⠀⡔⢁⣿⣃⠀⡀⠀⠙⡍⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡰⠁⠀⠀⠀⢞⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⣀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⡤⠊⣠⠟⠘⠀⠀⢇⡀⠀⠀⠀⠀⣠⠴⠖⠀⠀⠀⠈⠉⠉⠙⠒⠶⢤⡀⠀⠀⠈⠒⢄⠀⠀⠀⢻⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⡌⠀⠈⡆⠀⡿⠀⠀⠀⢀⡴⠋⠀⠀⠀⠀⢀⡜⠀⠀⠀⠞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠠⡀⠀⠀⠙⢆⡀⢻⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠊⠀⠆⠀⠃⠀⠀⠀⠀⡇⠀⠔⣼⠟⠁⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⠀⠀⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⢂⠀⠠⠀⠈⠢⡀⠀⠀⠙⣯⠀⠀⠀⠀⠀⠀⠀⠀
        ⢤⠔⠒⠀⠈⡔⠂⠀⠀⠄⠀⠀⡇⣠⡾⠃⢸⣀⣤⡀⠀⣀⡤⠤⢎⡤⠀⢀⡴⣦⠀⠀⣀⡤⠖⣶⠄⠀⠀⠀⠀⠈⢆⠀⠑⡀⠀⠀⠂⠀⠀⠈⠳⣄⠀⠀⠀⠀⠀⠀
        ⠿⡖⠀⢠⣴⠗⠲⢶⣀⠉⠄⣠⡿⠋⠀⣴⠟⣯⣵⣿⠶⢿⣇⣴⠟⠑⣴⠻⠟⣁⣠⠄⡏⠳⣍⠁⠀⠀⠀⠀⠀⠀⠈⠀⠀⠐⡄⠀⠀⠠⠀⠀⠀⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠁⢠⣿⠃⣀⣀⠁⢚⣿⣾⡿⣧⠀⠀⠙⠛⠙⠛⡏⠀⠘⠛⠁⠀⠀⠙⠛⠛⠉⣀⣀⣿⡴⠟⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⢳⡀⠀⠀⠱⠀⠀⠀⠀⠑⢄⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⡀⢸⣏⣀⣉⣻⣷⡟⠁⣸⠷⣜⡀⠀⠀⠀⠀⠸⠀⠀⠀⠀⠀⠀⠀⠐⢺⠋⠉⠉⠁⡿⢳⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⠀⠀⠀⠀⠐⠛⢲⣞⡟⣁⠔⠃⠐⠁⠀⠀⠀⠀⠀⠀
        ⠀⠈⠁⠈⠉⠉⠀⠨⠛⠂⣿⠀⠀⠙⠲⠄⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠀⢀⡧⠄⢡⡄⠀⠀⠀⠀⠀⠀⠀⠀⡆⠀⠀⡇⠈⢧⣀⠸⡀⠀⠀⠀⠀⠐⠠⢄⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀
        ⡀⠀⢰⠉⠀⠢⠀⠀⠁⠀⡇⠀⠀⠀⠀⠀⠀⢰⢁⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⡘⠀⠉⠀⠳⡀⠀⠀⠀⠀⠀⡆⠀⠇⡘⢠⣦⣴⣌⣿⣀⡇⠀⠀⠀⠀⠀⢦⡀⠀⢤⠀⠀⠀⠀⠀⠀⠀⠀
        ⢤⡒⠚⠢⠀⡄⠢⡀⠀⠀⡇⠀⠀⠀⠀⠀⠀⢘⠀⠀⠀⠀⠀⠀⠀⢰⠀⢸⠀⣼⡰⠁⠀⠀⢀⡀⠙⢌⠗⣄⠀⢀⢃⠷⠔⣷⣿⣿⡿⣿⡿⣿⡇⠀⠀⠆⠀⠀⠘⡎⠢⡀⠱⡀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⡇⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡆⢸⡾⢃⣤⣷⣶⣶⣶⣤⡀⠀⠉⠀⠀⠀⠀⠀⢸⣿⣍⠽⡇⠈⢣⣿⡇⠀⢀⠀⠀⠀⠀⡇⠀⠀⡀⡇⠀⠀⠀⠀
        ⠐⢈⠁⠁⠀⠀⠈⢣⡐⡀⢸⠀⠀⠀⢀⡠⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣸⣾⣿⣿⣿⡿⢻⣿⡎⠁⠀⠀⠀⠀⠀⠀⠀⠘⠈⠒⠚⠂⠀⢈⡿⠖⢁⡼⠀⢀⠎⡶⠃⠀⠀⠀⠀⠀⠀⠀⠀
        ⡐⠘⠋⠉⠀⠀⠀⠀⠙⣤⠸⠀⡤⠐⠉⠀⢀⣠⡄⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡿⣿⠟⢷⡎⠉⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠒⠚⠂⠀⢈⡿⠖⢁⡼⠀⢀⠎⡶⠃⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠆⠀⠠⡀⠀⠀⠀⠘⢇⡇⠀⠉⠒⠚⠉⠁⣇⠀⠀⠀⠀⠀⠀⠀⠀⡀⠈⢇⠹⢄⣀⣀⡠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠛⢲⣞⡟⣁⠔⠃⠐⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠈⠂⠐⠄⠀⠀⠀⠀⢺⡇⠀⠀⠀⠀⠀⠀⢻⡄⢆⠀⠀⠀⠀⠀⠀⠈⠂⢄⣰⣄⠉⠁⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣤⠀⠀⠀⠀⠀⠀⣸⠛⠛⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠠⠤⠤⠤
        ⠀⠀⠀⢰⡑⡄⠀⢀⡠⠒⠈⡇⠀⠀⠀⠀⠀⠀⢸⡿⢮⣧⡀⠀⠀⠢⣄⣀⣀⣀⣈⡱⠆⠁⠀⠀⠀⠀⠀⠀⡗⠁⠀⠀⠏⠀⠀⠀⠀⢀⡴⠃⠀⠀⠹⡀⠀⠄⣀⣀⡀⠠⠒⠊⠁⠤⠴⢒⡤⠄
        ⠀⠀⠀⠐⠷⢀⠔⡡⠐⠀⠀⡇⠀⠀⠀⠀⠀⠀⠘⡇⠀⠉⠛⠛⠶⠤⠤⠤⢷⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠈⠀⠀⠀⠀⢀⣠⠴⠋⠀⠀⠀⠀⠀⣹⣴⣞⡽⠋⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢
        ⠀⠀⠀⢐⠖⣅⠌⠀⠀⠀⢸⠃⢢⠀⠀⠀⠀⠀⠸⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⣯⠙⢷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⠶⠋⠁⠰⣇⠀⠀⣈⡶⠾⣁⣴⠿⠝⠁⠀⢠⠆⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⢀⠞⢀⠋⠀⠀⠀⠀⡸⠀⠀⠆⠀⠀⠀⠀⠀⢹⡀⠀⠀⠀⠀⠀⠀⠠⣀⠸⡆⢸⡇⠀⠀⠀⢀⠀⠀⢸⡏⠉⠉⠉⣠⢾⡆⠀⠀⢻⣦⠾⣋⣤⡴⠛⠁⠀⠀⠀⢀⡟⠀⠀⠀⠀⠀⠀⠀⠀
        ⡄⠀⢸⠈⡟⠄⠀⠀⠀⣰⠁⠀⠀⠈⢆⠀⠀⠀⠀⠈⢧⠀⠀⠀⠀⠀⠀⠀⠈⠙⠺⠾⠥⠤⠤⠔⢻⠀⠀⢸⣧⣄⠀⣴⠏⠀⠳⣄⣴⠟⠙⢶⣿⡏⢧⠀⠀⠀⠀⢀⣿⠁⠀⠠⣴⡶⠦⠀⠀⢠
        ⡝⣆⢸⠈⣗⠤⣀⣀⡜⠁⠀⠀⠀⠀⠈⢦⠀⠀⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡟⠀⠀⠸⣷⣝⢿⣿⣤⣀⡴⠟⠳⣄⣀⡀⢹⣷⠸⣤⣄⣀⣤⣿⡧⠖⠚⠉⠁⠀⠀⠀⢠⠃
        ⠙⣿⣿⣾⡝⡖⠋⠉⠒⠠⡀⠀⠀⠀⠀⠀⠑⢤⡀⠀⠀⠈⢧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⠋⠙⠲⢤⣀⡈⠻⣎⢟⣿⣿⣷⡦⣄⡇⠈⠉⠙⣯⣆⢣⣠⠤⣾⡃⠀⠀⠀⠿⠃⠀⠀⢠⠃⠀
        ⠒⠉⠁⠀⠻⠀⠀⠀⠀⠀⠀⠁⠂⢀⠀⠀⠀⠀⠙⠲⣤⣤⣀⣙⣲⣤⣀⣈⣑⣲⣶⣿⣿⣿⣿⣿⣶⣦⣄⡀⠙⠲⣼⡟⢏⢻⣿⣿⣮⠛⣆⠀⣤⢯⢸⡸⢃⡾⠁⠙⠲⣄⠀⠀⠀⠀⠀⡏⠀⠀
        ⠀⠀⢀⠾⢍⠁⢀⣀⣀⣀⣠⣤⢀⡴⠁⠀⠀⠀⢀⣠⣴⣶⣶⣶⣾⣿⡏⠀⠀⠈⠉⠛⠻⠿⣿⣿⣿⣿⣿⣿⣷⣾⣅⠉⠚⡆⢏⢻⣿⣷⣾⣿⣿⡜⠀⣧⣾⣿⢿⣶⠀⢘⡿⡄⣼⣇⣤⡙
        ⠀⣰⣣⣶⣾⣻⡃⣠⠴⠚⠁⠀⡼⠁⠀⠀⣠⣶⣿ ⣿⣿⣿⣿⣿⣿⣿⣿⡟⠎⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⣿⣿⣿⣿⣿⣿⣦⣴⡞⡍⢻⣿⣿⡿⠿⢇⣰⣿⣿⡷⢛⠕⠡⠞⠀⠹⡿⠋⣸⠧
        ⢠⡟⠁⢻⡿⣿⠟⠁⠀⠀⠀⠸⠇⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠛⢻⣿⣿⣿⣿⣿⣿⣷⠈⣿⣿⣿⡄⠀⢫⠀⠘⣿⣾⠤⢴⠓⠀⠀⣧⠚⠁⠀⠀⠀
        ⢸⠁⠀⠀⠃⢻⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡈⠋⠉⠁⠉⠻⣿⣿⣿⣿⠀⢹⣿⣿⣷⡀⠀⠱⣄⢻⠸⡆⠀⠀⠀⠀⣿⣿⣶⣦⣀⠀
        ⠘⣆⠀⠀⠀⠘⣆⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠌⢄⠀⠀⠀⠀⠈⠙⢿⣿⡆⢸⣿⣿⣿⣧⠀⠀⠘⢿⣇⢹⣦⣀⠀⠀⢸⣿⣿⣿⣿⣷

        ----------------------------------- Welcome to my site! ------------------------------------
        `,
        donut: () => {
            window.donutManager.start(20); // 创建20个甜甜圈窗口
            return 'Starting donut animation... Press ESC to exit.';
        },
        matrix: (args) => {
            if (!window.matrixEffect) {
                return 'Matrix effect not initialized!';
            }
            if (args && args[0] === 'stop') {
                window.matrixEffect.stop();
                return 'Matrix rain effect stopped.';
            }
            window.matrixEffect.start();
            return 'Matrix rain effect started. Type "matrix stop" to stop.';
        },
        rain: (args) => {
            if (args && args[0] === 'stop') {
                window.codeRain.stop();
                return 'Code rain stopped.';
            }
            window.codeRain.start();
            return 'Code rain started. Type "rain stop" to stop.';
        },
        system: (args) => {
            if (args && args[0] === 'stop') {
                window.systemMonitor.stop();
                return 'System monitor stopped.';
            }
            return window.systemMonitor.start();
        },
        heart: (args) => {
            if (!window.heartManager) {
                return 'Heart animation not initialized!';
            }
            if (args && args[0] === 'stop') {
                window.heartManager.stop();
                return 'Heart animation stopped.';
            }
            window.heartManager.start(20);
            return 'Starting heart animation... Press ESC to exit.';
        },
        minesweeper: (args) => {
            if (!args || !args.length) {
                if (typeof window.showMinesweeperConfig === 'function') {
                    window.showMinesweeperConfig();
                    return 'Opening Minesweeper configuration window...';
                } else {
                    return 'Error: Minesweeper game not properly loaded!';
                }
            }
            
            // 保留命令行操作方式作为备选
            const cmd = args[0];
            switch (cmd) {
                case 'new':
                    const width = parseInt(args[1]) || 10;
                    const height = parseInt(args[2]) || 10;
                    const mines = parseInt(args[3]) || 10;
                    if (window.minesweeperGame) {
                        window.minesweeperGame.stop();
                    }
                    window.minesweeperGame = new Minesweeper(width, height, mines);
                    window.minesweeperGame.init();
                    return 'Minesweeper game started!';

                case 'stop':
                    if (window.minesweeperGame) {
                        window.minesweeperGame.stop();
                        window.minesweeperGame = null;
                        return 'Game stopped';
                    }
                    return 'No game in progress';

                default:
                    return `
Minesweeper Game Commands:
- minesweeper         : Open game window
- minesweeper stop    : Stop current game
                    `;
            }
        },
        password: (args) => {
            const length = parseInt(args[0]) || 12;
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
            let password = '';
            for (let i = 0; i < length; i++) {
                password += chars[Math.floor(Math.random() * chars.length)];
            }
            return `Generated password: ${password}`;
        },
        todo: (args) => {
            if (!args.length) {
                return todos.length ? 
                    todos.map((todo, i) => `${i + 1}. [${todo.done ? 'x' : ' '}] ${todo.text}`).join('\n') :
                    'No todos yet';
            }
            const cmd = args[0];
            switch(cmd) {
                case 'add':
                    todos.push({ text: args.slice(1).join(' '), done: false });
                    return 'Todo added';
                case 'done':
                    const index = parseInt(args[1]) - 1;
                    if (todos[index]) {
                        todos[index].done = true;
                        return 'Todo marked as done';
                    }
                    return 'Invalid todo index';
                default:
                    return 'Usage: todo [add <text> | done <number>]';
            }
        }
    };

    // 确保所有效果都已正确初始化
    if (!window.matrixEffect) {
        window.matrixEffect = new MatrixEffect();
    }
    if (!window.codeRain) {
        window.codeRain = new CodeRain();
    }
    if (!window.soundManager) {
        window.soundManager = new SoundManager();
    }
    
    // 自动启动 matrix 效果
    setTimeout(() => {
        window.matrixEffect.start();
    }, 500); // 延迟半秒启动，确保页面完全加载

    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');

    // 游戏管理器
    function startGame(gameName) {
        if (currentGame) {
            return false;
        }
        
        document.getElementById('terminal-input').blur();
        
        // 确保画布完全重置
        canvas.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        switch(gameName) {
            case 'snake':
                currentGame = new SnakeGame(canvas, ctx);
                break;
            case 'tetris':
                currentGame = new TetrisGame(canvas, ctx);
                break;
            case 'breakout':
                currentGame = new BreakoutGame(canvas, ctx);
                break;
            case 'pong':
                currentGame = new PongGame(canvas, ctx);
                break;
        }
        
        if (currentGame) {
            // 移除之前在 HTML 中定义的 style 属性
            canvas.removeAttribute('style');
            canvas.style.display = 'block';
            currentGame.start();
            return true;
        }
        return false;
    }

    function stopCurrentGame() {
        if (currentGame) {
            currentGame.stop();
            canvas.width = 0;  // 重置画布大小
            canvas.height = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清除画布
            currentGame = null;
            document.getElementById('terminal-input').focus();
        }
    }
    // Snake Game Implementation
    class SnakeGame {
        constructor(canvas, ctx) {
            this.canvas = canvas;
            this.ctx = ctx;
            this.gridSize = 15;
            this.tileCount = 30;
            
            canvas.width = this.gridSize * this.tileCount;
            canvas.height = this.gridSize * this.tileCount;
            
            this.reset();
            this.bindControls();
        }

        reset() {
            this.snake = [{x: Math.floor(this.tileCount/2), y: Math.floor(this.tileCount/2)}];
            this.food = this.generateFood();
            this.direction = {x: 1, y: 0};
            this.score = 0;
            this.gameLoop = null;
        }

        generateFood() {
            let food;
            do {
                food = {
                    x: Math.floor(Math.random() * this.tileCount),
                    y: Math.floor(Math.random() * this.tileCount)
                };
            } while (this.snake.some(segment => 
                segment.x === food.x && segment.y === food.y));
            return food;
        }

        bindControls() {
            this.keyHandler = (e) => {
                if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                    'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                    e.preventDefault();
                }
                
                switch(e.key.toLowerCase()) {
                    case 'arrowup':
                    case 'w':
                        if (this.direction.y !== 1) {
                            this.direction = {x: 0, y: -1};
                        }
                        break;
                    case 'arrowdown':
                    case 's':
                        if (this.direction.y !== -1) {
                            this.direction = {x: 0, y: 1};
                        }
                        break;
                    case 'arrowleft':
                    case 'a':
                        if (this.direction.x !== 1) {
                            this.direction = {x: -1, y: 0};
                        }
                        break;
                    case 'arrowright':
                    case 'd':
                        if (this.direction.x !== -1) {
                            this.direction = {x: 1, y: 0};
                        }
                        break;
                    case 'escape':
                        stopCurrentGame();
                        break;
                }
            };
            document.addEventListener('keydown', this.keyHandler);
        }

        update() {
            const head = {
                x: this.snake[0].x + this.direction.x,
                y: this.snake[0].y + this.direction.y
            };

            // 检查碰撞
            if (head.x < 0 || head.x >= this.tileCount || 
                head.y < 0 || head.y >= this.tileCount ||
                this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                stopCurrentGame();
                return;
            }

            this.snake.unshift(head);

            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                this.food = this.generateFood();
            } else {
                this.snake.pop();
            }
        }

        draw() {
            // 空画布
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 绘制网格
            this.ctx.strokeStyle = '#0f0';
            this.ctx.lineWidth = 0.5;
            this.ctx.globalAlpha = 0.1;
            for (let i = 0; i < this.tileCount; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(i * this.gridSize, 0);
                this.ctx.lineTo(i * this.gridSize, this.canvas.height);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(0, i * this.gridSize);
                this.ctx.lineTo(this.canvas.width, i * this.gridSize);
                this.ctx.stroke();
            }
            this.ctx.globalAlpha = 1;

            // 绘制蛇
            this.ctx.fillStyle = '#0f0';
            this.snake.forEach((segment, index) => {
                const size = index === 0 ? this.gridSize : this.gridSize - 2;
                const offset = index === 0 ? 0 : 1;
                this.ctx.fillRect(
                    segment.x * this.gridSize + offset,
                    segment.y * this.gridSize + offset,
                    size,
                    size
                );
            });

            // 绘制食物
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(
                this.food.x * this.gridSize,
                this.food.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );

            // 绘制分数
            this.ctx.fillStyle = '#0f0';
            this.ctx.font = '20px Consolas';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        }

        start() {
            this.canvas.style.display = 'block';
            this.reset();
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, 100);
        }

        stop() {
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = null;
            }
            document.removeEventListener('keydown', this.keyHandler);
            this.canvas.style.display = 'none';
            output.innerHTML += `\nGame Over! Score: ${this.score}\n`;
        }
    }
    // Tetris Game Implementation
    class TetrisGame {
        constructor(canvas, ctx) {
            this.canvas = canvas;
            this.ctx = ctx;
            this.blockSize = 20;
            this.cols = 12;
            this.rows = 20;
            
            canvas.width = this.blockSize * (this.cols + 6);
            canvas.height = this.blockSize * this.rows;
            
            this.reset();
            this.bindControls();
        }

        reset() {
            this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
            this.score = 0;
            this.gameLoop = null;
            this.dropCounter = 0;
            this.dropInterval = 1000;
            this.lastTime = 0;
            
            this.pieces = {
                'I': [[1,1,1,1]],
                'L': [[1,1,1],[1,0,0]],
                'J': [[1,1,1],[0,0,1]],
                'O': [[1,1],[1,1]],
                'Z': [[1,1,0],[0,1,1]],
                'S': [[0,1,1],[1,1,0]],
                'T': [[1,1,1],[0,1,0]]
            };
            
            this.colors = {
                'I': '#0f0',
                'L': '#0f0',
                'J': '#0f0',
                'O': '#0f0',
                'Z': '#0f0',
                'S': '#0f0',
                'T': '#0f0'
            };
            
            this.createNewPiece();
        }

        createNewPiece() {
            const pieces = Object.keys(this.pieces);
            const piece = pieces[Math.floor(Math.random() * pieces.length)];
            this.currentPiece = {
                shape: this.pieces[piece],
                color: this.colors[piece],
                x: Math.floor(this.cols / 2) - Math.floor(this.pieces[piece][0].length / 2),
                y: 0
            };
            
            const nextPiece = pieces[Math.floor(Math.random() * pieces.length)];
            this.nextPiece = {
                shape: this.pieces[nextPiece],
                color: this.colors[nextPiece]
            };
            
            if (this.collision()) {
                stopCurrentGame();
            }
        }

        collision() {
            const shape = this.currentPiece.shape;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] !== 0) {
                        const newX = this.currentPiece.x + x;
                        const newY = this.currentPiece.y + y;
                        if (newX < 0 || newX >= this.cols || 
                            newY >= this.rows ||
                            (newY >= 0 && this.grid[newY][newX])) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        rotate() {
            const shape = this.currentPiece.shape;
            const newShape = shape[0].map((_, i) => 
                shape.map(row => row[i]).reverse()
            );
            const oldShape = this.currentPiece.shape;
            this.currentPiece.shape = newShape;
            if (this.collision()) {
                this.currentPiece.shape = oldShape;
            }
        }

        moveDown() {
            this.currentPiece.y++;
            if (this.collision()) {
                this.currentPiece.y--;
                this.merge();
                this.createNewPiece();
                this.clearLines();
            }
        }

        moveLeft() {
            this.currentPiece.x--;
            if (this.collision()) {
                this.currentPiece.x++;
            }
        }

        moveRight() {
            this.currentPiece.x++;
            if (this.collision()) {
                this.currentPiece.x--;
            }
        }
        merge() {
            const shape = this.currentPiece.shape;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] !== 0) {
                        const newY = this.currentPiece.y + y;
                        if (newY >= 0) {
                            this.grid[newY][this.currentPiece.x + x] = 1;
                        }
                    }
                }
            }
        }

        clearLines() {
            let linesCleared = 0;
            for (let y = this.rows - 1; y >= 0; y--) {
                if (this.grid[y].every(cell => cell !== 0)) {
                    this.grid.splice(y, 1);
                    this.grid.unshift(Array(this.cols).fill(0));
                    linesCleared++;
                    y++; // 检查同一行
                }
            }
            if (linesCleared > 0) {
                this.score += [40, 100, 300, 1200][linesCleared - 1];
                this.dropInterval = Math.max(100, 1000 - (this.score / 100) * 50);
            }
        }

        bindControls() {
            this.keyHandler = (e) => {
                switch(e.key) {
                    case 'ArrowLeft':
                    case 'a':
                        this.moveLeft();
                        break;
                    case 'ArrowRight':
                    case 'd':
                        this.moveRight();
                        break;
                    case 'ArrowDown':
                    case 's':
                        this.moveDown();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.rotate();
                        break;
                    case 'Escape':
                        stopCurrentGame();
                        break;
                }
            };
            document.addEventListener('keydown', this.keyHandler);
        }

        draw() {
            // 清空画布
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 绘制网格
            this.ctx.strokeStyle = '#0f0';
            this.ctx.lineWidth = 0.5;
            this.ctx.globalAlpha = 0.1;
            for (let x = 0; x <= this.cols; x++) {
                this.ctx.beginPath();
                this.ctx.moveTo(x * this.blockSize, 0);
                this.ctx.lineTo(x * this.blockSize, this.canvas.height);
                this.ctx.stroke();
            }
            for (let y = 0; y <= this.rows; y++) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y * this.blockSize);
                this.ctx.lineTo(this.cols * this.blockSize, y * this.blockSize);
                this.ctx.stroke();
            }
            this.ctx.globalAlpha = 1;

            // 绘制已落下的方块
            this.ctx.fillStyle = '#0f0';
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    if (this.grid[y][x]) {
                        this.ctx.fillRect(
                            x * this.blockSize + 1,
                            y * this.blockSize + 1,
                            this.blockSize - 2,
                            this.blockSize - 2
                        );
                    }
                }
            }

            // 绘制当前方块
            const shape = this.currentPiece.shape;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.blockSize + 1,
                            (this.currentPiece.y + y) * this.blockSize + 1,
                            this.blockSize - 2,
                            this.blockSize - 2
                        );
                    }
                }
            }

            // 绘制下一个方块预览
            this.ctx.fillStyle = '#0f0';
            this.ctx.font = '16px Consolas';
            this.ctx.fillText('Next:', this.cols * this.blockSize + 10, 30);
            
            const nextShape = this.nextPiece.shape;
            for (let y = 0; y < nextShape.length; y++) {
                for (let x = 0; x < nextShape[y].length; x++) {
                    if (nextShape[y][x]) {
                        this.ctx.fillRect(
                            (this.cols + 1 + x) * this.blockSize + 1,
                            (2 + y) * this.blockSize + 1,
                            this.blockSize - 2,
                            this.blockSize - 2
                        );
                    }
                }
            }

            // 绘制分数
            this.ctx.fillText(`Score: ${this.score}`, this.cols * this.blockSize + 10, 100);
        }

        update(time = 0) {
            const deltaTime = time - this.lastTime;
            this.lastTime = time;
            this.dropCounter += deltaTime;
            
            if (this.dropCounter > this.dropInterval) {
                this.moveDown();
                this.dropCounter = 0;
            }
        }

        start() {
            this.canvas.style.display = 'block';
            this.reset();
            const gameLoop = (time) => {
                this.update(time);
                this.draw();
                this.gameLoop = requestAnimationFrame(gameLoop);
            };
            gameLoop();
        }

        stop() {
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
            document.removeEventListener('keydown', this.keyHandler);
            this.canvas.style.display = 'none';
            output.innerHTML += `\nGame Over! Score: ${this.score}\n`;
        }
    }
    // Breakout Game Implementation
    class BreakoutGame {
        constructor(canvas, ctx) {
            this.canvas = canvas;
            this.ctx = ctx;
            
            canvas.width = 800;
            canvas.height = 500;
            
            this.reset();
            this.bindControls();
        }

        reset() {
            // 球拍设置
            this.paddle = {
                width: 100,
                height: 10,
                x: 0,
                y: this.canvas.height - 30,
                speed: 8,
                dx: 0
            };
            this.paddle.x = (this.canvas.width - this.paddle.width) / 2;

            // 球设置
            this.ball = {
                x: this.canvas.width / 2,
                y: this.canvas.height - 50,
                radius: 6,
                speed: 4,
                dx: 4,
                dy: -4
            };

            // 砖块设置
            this.brickRowCount = 5;
            this.brickColumnCount = 9;
            this.brickWidth = 80;
            this.brickHeight = 20;
            this.brickPadding = 10;
            this.brickOffsetTop = 30;
            this.brickOffsetLeft = 25;

            // 初始化砖块
            this.bricks = [];
            for(let c = 0; c < this.brickColumnCount; c++) {
                this.bricks[c] = [];
                for(let r = 0; r < this.brickRowCount; r++) {
                    this.bricks[c][r] = { 
                        x: 0, 
                        y: 0, 
                        status: 1,
                        hits: Math.floor(Math.random() * 2) + 1 // 随机1-2次击打
                    };
                }
            }

            this.score = 0;
            this.gameLoop = null;
            this.gameStarted = false;
        }

        bindControls() {
            this.keyState = {};
            
            this.keyDownHandler = (e) => {
                if(['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
                    e.preventDefault();
                }
                this.keyState[e.key] = true;
                
                if (!this.gameStarted && 
                    ['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
                    this.gameStarted = true;
                }

                if (e.key === 'Escape') {
                    stopCurrentGame();
                }
            };

            this.keyUpHandler = (e) => {
                this.keyState[e.key] = false;
            };

            document.addEventListener('keydown', this.keyDownHandler);
            document.addEventListener('keyup', this.keyUpHandler);
        }

        movePaddle() {
            if ((this.keyState['ArrowLeft'] || this.keyState['a']) && 
                this.paddle.x > 0) {
                this.paddle.dx = -this.paddle.speed;
            }
            else if ((this.keyState['ArrowRight'] || this.keyState['d']) && 
                this.paddle.x < this.canvas.width - this.paddle.width) {
                this.paddle.dx = this.paddle.speed;
            }
            else {
                this.paddle.dx = 0;
            }

            this.paddle.x += this.paddle.dx;

            if (this.paddle.x < 0) {
                this.paddle.x = 0;
            }
            if (this.paddle.x + this.paddle.width > this.canvas.width) {
                this.paddle.x = this.canvas.width - this.paddle.width;
            }
        }

        moveBall() {
            if (!this.gameStarted) {
                this.ball.x = this.paddle.x + this.paddle.width / 2;
                this.ball.y = this.canvas.height - 50;
                return;
            }

            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;

            // 墙壁碰撞检测
            if (this.ball.x + this.ball.radius > this.canvas.width || 
                this.ball.x - this.ball.radius < 0) {
                this.ball.dx = -this.ball.dx;
            }
            if (this.ball.y - this.ball.radius < 0) {
                this.ball.dy = -this.ball.dy;
            }

            // 游戏结束检测
            if (this.ball.y + this.ball.radius > this.canvas.height) {
                stopCurrentGame();
            }

            // 球拍碰撞检测
            if (this.ball.y + this.ball.radius > this.paddle.y && 
                this.ball.x > this.paddle.x && 
                this.ball.x < this.paddle.x + this.paddle.width) {
                
                let hitPoint = (this.ball.y - (this.paddle.y + this.paddle.height/2)) / 
                              (this.paddle.height/2);
                
                let angle = hitPoint * Math.PI/3;
                let speed = Math.sqrt(this.ball.dx * this.ball.dx + 
                                    this.ball.dy * this.ball.dy);
                
                this.ball.dx = speed * Math.sin(angle);
                this.ball.dy = -speed * Math.cos(angle);
            }
        }
        collisionDetection() {
            for(let c = 0; c < this.brickColumnCount; c++) {
                for(let r = 0; r < this.brickRowCount; r++) {
                    let brick = this.bricks[c][r];
                    if(brick.status >= 1) {
                        if(this.ball.x > brick.x && 
                           this.ball.x < brick.x + this.brickWidth &&
                           this.ball.y > brick.y && 
                           this.ball.y < brick.y + this.brickHeight) {
                            
                            this.ball.dy = -this.ball.dy;
                            brick.hits--;
                            if(brick.hits <= 0) {
                                brick.status = 0;
                                this.score += 10;
                            }
                            
                            // 检查是否获胜
                            if(this.score >= this.brickRowCount * this.brickColumnCount * 10) {
                                output.innerHTML += '\nCongratulations! You won!\n';
                                stopCurrentGame();
                            }
                        }
                    }
                }
            }
        }

        drawBall() {
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2);
            this.ctx.fillStyle = "#0f0";
            this.ctx.fill();
            this.ctx.closePath();
        }

        drawPaddle() {
            this.ctx.beginPath();
            this.ctx.rect(this.paddle.x, this.paddle.y, 
                         this.paddle.width, this.paddle.height);
            this.ctx.fillStyle = "#0f0";
            this.ctx.fill();
            this.ctx.closePath();
        }

        drawBricks() {
            for(let c = 0; c < this.brickColumnCount; c++) {
                for(let r = 0; r < this.brickRowCount; r++) {
                    if(this.bricks[c][r].status >= 1) {
                        let brickX = (c * (this.brickWidth + this.brickPadding)) + 
                                    this.brickOffsetLeft;
                        let brickY = (r * (this.brickHeight + this.brickPadding)) + 
                                    this.brickOffsetTop;
                        
                        this.bricks[c][r].x = brickX;
                        this.bricks[c][r].y = brickY;
                        
                        this.ctx.beginPath();
                        this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                        let alpha = this.bricks[c][r].hits === 2 ? 1 : 0.5;
                        this.ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                        this.ctx.fill();
                        this.ctx.closePath();
                    }
                }
            }
        }

        drawScore() {
            this.ctx.font = "16px Consolas";
            this.ctx.fillStyle = "#0f0";
            this.ctx.fillText("Score: "+this.score, 8, 20);
        }

        drawStartMessage() {
            if (!this.gameStarted) {
                this.ctx.font = "16px Consolas";
                this.ctx.fillStyle = "#0f0";
                this.ctx.fillText("Press Left/Right Arrow or A/D to start", 
                                this.canvas.width/2 - 150, this.canvas.height/2);
            }
        }

        draw() {
            // 清空画布
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawBricks();
            this.drawBall();
            this.drawPaddle();
            this.drawScore();
            this.drawStartMessage();
        }

        update() {
            this.movePaddle();
            this.moveBall();
            this.collisionDetection();
        }

        start() {
            this.canvas.style.display = 'block';
            this.reset();
            const gameLoop = () => {
                this.update();
                this.draw();
                this.gameLoop = requestAnimationFrame(gameLoop);
            };
            gameLoop();
        }

        stop() {
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
            document.removeEventListener('keydown', this.keyDownHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
            this.canvas.style.display = 'none';
            output.innerHTML += `\nGame Over! Score: ${this.score}\n`;
        }
    }
    // Pong Game Implementation
    class PongGame {
        constructor(canvas, ctx) {
            this.canvas = canvas;
            this.ctx = ctx;
            
            canvas.width = 800;
            canvas.height = 500;
            
            this.reset();
            this.bindControls();
        }

        reset() {
            // 球拍设置
            this.paddleHeight = 100;
            this.paddleWidth = 10;
            this.paddleSpeed = 5;
            
            this.leftPaddle = {
                x: 50,
                y: this.canvas.height/2 - this.paddleHeight/2,
                dy: 0,
                score: 0
            };
            
            this.rightPaddle = {
                x: this.canvas.width - 50 - this.paddleWidth,
                y: this.canvas.height/2 - this.paddleHeight/2,
                dy: 0,
                score: 0
            };

            // 球设置
            this.ball = {
                x: this.canvas.width/2,
                y: this.canvas.height/2,
                radius: 6,
                speed: 5,
                dx: 5,
                dy: 0
            };

            this.gameLoop = null;
            this.gameStarted = false;
        }

        bindControls() {
            this.keyState = {};
            
            this.keyDownHandler = (e) => {
                if(['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                }
                this.keyState[e.key] = true;
                
                if (!this.gameStarted) {
                    this.gameStarted = true;
                    this.ball.dx = this.ball.speed * (Math.random() < 0.5 ? 1 : -1);
                    this.ball.dy = this.ball.speed * (Math.random() * 2 - 1);
                }

                if (e.key === 'Escape') {
                    stopCurrentGame();
                }
            };

            this.keyUpHandler = (e) => {
                this.keyState[e.key] = false;
            };

            document.addEventListener('keydown', this.keyDownHandler);
            document.addEventListener('keyup', this.keyUpHandler);
        }

        movePaddles() {
            // 左边球拍 (W/S)
            if (this.keyState['w'] && this.leftPaddle.y > 0) {
                this.leftPaddle.y -= this.paddleSpeed;
            }
            if (this.keyState['s'] && 
                this.leftPaddle.y < this.canvas.height - this.paddleHeight) {
                this.leftPaddle.y += this.paddleSpeed;
            }

            // 右边球拍 (↑/↓)
            if (this.keyState['ArrowUp'] && this.rightPaddle.y > 0) {
                this.rightPaddle.y -= this.paddleSpeed;
            }
            if (this.keyState['ArrowDown'] && 
                this.rightPaddle.y < this.canvas.height - this.paddleHeight) {
                this.rightPaddle.y += this.paddleSpeed;
            }
        }

        moveBall() {
            if (!this.gameStarted) {
                return;
            }

            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;

            // 上下墙壁碰撞
            if (this.ball.y + this.ball.radius > this.canvas.height || 
                this.ball.y - this.ball.radius < 0) {
                this.ball.dy = -this.ball.dy;
            }

            // 左右球拍碰撞
            [this.leftPaddle, this.rightPaddle].forEach(paddle => {
                if (this.ball.x + this.ball.radius > paddle.x && 
                    this.ball.x - this.ball.radius < paddle.x + this.paddleWidth &&
                    this.ball.y > paddle.y && 
                    this.ball.y < paddle.y + this.paddleHeight) {
                    
                    let hitPos = (this.ball.y - (paddle.y + this.paddleHeight/2)) / 
                                (this.paddleHeight/2);
                    let angle = hitPos * Math.PI/3;
                    
                    this.ball.dx = -this.ball.dx;
                    this.ball.dy = this.ball.speed * Math.sin(angle);
                    
                    this.ball.speed *= 1.05;
                    this.ball.speed = Math.min(this.ball.speed, 15);
                }
            });

            // 得分判定
            if (this.ball.x + this.ball.radius > this.canvas.width) {
                this.leftPaddle.score++;
                this.resetBall();
            }
            else if (this.ball.x - this.ball.radius < 0) {
                this.rightPaddle.score++;
                this.resetBall();
            }
        }
        resetBall() {
            this.ball.x = this.canvas.width/2;
            this.ball.y = this.canvas.height/2;
            this.ball.speed = 5;
            this.gameStarted = false;
            
            if (this.leftPaddle.score >= 11 || this.rightPaddle.score >= 11) {
                stopCurrentGame();
            }
        }

        drawPaddle(paddle) {
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(paddle.x, paddle.y, this.paddleWidth, this.paddleHeight);
        }

        drawBall() {
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#0f0';
            this.ctx.fill();
            this.ctx.closePath();
        }

        drawNet() {
            this.ctx.setLineDash([7, 15]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width/2, 0);
            this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
            this.ctx.strokeStyle = '#0f0';
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        drawScore() {
            this.ctx.font = '32px Consolas';
            this.ctx.fillStyle = '#0f0';
            
            this.ctx.textAlign = 'right';
            this.ctx.fillText(this.leftPaddle.score, this.canvas.width/2 - 20, 50);
            
            this.ctx.textAlign = 'left';
            this.ctx.fillText(this.rightPaddle.score, this.canvas.width/2 + 20, 50);
        }

        drawStartMessage() {
            if (!this.gameStarted) {
                this.ctx.font = '16px Consolas';
                this.ctx.fillStyle = '#0f0';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    'Press any control key to start',
                    this.canvas.width/2,
                    this.canvas.height/2 + 40
                );
                this.ctx.fillText(
                    'Left paddle: W/S  Right paddle: ↑/↓',
                    this.canvas.width/2,
                    this.canvas.height/2 + 70
                );
            }
        }

        draw() {
            // 清空画布
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawNet();
            this.drawPaddle(this.leftPaddle);
            this.drawPaddle(this.rightPaddle);
            this.drawBall();
            this.drawScore();
            this.drawStartMessage();
        }

        update() {
            this.movePaddles();
            this.moveBall();
        }

        start() {
            this.canvas.style.display = 'block';
            this.reset();
            const gameLoop = () => {
                this.update();
                this.draw();
                this.gameLoop = requestAnimationFrame(gameLoop);
            };
            gameLoop();
        }

        stop() {
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
            document.removeEventListener('keydown', this.keyDownHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
            this.canvas.style.display = 'none';
            
            const winner = this.leftPaddle.score > this.rightPaddle.score ? 'Left' : 'Right';
            output.innerHTML += `\nGame Over! ${winner} player wins!\n` +
                              `Score: ${this.leftPaddle.score} - ${this.rightPaddle.score}\n`;
        }
    }

    // 终端初始化
    input.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                const fullCommand = input.value.trim().toLowerCase();
                if (fullCommand) {
                    // 添加历史记录
                    commandHistory.unshift(fullCommand);
                    // 限制历史记录长度
                    if (commandHistory.length > 50) commandHistory.pop();
                    historyIndex = -1;
                }
                
                output.innerHTML += `\n> ${input.value}\n`;
                
                // 处理命令
                if (fullCommand in commands) {
                    const result = typeof commands[fullCommand] === 'function' 
                        ? commands[fullCommand]() 
                        : commands[fullCommand];
                    if (result) output.innerHTML += result + '\n';
                } else {
                    // 如果不是完整命令，则尝试分割参数
                    const args = fullCommand.split(' ');
                    const cmd = args.shift();
                    
                    if (cmd in commands) {
                        const result = typeof commands[cmd] === 'function' 
                            ? commands[cmd](args) 
                            : commands[cmd];
                        if (result) output.innerHTML += result + '\n';
                    } else {
                        output.innerHTML += `Command not found: ${fullCommand}\n`;
                    }
                }
                
                input.value = '';
                output.scrollTop = output.scrollHeight;
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (historyIndex === -1) {
                    tempInput = input.value;
                }
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex];
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (historyIndex > -1) {
                    historyIndex--;
                    input.value = historyIndex === -1 ? tempInput : commandHistory[historyIndex];
                }
                break;
                
            case 'Tab':
                e.preventDefault();
                const currentInput = input.value.trim();
                const [command, ...args] = currentInput.split(' ');
                
                // 获取所有命令
                const allCommands = Object.keys(commands);
                
                // 找到匹配的命令
                const matches = allCommands.filter(cmd => 
                    cmd.startsWith(command.toLowerCase())
                );
                
                if (matches.length === 1) {
                    // 如果只有一个匹配项，直接补全
                    input.value = matches[0] + (args.length ? ' ' + args.join(' ') : '');
                } else if (matches.length > 1) {
                    // 如果有多个匹配项，显示所有可能的补全
                    output.innerHTML += '\n' + matches.join('  ') + '\n> ' + currentInput;
                }
                break;
        }
    });

    // 初始显示帮助信息
    output.innerHTML = 'Welcome to Lave\'s Terminal!\nType "help" for available commands.\n';

    // 修改 ESC 键监听器
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // 停止当前游戏
            if (currentGame) {
                stopCurrentGame();
            }
            // 停止甜甜圈动画
            if (window.donutManager) {
                window.donutManager.stop();
            }
            // 停止爱心动画
            if (window.heartManager) {
                window.heartManager.stop();
            }
        }
    });

    // 确保所有效果都已正确初始化
    if (!window.matrixEffect) {
        window.matrixEffect = new MatrixEffect();
    }
    if (!window.codeRain) {
        window.codeRain = new CodeRain();
    }
    if (!window.soundManager) {
        window.soundManager = new SoundManager();
    }
});