const myCanvas = document.getElementById("myCanvas");

const blockColor = "red";
const blockWidth = 100;
const blockHeight = 50;

const totalNumberOfBlocks = 48;
const boardWidth = 150;
const boardHeigh = 50;
const boardInitialX = myCanvas.width / 2 - boardWidth / 2;
const boardInitialY = myCanvas.height - boardHeigh - 100;

const energyMax = 20;
const step = 10;

const ballRadius = 10;
const ballSpeed = 2;
const ballinitialX = myCanvas.width / 2;
const ballinitialY = myCanvas.height / 2;

let score = 0;
let timeFrameNumber = 10;

// Block class for creating blocks
class Block {
  constructor(x, y, color, canvas) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.ctx = canvas.getContext("2d");
  }

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

  reset() {
    this.energy = 50;
    this.x = boardInitialX;
    this.y = boardInitialY;
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
    this.speed = ballSpeed * (score + 1);
    this.direction = Math.random() * Math.PI;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = "aqua";
    this.ctx.fill();
    this.ctx.closePath();
  }

  reset() {
    this.x = ballinitialX;
    this.y = ballinitialY;
    this.direction = Math.random() * Math.PI;
  }

  move() {
    this.x += this.speed * Math.cos(this.direction);
    this.y += this.speed * Math.sin(this.direction);
  }

  touchBotton() {
    return this.y + this.radius > this.height;
  }

  changeDirectionTo(pi) {
    this.direction = pi;
  }

  randomDirection() {
    this.direction = Math.random() * Math.PI * 2;
    // console.log("random direction");
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

  checkBlockMapEmpty() {
    return this.blockMap.size === 0;
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
    this.board.reset();
    this.ball.reset();
    this.refresh();
  }

  changeDirectionByTouching(x, y, width, height) {
    if (
      this.ball.x + this.ball.radius > x &&
      this.ball.x - this.ball.radius < x + width &&
      this.ball.y + this.ball.radius > y &&
      this.ball.y - this.ball.radius < y + height
    ) {
      const legthDifferentMap = new Map([
        ["top", this.ball.y + this.ball.radius - y],
        ["bottom", this.ball.y - this.ball.radius - (y + height)],
        ["left", this.ball.x + this.ball.radius - x],
        ["right", this.ball.x - this.ball.radius - (x + width)],
      ]);
      let minDifferent = 10000;
      let touchEdge = "";
      legthDifferentMap.forEach((value, key) => {
        console.log(`${key} : ${Math.abs(value)}`);
        if (Math.abs(value) < minDifferent) {
          minDifferent = Math.abs(value);
          touchEdge = key;
        }
      });
      switch (touchEdge) {
        case "top":
        case "bottom":
          this.ball.changeDirectionTo(-this.ball.direction);
          console.log("top or bottom");
          break;
        case "left":
        case "right":
          this.ball.changeDirectionTo(Math.PI - this.ball.direction);
          console.log("left or right");
          break;
      }
      return true;
    }
    return false;
  }

  checkBlockCollision() {
    // check if the ball touch the block
    this.blockMap.forEach((block, id) => {
      if (
        this.changeDirectionByTouching(
          block.x,
          block.y,
          blockWidth,
          blockHeight
        )
      ) {
        this.deleteBlock(id);
      }
    });
  }

  checkBoardCollision() {
    if (
      this.changeDirectionByTouching(
        this.board.x,
        this.board.y,
        boardWidth,
        boardHeigh
      )
    ) {
      score++;
    }
  }

  checkEdgeCollision() {
    if (this.ball.x + this.ball.radius > this.width) {
      this.ball.changeDirectionTo(Math.PI - this.ball.direction);
    }
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.changeDirectionTo(Math.PI - this.ball.direction);
    }
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.changeDirectionTo(-this.ball.direction);
    }
  }
}

const board = new Board(myCanvas);
const ball = new Ball(myCanvas);
const base = new Base(myCanvas, board, ball);
let startStatus = false;
base.reset();

// let timeFrame = setInterval(oneFrame, 10);

function oneFrame() {
  base.ball.move();
  if (base.ball.touchBotton()) {
    clearInterval(timeFrame);
    startStatus = false;
    alert("Game Over");
  }
  if (base.checkBlockMapEmpty()) {
    clearInterval(timeFrame);
    startStatus = false;
    alert("You Win!");
  }
  base.checkBlockCollision();
  base.checkBoardCollision();
  base.checkEdgeCollision();
  base.refresh();
}

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
  switch (e.key) {
    case "ArrowLeft":
      board.moveLeft(moveStep);
      break;
    case "ArrowRight":
      board.moveright(moveStep);
      break;
    case "r":
      base.reset();
      break;
    case "s":
      if (!startStatus) {
        startStatus = true;
        // randomDirection = setInterval(ball.randomDirection, 1000);
        timeFrame = setInterval(oneFrame, timeFrameNumber);
      }
      break;
    case "p":
      if (startStatus) {
        startStatus = false;
        clearInterval(timeFrame);
        clearInterval(randomDirection);
      }
      break;
    case "t":
      oneFrame();
      break;
  }
  base.refresh();
});

console.log("done");
