// ==================== AI 引擎（来自一叶孤舟） ====================
(function() {
    var AI = function (map, depth, my, x, y ,arg){
        return init(map, depth, my, x, y ,arg);
    }
    var count=0, depth , arg;
    
    var init = function(map, _depth, my, x, y, _arg){
        depth = _depth;
        arg = _arg;
        var initTime = new Date().getTime();
        var results = getAlphaBeta(-999999 ,999999, depth, map, my, x, y);
        var runTime= new Date().getTime() - initTime;
        console.log('等级：'+arg.rank
                    +'\r搜索分支：'+ count +'个'
                    +'\r最佳着法：X'+results.x+' Y'+results.y
                    +'\r最佳着法评估：'+results.value+'分'
                    +'\r搜索用时：'+runTime+'毫秒'
        );
        return { x : results.x, y : results.y }
    }
    
    var getAlphaBeta = function (A, B, _depth, map , my, x , y) {
        if (_depth == 0) {
            count ++;
            return {"value":evaluate(map, my, x, y)};
        }
        var moves = getMoves(map, x, y);
        for (var i=0; i < moves.length; i++) {
            var move= moves[i];
            var y=move.y;
            var x=move.x;
            map [y] [x] = my;
            var val = - getAlphaBeta(-B, -A, _depth - 1, map , -my, x , y).value; 
            map [y] [x] = 0;
            if (val >= B) { 
                return { "x":x, "y":y, "value":B }; 
            }
            if (val > A) {
                A = val;
                if ( depth == _depth ) var rootKey={ "x":x, "y":y, "value":A };
            }
        } 
        if ( depth == _depth ) {
            if (!rootKey){
                return false;
            }else{
                return rootKey;
            }
        }
        return { "x":x, "y":y, "value":val }; 
    }

    var getMoves = function (map, x, y){
        var pur = arg.pur;
        var moves = [];
        var minX = x - pur;
        if (minX < 0) minX = 0;
        var maxX = x + pur;
        if ( maxX > 14 ) maxX = 14;
        var minY = y - pur;
        if (minY < 0) minY = 0;
        var maxY = y + pur;
        if ( maxY > 14 ) maxY = 14;
        for (var i=minY; i<=maxY; i++){
            for (var n=minX; n<=maxX; n++){
                var m = map[i][n];
                if (m===0) {
                    moves.push({ x:n, y:i })
                }
            }
        }
        return moves;
    }

    var evaluate = function ( map, my, x, y ){
        var val = getValue( map, my, x, y );
        val += getValue( map, -my, x, y );
        return  val * -my;
    }

    var getValue = function ( map, my, x, y ){
        var val = Math.floor(Math.random() * arg.random);
        var pur = arg.pur;
        var len = 15;
        var value ={
            11:1 ,
            12:2 ,
            21:10 ,
            22:20 ,
            31:30 ,
            32:50 ,
            41:60 ,
            42:100,
            50:88888,
            51:88888,
            52:88888
        }
        //左方向
        var A = {};
        A.n = 1;
        A.v = 0;
        for (var i = 1; i <= len; i++){
            var _x = x - i;
            if (!dis( _x , y, my)) break;
        }
        //右方向
        for (var i = 1; i < len; i++){
            var _x = x + i;
            if (!dis( _x, y, my) ) break;
        }
        if ( A.n > 5 ) A.n = 5 ;
        val += value [A.n * 10 + A.v] || 0;
        
        //上
        A.n = 1;
        A.v = 0;
        for (var i = 1; i < len; i++){
            var _y = y - i;
            if (!dis(x, _y ,my)) break;
        }
        //下
        for (var i = 1; i < len; i++){
            var _y = y + i;
            if (!dis(x, _y ,my)) break;
        }
        if ( A.n > 5 ) A.n = 5 ;
        val += value [A.n * 10 + A.v] || 0;

        //左上
        A.n = 1;
        A.v = 0;
        for (var i = 1; i < len; i++){
            var _x = x - i;
            var _y = y - i;
            if (!dis(_x, _y ,my)) break;
        }
        //右下
        for (var i = 1; i < len; i++){
            var _x = x + i;
            var _y = y + i;
            if (!dis(_x, _y ,my)) break;
        }
        if ( A.n > 5 ) A.n = 5 ;
        val += value [A.n * 10 + A.v] || 0;
        
        //右上
        A.n = 1;
        A.v = 0;
        for (var i = 1; i < len; i++){
            var _x = x + i;
            var _y = y - i;
            if (!dis(_x, _y ,my)) break;
        }
        //左下
        for (var i = 1; i < len; i++){
            var _x = x - i;
            var _y = y + i;
            if (!dis(_x, _y ,my)) break;
        }
        if ( A.n > 5 ) A.n = 5 ;
        val += value [A.n * 10 + A.v] || 0;
        return  val;
        
        function dis(x, y, my){
            if (x < 0 || x >14 || y < 0 || y >14){
                return false;
            }
            var m = map[ y ][ x ];
            if ( m == my){
                A.n ++;
                return true    
            }else {
                if( m === 0) A.v++;
                return false;
            }
        }
    }
    window.AI = AI;
})();

