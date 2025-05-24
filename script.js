document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let gameMode = 'pvp'; // 'pvp' or 'pvai'
    let scores = { X: 0, O: 0 };
    
    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-btn');
    const pvpButton = document.getElementById('pvp-btn');
    const pvaiButton = document.getElementById('pvai-btn');
    const resultModal = document.getElementById('result-modal');
    const resultMessage = document.getElementById('result-message');
    const playAgainButton = document.getElementById('play-again-btn');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize the game
    init();
    
    function init() {
        // Event listeners
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        
        resetButton.addEventListener('click', resetGame);
        pvpButton.addEventListener('click', () => switchMode('pvp'));
        pvaiButton.addEventListener('click', () => switchMode('pvai'));
        playAgainButton.addEventListener('click', resetGame);
        themeToggle.addEventListener('click', toggleTheme);
        
        updateStatus();
    }
    
    function handleCellClick(e) {
        const cell = e.target;
        const cellIndex = parseInt(cell.getAttribute('data-index'));
        
        // If cell already used or game not active, ignore
        if (board[cellIndex] !== '' || !gameActive) return;
        
        // Make the move
        makeMove(cell, cellIndex);
        
        // If in PvAI mode and it's AI's turn, make AI move
        if (gameMode === 'pvai' && gameActive && currentPlayer === 'O') {
            setTimeout(makeAIMove, 500); // Small delay for better UX
        }
    }
    
    function makeMove(cell, cellIndex) {
        // Update board and UI
        board[cellIndex] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Check for win or draw
        if (checkWin()) {
            handleWin();
        } else if (checkDraw()) {
            handleDraw();
        } else {
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatus();
        }
    }
    
    function makeAIMove() {
        if (!gameActive) return;
        
        // Simple AI logic - random move
        let availableCells = [];
        board.forEach((cell, index) => {
            if (cell === '') availableCells.push(index);
        });
        
        if (availableCells.length > 0) {
            // Try to win if possible
            for (let condition of winningConditions) {
                let [a, b, c] = condition;
                if (board[a] === 'O' && board[b] === 'O' && board[c] === '') {
                    return makeMove(cells[c], c);
                }
                if (board[a] === 'O' && board[c] === 'O' && board[b] === '') {
                    return makeMove(cells[b], b);
                }
                if (board[b] === 'O' && board[c] === 'O' && board[a] === '') {
                    return makeMove(cells[a], a);
                }
            }
            
            // Block player from winning
            for (let condition of winningConditions) {
                let [a, b, c] = condition;
                if (board[a] === 'X' && board[b] === 'X' && board[c] === '') {
                    return makeMove(cells[c], c);
                }
                if (board[a] === 'X' && board[c] === 'X' && board[b] === '') {
                    return makeMove(cells[b], b);
                }
                if (board[b] === 'X' && board[c] === 'X' && board[a] === '') {
                    return makeMove(cells[a], a);
                }
            }
            
            // Take center if available
            if (board[4] === '') {
                return makeMove(cells[4], 4);
            }
            
            // Take a corner if available
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(index => board[index] === '');
            if (availableCorners.length > 0) {
                const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                return makeMove(cells[randomCorner], randomCorner);
            }
            
            // Random move as fallback
            const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
            makeMove(cells[randomIndex], randomIndex);
        }
    }
    
    function checkWin() {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return board[index] === currentPlayer;
            });
        });
    }
    
    function checkDraw() {
        return board.every(cell => cell !== '');
    }
    
    function handleWin() {
        gameActive = false;
        scores[currentPlayer]++;
        updateScores();
        
        resultMessage.textContent = `Player ${currentPlayer} wins!`;
        resultModal.classList.add('active');
    }
    
    function handleDraw() {
        gameActive = false;
        
        resultMessage.textContent = `Game ended in a draw!`;
        resultModal.classList.add('active');
    }
    
    function resetGame() {
        // Reset board
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        
        // Reset UI
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        
        // Close modal if open
        resultModal.classList.remove('active');
        
        updateStatus();
    }
    
    function updateStatus() {
        statusDisplay.textContent = `${gameMode === 'pvai' && currentPlayer === 'O' ? 'AI' : 'Player'} ${currentPlayer}'s turn`;
    }
    
    function updateScores() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
    }
    
    function switchMode(mode) {
        gameMode = mode;
        
        // Update active button
        if (mode === 'pvp') {
            pvpButton.classList.add('active');
            pvaiButton.classList.remove('active');
        } else {
            pvpButton.classList.remove('active');
            pvaiButton.classList.add('active');
        }
        
        // Reset game when switching modes
        resetGame();
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const icon = themeToggle.querySelector('i');
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
});