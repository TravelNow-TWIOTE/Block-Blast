const boardSize = 8;
let board = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

const colors = ["#ff4d4d","#4dff88","#4da6ff","#ffd24d","#cc66ff"];

let pieces = [];
let draggingPiece = null;
let dragElement = null;

document.getElementById("highScore").innerText = highScore;

function initBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  board = [];

  for (let r=0;r<boardSize;r++){
    let row=[];
    for (let c=0;c<boardSize;c++){
      row.push(null);
      const cell=document.createElement("div");
      cell.classList.add("cell");
      boardEl.appendChild(cell);
    }
    board.push(row);
  }
}

function drawBoard() {
  document.querySelectorAll(".cell").forEach((cell,i)=>{
    let r=Math.floor(i/boardSize);
    let c=i%boardSize;

    if(board[r][c]){
      cell.style.background=board[r][c];
    } else {
      cell.style.background="#222";
    }
  });
}

function randomPiece(){
  const shapes=[
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

function generatePieces(){
  pieces=[randomPiece(),randomPiece(),randomPiece()];
  drawPieces();
}

function drawPieces(){
  const container=document.getElementById("pieces");
  container.innerHTML="";

  pieces.forEach((p,index)=>{
    const div=document.createElement("div");
    div.classList.add("piece");

    div.style.gridTemplateColumns=`repeat(${p.shape[0].length},30px)`;

    p.shape.forEach(row=>{
      row.forEach(cell=>{
        const b=document.createElement("div");
        if(cell){
          b.classList.add("block");
          b.style.background=p.color;
        }
        div.appendChild(b);
      });
    });

    div.addEventListener("mousedown",(e)=>{
      draggingPiece={piece:p,index:index};
      dragElement=div.cloneNode(true);
      dragElement.classList.add("dragging");
      document.body.appendChild(dragElement);
    });

    container.appendChild(div);
  });
}

document.addEventListener("mousemove",(e)=>{
  if(!dragElement) return;
  dragElement.style.left=e.pageX+"px";
  dragElement.style.top=e.pageY+"px";
});

document.addEventListener("mouseup",(e)=>{
  if(!draggingPiece) return;

  const boardRect=document.getElementById("board").getBoundingClientRect();

  const x=e.clientX-boardRect.left;
  const y=e.clientY-boardRect.top;

  const r=Math.floor(y/45);
  const c=Math.floor(x/45);

  placePiece(draggingPiece.piece,r,c);

  dragElement.remove();
  dragElement=null;
  draggingPiece=null;
});

function canPlace(piece,r,c){
  for(let i=0;i<piece.shape.length;i++){
    for(let j=0;j<piece.shape[i].length;j++){
      if(piece.shape[i][j]){
        let nr=r+i,nc=c+j;
        if(nr>=boardSize||nc>=boardSize||board[nr][nc]) return false;
      }
    }
  }
  return true;
}

function placePiece(piece,r,c){
  if(!canPlace(piece,r,c)) return;

  for(let i=0;i<piece.shape.length;i++){
    for(let j=0;j<piece.shape[i].length;j++){
      if(piece.shape[i][j]){
        board[r+i][c+j]=piece.color;
      }
    }
  }

  pieces.splice(draggingPiece.index,1);
  if(pieces.length===0) generatePieces();

  clearLines();
  drawBoard();
}

function clearLines(){
  let cleared=0;

  for(let r=0;r<boardSize;r++){
    if(board[r].every(x=>x)){
      board[r].fill(null);
      cleared++;
    }
  }

  for(let c=0;c<boardSize;c++){
    let full=true;
    for(let r=0;r<boardSize;r++){
      if(!board[r][c]) full=false;
    }
    if(full){
      for(let r=0;r<boardSize;r++) board[r][c]=null;
      cleared++;
    }
  }

  if(cleared>0){
    score+=cleared*10;
    document.getElementById("score").innerText=score;

    if(score>highScore){
      highScore=score;
      localStorage.setItem("highScore",highScore);
      document.getElementById("highScore").innerText=highScore;
    }
  }
}

function startGame(){
  score=0;
  document.getElementById("score").innerText=0;
  initBoard();
  generatePieces();
  drawBoard();
}

startGame();
