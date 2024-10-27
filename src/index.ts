const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const speedInput = document.getElementById('speed') as HTMLInputElement;
const speedValue = document.getElementById('speedValue') as HTMLSpanElement;
const pauseButton = document.getElementById('pause') as HTMLButtonElement;
const clearButton = document.getElementById('clear') as HTMLButtonElement;
const messageDiv = document.getElementById('message') as HTMLDivElement;
const randomizeButton = document.getElementById('randomize') as HTMLButtonElement;

let speed = 5;
let rows = 50;
let cols = 50;
let liveColor = '#000000';
let deadColor = '#FFFFFF';
let isPaused = false;

speedInput.addEventListener('input', (event) => {
    speed = parseInt((event.target as HTMLInputElement).value);
    speedValue.textContent = `${speed * 10}%`;
});

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) {
        requestAnimationFrame(gameLoop);
    }
});

clearButton.addEventListener('click', () => {
    grid = createGrid(rows, cols, false);
    drawGrid(grid);
    messageDiv.textContent = '';
});

randomizeButton.addEventListener('click', () => {
    grid = createGrid(rows, cols, true);
    drawGrid(grid);
});

let grid: number[][] = createGrid(rows, cols, true);

function createGrid(rows: number, cols: number, randomize: boolean): number[][] {
    const grid = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(randomize ? (Math.random() < 0.2 ? 1 : 0) : 0);
        }
        grid.push(row);
    }
    return grid;
}

function drawGrid(grid: number[][]) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            ctx.fillStyle = grid[i][j] === 1 ? liveColor : deadColor;
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.strokeStyle = 'gray';
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}

function updateGrid(grid: number[][]): number[][] {
    const newGrid = grid.map(arr => [...arr]);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const neighbors = countNeighbors(grid, i, j);
            if (grid[i][j] === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[i][j] = 0;
            } else if (grid[i][j] === 0 && neighbors === 3) {
                newGrid[i][j] = 1;
            }
        }
    }
    return newGrid;
}

function countNeighbors(grid: number[][], x: number, y: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const ni = x + i;
            const nj = y + j;
            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                count += grid[ni][nj] === 1 ? 1 : 0;
            }
        }
    }
    return count;
}

function allCellsDead(grid: number[][]): boolean {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                return false;
            }
        }
    }
    return true;
}

function gameLoop() {
    if (!ctx || isPaused) return;
    grid = updateGrid(grid);
    drawGrid(grid);
    if (allCellsDead(grid)) {
        messageDiv.textContent = 'All cells are dead. Restarting...';
        setTimeout(() => {
            grid = createGrid(rows, cols, true);
            messageDiv.textContent = '';
            requestAnimationFrame(gameLoop);
        }, 3000);
    } else {
        setTimeout(() => {
            requestAnimationFrame(gameLoop);
        }, 1000 / speed);
    }
}

function resetGrid() {
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
    grid = createGrid(rows, cols, true);
    drawGrid(grid);
}

const cellSize = 10;
resetGrid();
requestAnimationFrame(gameLoop);