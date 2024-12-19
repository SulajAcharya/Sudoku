document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("container");
    const toggleButton = document.getElementById("toggleButton");
    const gameContainer = document.getElementById("gameContainer");
    let gridSize = 9; // Start with 9x9 grid
    let puzzle = generateSudoku(gridSize);
    let solvedPuzzle = JSON.parse(JSON.stringify(puzzle));

    // Event listener for toggle button
    toggleButton.addEventListener("click", function () {
        gridSize = gridSize === 9 ? 16 : 9;
        puzzle = generateSudoku(gridSize);
        solvedPuzzle = JSON.parse(JSON.stringify(puzzle));
        createSudokuGrid(puzzle);
        toggleButton.textContent = gridSize === 16 ? "Switch to 9x9" : "Switch to 16x16";

        if (gridSize === 9) {
            gameContainer.style.flexDirection = 'row-reverse';
        } else {
            gameContainer.style.flexDirection = 'row';
        }

        updateRules(gridSize); // Update rules dynamically
    });

    // Function to generate a random Sudoku grid with some numbers filled in
    function generateSudoku(gridSize) {
        const board = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
        fillBoard(board, gridSize);
        createUnsolvedPuzzle(board, gridSize); // Make it unsolved by removing random values
        return board;
    }

    // Function to solve and fill the Sudoku board
    function fillBoard(board, gridSize) {
        const nums = Array.from({ length: gridSize }, (_, i) => i + 1);

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        shuffle(nums);

        function solveHelper(board) {
            const emptyCell = findEmptyCell(board);
            if (!emptyCell) return true;

            const [row, col] = emptyCell;
            for (let num of nums) {
                if (isValidMove(board, row, col, num, gridSize)) {
                    board[row][col] = num;
                    if (solveHelper(board)) return true;
                    board[row][col] = 0;
                }
            }

            return false;
        }

        solveHelper(board);
    }

    // Function to make the board unsolved by removing some numbers
    function createUnsolvedPuzzle(board, gridSize) {
        const emptyCells = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] !== 0) {
                    emptyCells.push([row, col]);
                }
            }
        }
        // Remove about 40% of the filled cells randomly
        const cellsToRemove = Math.floor(emptyCells.length * 0.4);
        for (let i = 0; i < cellsToRemove; i++) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const [row, col] = emptyCells.splice(randomIndex, 1)[0];
            board[row][col] = 0;
        }
    }

    // Function to find the next empty cell
    function findEmptyCell(board) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    // Check if the number is valid in the given position
    function isValidMove(board, row, col, num, gridSize) {
        for (let i = 0; i < gridSize; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }

        const subgridSize = Math.sqrt(gridSize);
        const startRow = Math.floor(row / subgridSize) * subgridSize;
        const startCol = Math.floor(col / subgridSize) * subgridSize;
        for (let i = startRow; i < startRow + subgridSize; i++) {
            for (let j = startCol; j < startCol + subgridSize; j++) {
                if (board[i][j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Create the Sudoku grid
    function createSudokuGrid(puzzle) {
        container.innerHTML = ''; // Clear existing grid

        puzzle.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement('input');
                cellElement.classList.add('cell');
                cellElement.classList.add((rowIndex + colIndex) % 2 === 0 ? 'lightBackground' : 'darkBackground');
                
                // Apply thicker borders between the subgrids based on grid size
                if (gridSize === 9) {
                    if (rowIndex === 0) cellElement.classList.add('thicker-border-top');
                    if (colIndex === 0) cellElement.classList.add('thicker-border-left');
                    if ((rowIndex + 1) % 3 === 0) cellElement.classList.add('thicker-border-bottom');
                    if ((colIndex + 1) % 3 === 0) cellElement.classList.add('thicker-border-right');
                } else if (gridSize === 16) {
                    if (rowIndex === 0) cellElement.classList.add('thicker-border-top');
                    if (colIndex === 0) cellElement.classList.add('thicker-border-left');
                    if ((rowIndex + 1) % 4 === 0) cellElement.classList.add('thicker-border-bottom');
                    if ((colIndex + 1) % 4 === 0) cellElement.classList.add('thicker-border-right');
                }
                
                cellElement.type = 'text';
                cellElement.maxLength = 2;
                cellElement.value = cell !== 0 ? cell : '';
                cellElement.disabled = cell !== 0;  // Disable cells with predefined values

                // Allow only numbers between 1 and 9 (or 16 for 16x16 grid)
                cellElement.addEventListener('input', function (e) {
                    const value = e.target.value;
                
                    // Validate input based on the grid size
                    const isValidInput = gridSize === 9 ? /^[1-9]$/.test(value) : /^[1-9]$|^1[0-6]$/.test(value);
                    
                    
                    if (!isValidInput) {
                        e.target.value = '';  // Reset invalid input
                    }
                
                    checkWin(); // Check for win after every input
                });
                

                rowElement.appendChild(cellElement);
            });
            container.appendChild(rowElement);
        });
    }

    // Check if the player has won
    function checkWin() {
        const inputs = document.querySelectorAll(".cell");
        let isCorrect = true;
        let filledCells = 0;
    
        // Check each cell
        inputs.forEach((cell, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const value = parseInt(cell.value, 10);
    
            // Check if the value is correct and not empty
            if (cell.value !== "" && value !== solvedPuzzle[row][col]) {
                isCorrect = false;
            }
    
            if (cell.value !== "") {
                filledCells++;
            }
        });
    
        // Check if the puzzle is completely filled and if it's correct
        if (filledCells === gridSize * gridSize) {
            if (isCorrect) {
                alert("🎉 Congratulations! You solved the puzzle!");
            } else {
                alert("🚫 Incorrect solution, please try again!");
            }
        }
    }
    

    // Solve the puzzle
    function solvePuzzle() {
        let solved = JSON.parse(JSON.stringify(puzzle));
        fillBoard(solved, gridSize);  // Solve the puzzle
        createSudokuGrid(solved);  // Update the grid with the solved puzzle
    }

    // Reset the puzzle
    function resetPuzzle() {
        puzzle = generateSudoku(gridSize);  // Generate a new puzzle
        createSudokuGrid(puzzle);
    }

    function updateRules(gridSize) {
        const rulesElement = document.querySelector(".rules ul");
        const rules = rulesElement.querySelectorAll("li");
        
        if (gridSize === 9) {
            rules[0].textContent = "🎯 Your mission: Fill every row, column, and 3x3 box with numbers 1 to 9.";
            rules[1].textContent = "🚫 No duplicates! Each number must appear only once in a row, column, or 3x3 grid.";
        } else if (gridSize === 16) {
            rules[0].textContent = "🎯 Your mission: Fill every row, column, and 4x4 box with numbers 1 to 16.";
            rules[1].textContent = "🚫 No duplicates! Each number must appear only once in a row, column, or 4x4 grid.";
        }
    }

    // Event listeners for buttons
    document.getElementById("solveButton").addEventListener("click", solvePuzzle);
    document.getElementById("resetButton").addEventListener("click", resetPuzzle);

    createSudokuGrid(puzzle);
});