// ==================== 配置 ====================
const CONFIG = {
    boardSize: 15,
    starPoints: [[3,3],[3,7],[3,11],[7,3],[7,7],[7,11],[11,3],[11,7],[11,11]],
    aiDepth: 3,
    aiPur: 4,
    aiRandom: 5
};

// ==================== 游戏状态 ====================
const gameState = {
    board: [],
    currentPlayer: 1,
    gameOver: false,
    history: [],
    isAI: false,
    aiThinking: false
};

// ==================== DOM 引用 ====================
const dom = {
    canvas: document.getElementById('chessboard'),
    ctx: null,
    restartBtn: document.getElementById('restartBtn'),
    undoBtn: document.getElementById('undoBtn'),
    statusText: document.getElementById('statusText'),
    modePvp: document.getElementById('modePvp'),
    modePve: document.getElementById('modePve')
};

// ==================== 工具函数 ====================
function getCanvasSize() {
    return dom.canvas.parentElement.clientWidth;
}

// ==================== 初始化 ====================
function init() {
    dom.ctx = dom.canvas.getContext('2d');
    resizeCanvas();
    initBoardData();
    bindEvents();
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawBoard();
        redrawAllPieces();
    });
}

function resizeCanvas() {
    const size = getCanvasSize();
    dom.canvas.width = size;
    dom.canvas.height = size;
}

function initBoardData() {
    gameState.board = Array.from({ length: CONFIG.boardSize }, () =>
        Array(CONFIG.boardSize).fill(0)
    );
    gameState.currentPlayer = 1;
    gameState.gameOver = false;
    gameState.history = [];
    gameState.aiThinking = false;
    updateStatusText();
    drawBoard();
}

function updateStatusText() {
    if (gameState.gameOver) return;
    if (gameState.aiThinking) {
        dom.statusText.textContent = 'AI思考中...';
        return;
    }
    if (gameState.isAI) {
        dom.statusText.textContent = gameState.currentPlayer === 1 ? '你的回合' : 'AI思考中...';
        if (gameState.currentPlayer === -1) {
            dom.statusText.textContent = 'AI思考中...';
        }
    } else {
        dom.statusText.textContent = gameState.currentPlayer === 1 ? '黑方回合' : '白方回合';
    }
}

// ==================== 绘图 ====================
function drawBoard() {
    const ctx = dom.ctx;
    const size = dom.canvas.width;
    const spacing = size / (CONFIG.boardSize - 1);

    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = Math.max(1, size / 340);
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = Math.max(2, size / 240);

    for (let i = 0; i < CONFIG.boardSize; i++) {
        const pos = i * spacing;
        ctx.beginPath();
        ctx.moveTo(spacing, pos);
        ctx.lineTo(size - spacing, pos);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos, spacing);
        ctx.lineTo(pos, size - spacing);
        ctx.stroke();
    }

    ctx.fillStyle = '#00ff41';
    ctx.shadowBlur = 0;
    const starR = Math.max(2, size / 190);
    CONFIG.starPoints.forEach(([r, c]) => {
        ctx.beginPath();
        ctx.arc(c * spacing, r * spacing, starR, 0, Math.PI * 2);
        ctx.fill();
    });
}

function redrawAllPieces() {
    const size = dom.canvas.width;
    const spacing = size / (CONFIG.boardSize - 1);
    for (let r = 0; r < CONFIG.boardSize; r++) {
        for (let c = 0; c < CONFIG.boardSize; c++) {
            if (gameState.board[r][c] !== 0) {
                drawPiece(c * spacing, r * spacing, gameState.board[r][c]);
            }
        }
    }
}

function drawPiece(x, y, player) {
    const ctx = dom.ctx;
    const size = dom.canvas.width;
    const spacing = size / (CONFIG.boardSize - 1);
    const radius = spacing * 0.375;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    const gradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, radius * 0.2,
        x, y, radius
    );

    if (player === 1) {
        gradient.addColorStop(0, '#777');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#bbb');
    }

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#003311';
    ctx.lineWidth = Math.max(0.5, radius / 18);
    ctx.stroke();
}

