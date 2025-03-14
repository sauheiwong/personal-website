// debugger;

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

const levelSetUp = {
  easy: {
    width: 10,
    heigh: 10,
    chanceOfMiner: 0.3,
    blockWidth: 150,
    blockHeigh: 150,
  },
  medium: {
    width: 20,
    heigh: 20,
    chanceOfMiner: 0.4,
    blockWidth: 75,
    blockHeigh: 75,
  },
  hard: {
    width: 50,
    heigh: 50,
    chanceOfMiner: 0.45,
    blockWidth: 30,
    blockHeigh: 30,
  },
};

let level = "medium";

let blockWidth = levelSetUp[`${level}`].blockWidth;
let blockHeigh = levelSetUp[`${level}`].blockHeigh;

class Block {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value; // 0 mean unknown, 1 mean empty, 2 mean mine
    this.color = new Map([
      [0, "gray"],
      [1, "#999"],
      [2, "#f00"],
    ]);
  }
  setvalue(value) {
    this.value = value;
  }
  getvalue() {
    return this.value;
  }
  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, blockWidth, blockHeigh);
    ctx.fillStyle = this.color.get(this.value);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  }
}

class Base {
  constructor(level) {
    this.level = level;
    this.areaMap = new Map([]);
    this.topLeftX =
      (myCanvas.width - blockWidth * levelSetUp[`${this.level}`].width) / 2;
    this.topLeftY =
      (myCanvas.height - blockHeigh * levelSetUp[`${this.level}`].heigh) / 2;
  }

  getAreaMap() {
    return this.areaMap;
  }

  getArea(x, y) {
    return this.areaMap.get(`${x},${y}`);
  }

  setAreaMap(id, value) {
    this.areaMap.set(id, value);
  }

  getNearBlock(x, y) {
    return new Set([
      this.getArea(x, y - 1), // top
      this.getArea(x, y + 1), // down
      this.getArea(x - 1, y), // left
      this.getArea(x + 1, y), // right
    ]);
  }

  setAreaMap() {
    for (let x = 0; x < levelSetUp[`${this.level}`].width; x++) {
      for (let y = 0; y < levelSetUp[`${this.level}`].heigh; y++) {
        this.areaMap.set(
          `${x},${y}`,
          new Block(
            this.topLeftX + x * blockWidth,
            this.topLeftY + y * blockHeigh,
            0
          )
        );
      }
    }
  }

  setMine() {
    this.areaMap.forEach((value, area) => {
      if (Math.random() < levelSetUp[`${this.level}`].chanceOfMiner) {
        value.setvalue(2);
      }
    });
  }

  draw() {
    this.areaMap.forEach((value, area) => {
      value.draw();
    });
  }
}

const base = new Base(level);
// myCanvas.width = base.levelSetUp[`${this.level}`].width * blockWidth * 1.5;
// myCanvas.height = base.levelSetUp[`${this.level}`].heigh * blockHeigh * 1.5;
base.setAreaMap();
base.setMine();
base.draw();
console.log(base.getAreaMap());
