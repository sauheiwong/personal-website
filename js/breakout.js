const myCanvas = document.getElementById("myCanvas");
const blockColor = "red";
const blockWidth = 100;
const blockHeight = 50;
const totalNumberOfBlocks = 32;

// Block class for creating blocks
class Block {
  constructor(x, y, width, height, color, canvas) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.ctx = canvas.getContext("2d");
  }
  // Draw the block
  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
    this.ctx.closePath();
  }
}

// Base class for creating the base of the game
class Base {
  constructor(canvas) {
    this.blockMap = new Map([]);
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext("2d");
  }

  getBlock(id) {
    return this.blockMap.get(id);
  }

  setBlock(id, x, y, width, height, color) {
    this.blockMap.set(id, new Block(x, y, width, height, color, this.canvas));
  }

  deleteBlock(id) {
    this.blockMap.delete(id);
    this.drawAllBlock();
  }

  drawAllBlock() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.blockMap.forEach((block) => {
      block.draw();
    });
  }
}

const base = new Base(myCanvas);
// Create blocks on top of the base
let i = 0;
while (i < totalNumberOfBlocks) {
  base.setBlock(
    `block-${i}`,
    (i % 8) * blockWidth,
    ((i / 8) | 0) * blockHeight,
    blockWidth,
    blockHeight,
    blockColor
  );
  base.getBlock(`block-${i}`).draw();
  i++;
}
console.log("done");

// base.setBlock("block-100", 0, 100, 50, 10, blockColor);
// base.getBlock("block-100").draw();
