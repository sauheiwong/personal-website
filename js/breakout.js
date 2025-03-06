const myCanvas = document.getElementById("myCanvas");

const blockColor = "red";
const blockWidth = 100;
const blockHeight = 25;

const totalNumberOfBlocks = 48;
const boardWidth = 100;
const boardHeigh = 10;
const boardInitialX = myCanvas.width / 2 - boardWidth / 2;
const boardInitialY = myCanvas.height - boardHeigh - 100;

const energyMax = 50;
const step = 10;

const ballRadius = 20;
const ballSpeed = 2;
const ballinitialX = myCanvas.width / 2;
const ballinitialY = myCanvas.height / 2;

// Block class for creating blocks
class Block {
  constructor(x, y, color, canvas) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.ctx = canvas.getContext("2d");
  }
  // Draw the block
  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, blockWidth, blockHeight);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
    this.ctx.closePath();
  }
}

// Board class for creating the board
class Board {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.ctx = canvas.getContext("2d");
    this.x = boardInitialX;
    this.y = boardInitialY;
    this.energy = 50;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, boardWidth, boardHeigh);
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.rect(
      this.x + (boardWidth * (1 - this.energy / 50)) / 2,
      this.y,
      boardWidth * (this.energy / 50),
      boardHeigh
    );
    this.ctx.fillStyle = "blue";
    this.ctx.fill();
    this.ctx.closePath();
  }
  moveLeft(step) {
    this.x -= step;
    if (this.x < 0) {
      this.x = 0;
    }
  }
  moveright(step) {
    this.x += step;
    if (this.x > this.width - boardWidth) {
      this.x = this.width - boardWidth;
    }
  }
}

class Ball {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext("2d");
    this.radius = ballRadius;
    this.x = ballinitialX;
    this.y = ballinitialY;
    this.speed = ballSpeed;
    this.direction = (Math.random() + 0.5) * Math.PI;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = "aqua";
    this.ctx.fill();
    this.ctx.closePath();
  }
  move() {
    this.x += this.speed * Math.cos(this.direction);
    this.y += this.speed * Math.sin(this.direction);
  }
}

// Base class for creating the base of the game
class Base {
  constructor(canvas, board, ball) {
    this.blockMap = new Map([]);
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext("2d");
    this.board = board;
    this.ball = ball;
  }

  getBlock(id) {
    return this.blockMap.get(id);
  }

  setBlock(id, x, y, color) {
    this.blockMap.set(id, new Block(x, y, color, this.canvas));
  }

  deleteBlock(id) {
    this.blockMap.delete(id);
    this.refresh();
  }

  refresh() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.blockMap.forEach((block) => {
      block.draw();
    });
    this.board.draw();
    this.ball.draw();
  }

  reset() {
    let i = 0;
    while (i < totalNumberOfBlocks) {
      this.setBlock(
        `block-${i}`,
        (i % 8) * blockWidth,
        ((i / 8) | 0) * blockHeight,
        blockColor
      );
      this.getBlock(`block-${i}`).draw();
      i++;
    }
    this.refresh();
  }
}

const board = new Board(myCanvas);
const ball = new Ball(myCanvas);
const base = new Base(myCanvas, board, ball);
base.reset();

document.addEventListener("keydown", (e) => {
  let moveStep = step;
  if (e.ctrlKey) {
    if (board.energy <= 0) {
      return;
    }
    moveStep = moveStep * 2;
    board.energy -= 1;
  } else {
    if (board.energy < energyMax) {
      board.energy += 1;
    }
  }
  console.log(board.energy);
  switch (e.key) {
    case "ArrowLeft":
      board.moveLeft(moveStep);
      break;
    case "ArrowRight":
      board.moveright(moveStep);
      break;
  }
  base.refresh();
});

// Create blocks on top of the base

console.log("done");

// base.setBlock("block-100", 0, 100, 50, 10, blockColor);
// base.getBlock("block-100").draw();
