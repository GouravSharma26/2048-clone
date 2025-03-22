let grid;
let score = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let highScore = localStorage.getItem('highScore') || 0;

function init() {
  grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  score = 0;
  addNewTile();
  addNewTile();
  updateBoard();
}

function addNewTile() {
  let emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) {
        emptyCells.push({ x: i, y: j });
      }
    }
  }
  if (emptyCells.length === 0) return;
  let { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[x][y] = Math.random() < 0.9 ? 2 : 4;
}

function updateBoard() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let cell = document.getElementById(`cell-${i}-${j}`);
      let value = grid[i][j];
      cell.textContent = value === 0 ? '' : value;
      cell.setAttribute('data-value', value);
    }
  }
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('high-score').textContent = `High Score: ${highScore}`;
}

function restartGame() {
  init();
}

function toggleTheme() {
  document.body.classList.toggle('dark');
}

function toggleNeon() {
  document.body.classList.toggle('neon');
}

function move(direction) {
  let moved = false;
  let merged = createEmptyGrid();
  for (let i = 0; i < 4; i++) {
    let line = getLine(i, direction);
    let result = slideAndMerge(line);
    setLine(i, direction, result.line);
    score += result.scoreGain;
    if (result.moved) moved = true;
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }

  if (moved) {
    addNewTile();
    updateBoard();
    if (isGameOver()) alert("Game Over!");
  }
}

function getLine(i, dir) {
  let line = [];
  if (dir === 'left') line = grid[i];
  if (dir === 'right') line = [...grid[i]].reverse();
  if (dir === 'up') line = grid.map(row => row[i]);
  if (dir === 'down') line = grid.map(row => row[i]).reverse();
  return line;
}

function setLine(i, dir, line) {
  if (dir === 'left') grid[i] = line;
  if (dir === 'right') grid[i] = [...line].reverse();
  if (dir === 'up') for (let j = 0; j < 4; j++) grid[j][i] = line[j];
  if (dir === 'down') for (let j = 0; j < 4; j++) grid[j][i] = line[3 - j];
}

function slideAndMerge(line) {
  let arr = line.filter(val => val !== 0);
  let scoreGain = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      scoreGain += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < 4) arr.push(0);
  return { line: arr, moved: JSON.stringify(line) !== JSON.stringify(arr), scoreGain };
}

function createEmptyGrid() {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
}

function isGameOver() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return false;
      if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
      if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
    }
  }
  return true;
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft': move('left'); break;
    case 'ArrowRight': move('right'); break;
    case 'ArrowUp': move('up'); break;
    case 'ArrowDown': move('down'); break;
  }
});

init();

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }
  
  function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
  
    handleSwipeGesture();
  }
  
  function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
  
    // Set a minimum distance for swipe detection
    const minDistance = 30;
  
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minDistance) {
        if (deltaX > 0) {
          move('right');
        } else {
          move('left');
        }
      }
    } else {
      if (Math.abs(deltaY) > minDistance) {
        if (deltaY > 0) {
          move('down');
        } else {
          move('up');
        }
      }
    }
  }
  