const boardSize = 8;
let board = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let currentPieces = [];
let lastState = null;

const colors = ["#ff4d4d","#4dff88","#4da6ff","#ffd24d","#cc66ff"];

document.getElementById("highScore").innerText = highScore;

function initBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  board = [];

  for (let r = 0; r < boardSize; r++) {
    let row = [];
    for (let c = 0; c < boardSize; c++) {
      row.push(null);
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.r = r;
      cell.dataset.c = c;
      boardEl.appendChild(cell);
    }
    board.push(row);
  }
}

function drawBoard() {
  document.querySelectorAll(".cell").forEach(cell => {
    const r = cell.dataset.r;
    const c = cell.dataset.c;
    cell.className = "cell";

    if (board[r][c]) {
      cell.style.background = board[r][c];
      cell.classList.add("filled");
    } else {
      cell.style.background = "#222";
    }
  });
}

function randomPiece() {
  const shapes = [
    [[1]],
    [[1,1]],
    [[1],[1]],
    [[1,1,1]],
    [[1],[1],[1]],
    [[1,1],[1,1]],
    [[1,1,1],[0,1,0]]
  ];
  return {
    shape: shapes[Math.floor(Math.random()*shapes.length)],
    color: colors[Math.floor(Math.random()*colors.length)]
  };
}

function generatePieces() {
  currentPieces = [randomPiece(), randomPiece(), randomPiece()];
  drawPieces();
}

function drawPieces() {
  const container = document.getElementById("pieces");
  container.innerHTML = "";

  currentPieces.forEach((p, index) => {
    const div = document.createElement("div");
    div.classList.add("piece");

    div.style.gridTemplateColumns = `repeat(${p.shape[0].length}, 30px)`;

    p.shape.forEach(row => {
      row.forEach(cell => {
        const b = document.createElement("div");
        if (cell) {
          b.classList.add("block");
          b.style.background = p.color;
        }
        div.appendChild(b);
      });
    });

    div.draggable = true;

    div.addEventListener("dragstart", e => {
      e.dataTransfer.setData("piece", index);
    });

    container.appendChild(div);
  });
}

document.getElementById("board").addEventListener("dragover", e => e.preventDefault());

document.getElementById("board").addEventListener("drop", e => {
  const index = e.dataTransfer.getData("piece");
  const piece = currentPieces[index];
  const rect = e.target.getBoundingClientRect();

  const r = Math.floor((e.clientY - rect.top) / 45);
  const c = Math.floor((e.clientX - rect.left) / 45);

  if (placePiece(piece, r, c)) {
    currentPieces.splice(index,1);
    if (currentPieces.length === 0) generatePieces();
  }
});

function canPlace(piece, r, c) {
  for (let i=0;i<piece.shape.length;i++) {
    for (let j=0;j<piece.shape[i].length;j++) {
      if (piece.shape[i][j]) {
        let nr = r+i;
        let nc = c+j;
        if (nr>=boardSize||nc>=boardSize||board[nr][nc]) return false;
      }
    }
  }
  return true;
}

function placePiece(piece, r, c) {
  if (!canPlace(piece,r,c)) return false;

  lastState = JSON.stringify(board);

  for (let i=0;i<piece.shape.length;i++) {
    for (let j=0;j<piece.shape[i].length;j++) {
      if (piece.shape[i][j]) {
        board[r+i][c+j] = piece.color;
      }
    }
  }

  clearLines();
  drawBoard();
  return true;
}

function clearLines() {
  let cleared = 0;

  for (let r=0;r<boardSize;r++) {
    if (board[r].every(cell=>cell)) {
      board[r].fill(null);
      cleared++;
    }
  }

  for (let c=0;c<boardSize;c++) {
    let full = true;
    for (let r=0;r<boardSize;r++) {
      if (!board[r][c]) full = false;
    }
    if (full) {
      for (let r=0;r<boardSize;r++) board[r][c]=null;
      cleared++;
    }
  }

  if (cleared>0) {
    score += cleared * 10;
    document.getElementById("score").innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById("highScore").innerText = highScore;
    }
  }
}

document.getElementById("undoBtn").onclick = () => {
  if (lastState) {
    board = JSON.parse(lastState);
    drawBoard();
  }
};

function startGame() {
  score = 0;
  document.getElementById("score").innerText = 0;
  initBoard();
  generatePieces();
  drawBoard();
}

startGame();