// ==================== 游戏逻辑 ====================
function handleClick(e) {
    if (gameState.gameOver || gameState.aiThinking) return;

    const rect = dom.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const size = dom.canvas.width;
    const spacing = size / (CONFIG.boardSize - 1);

    const col = Math.round(mouseX / spacing);
    const row = Math.round(mouseY / spacing);

    if (row < 0 || row >= CONFIG.boardSize || col < 0 || col >= CONFIG.boardSize) return;
    if (gameState.board[row][col] !== 0) return;

    if (gameState.isAI && gameState.currentPlayer !== 1) return;

    placePiece(row, col);
}

function placePiece(row, col) {
    const player = gameState.currentPlayer;
    gameState.board[row][col] = player;
    gameState.history.push({ row, col, player });

    const size = dom.canvas.width;
    const spacing = size / (CONFIG.boardSize - 1);
    drawPiece(col * spacing, row * spacing, player);

    if (checkWin(row, col, player)) {
        const winner = player === 1 ? '黑方' : '白方';
        dom.statusText.textContent = `${winner}获胜！`;
        gameState.gameOver = true;
        return;
    }

    gameState.currentPlayer = player === 1 ? -1 : 1;
    updateStatusText();

    if (gameState.isAI && gameState.currentPlayer === -1 && !gameState.gameOver) {
        triggerAI();
    }
}

function triggerAI() {
    gameState.aiThinking = true;
    updateStatusText();
    
    setTimeout(() => {
        const result = getAIMove();
        if (result === false) {
            gameState.aiThinking = false;
            dom.statusText.textContent = 'AI无棋可走，平局';
            gameState.gameOver = true;
            return;
        }
        const { x, y } = result;
        placePiece(y, x);
        gameState.aiThinking = false;
        updateStatusText();
    }, 50);
}

function getAIMove() {
    const aiMap = gameState.board.map(row => [...row]);
    let lastMove = gameState.history[gameState.history.length - 1];
    let refX, refY;
    if (lastMove) {
        refX = lastMove.col;
        refY = lastMove.row;
    } else {
        refX = 7;
        refY = 7;
    }

    const arg = {
        pur: CONFIG.aiPur,
        random: CONFIG.aiRandom,
        rank: CONFIG.aiDepth
    };

    const result = window.AI(aiMap, CONFIG.aiDepth, -1, refX, refY, arg);
    if (result === false) return false;
    return { x: result.x, y: result.y };
}

function checkWin(row, col, player) {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    const board = gameState.board;
    for (const [dx, dy] of directions) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
            const r = row + dx * i, c = col + dy * i;
            if (r >= 0 && r < CONFIG.boardSize && c >= 0 && c < CONFIG.boardSize && board[r][c] === player) count++;
            else break;
        }
        for (let i = 1; i < 5; i++) {
            const r = row - dx * i, c = col - dy * i;
            if (r >= 0 && r < CONFIG.boardSize && c >= 0 && c < CONFIG.boardSize && board[r][c] === player) count++;
            else break;
        }
        if (count >= 5) return true;
    }
    return false;
}

function undoMove() {
    if (gameState.history.length === 0 || gameState.gameOver || gameState.aiThinking) return;
    
    if (gameState.isAI) {
        if (gameState.history.length >= 2) {
            const lastAI = gameState.history.pop();
            const lastHuman = gameState.history.pop();
            gameState.board[lastAI.row][lastAI.col] = 0;
            gameState.board[lastHuman.row][lastHuman.col] = 0;
            gameState.currentPlayer = 1;
        } else {
            const last = gameState.history.pop();
            gameState.board[last.row][last.col] = 0;
            gameState.currentPlayer = 1;
        }
    } else {
        const last = gameState.history.pop();
        gameState.board[last.row][last.col] = 0;
        gameState.currentPlayer = last.player === 1 ? -1 : 1;
    }
    
    drawBoard();
    redrawAllPieces();
    gameState.gameOver = false;
    updateStatusText();
}

function resetGame() {
    resizeCanvas();
    drawBoard();
    initBoardData();
}

function setMode(isAI) {
    gameState.isAI = isAI;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (isAI) {
        dom.modePve.classList.add('active');
    } else {
        dom.modePvp.classList.add('active');
    }
    resetGame();
}

function bindEvents() {
    dom.canvas.addEventListener('click', handleClick);
    dom.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const clickEvent = new MouseEvent('click', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        dom.canvas.dispatchEvent(clickEvent);
    }, { passive: false });

    dom.restartBtn.addEventListener('click', resetGame);
    dom.undoBtn.addEventListener('click', undoMove);
    dom.modePvp.addEventListener('click', () => setMode(false));
    dom.modePve.addEventListener('click', () => setMode(true));
}

// ==================== 启动 ====================
init();