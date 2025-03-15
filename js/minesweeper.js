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

let level = "hard";

let blockWidth = levelSetUp[`${level}`].blockWidth;
let blockHeigh = levelSetUp[`${level}`].blockHeigh;

function andWithTwoSet(set_a, set_b) {
  return new Set([...set_a].filter((element) => set_b.has(element)));
}

function orWithTwoSet(set_a, set_b) {
  return new Set([...set_a, ...set_b]);
}

function diffWithTwoSet(set_a, set_b) {
  return new Set([...set_a].filter((element) => !set_b.has(element)));
}

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
  setValue(value) {
    this.value = value;
  }
  getValue() {
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

  getNextBlock(x, y) {
    // return an array of block which is next to the block in position (x, y)
    return [
      { x: x, y: y - 1, block: this.getArea(x, y - 1) }, // top
      { x: x, y: y + 1, block: this.getArea(x, y + 1) }, // down
      { x: x - 1, y: y, block: this.getArea(x - 1, y) }, // left
      { x: x + 1, y: y, block: this.getArea(x + 1, y) }, // right
    ].filter((area) => {
      if (
        area.x >= 0 &&
        area.x < levelSetUp[`${level}`].width - 1 &&
        area.y >= 0 &&
        area.y < levelSetUp[`${level}`].heigh - 1 // filter out those block which is outside the base
      ) {
        return true;
      }
      return false;
    });
  }

  getAreaWithEmpty(x, y) {
    const checkedArray = [{ x, y, block: this.getArea(x, y) }]; // an array for the position of checked area
    const goToCheckArray = this.getNextBlock(x, y).filter(
      (block) => block.block.getValue() === 0
    ); // an array for the position of going to check area with empty
    while (goToCheckArray.length != 0) {
      let block = goToCheckArray.pop();
      // if new block is in checked array, then pass it.
      if (
        checkedArray.some(
          (checked) => checked.x === block.x && checked.y === block.y
        )
      ) {
        continue;
      }
      checkedArray.push(block); // push new block into checked array
      let nextBlockWithEmpty = this.getNextBlock(block.x, block.y).filter(
        (nextBlock) => nextBlock.block.getValue() === 0
      ); // get the block, which is next to position (x, y), and it is empty
      nextBlockWithEmpty.forEach((nextBlock) => {
        if (
          !goToCheckArray.some(
            (checked) => checked.x === nextBlock.x && checked.y === nextBlock.y
          ) // if near block is in goToCheck array, pass it
        ) {
          goToCheckArray.push(nextBlock); // push the new block, which is next to position (x, y), into goToCheck array
        }
      });
    }
    return checkedArray;
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
        value.setValue(2);
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
base.setAreaMap();
base.setMine();
base.draw();
