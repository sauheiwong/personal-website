const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

const levelSetUp = {
  easy: {
    width: 10,
    heigh: 10,
    chanceOfMiner: 0.3,
    blockWidth: 150,
    blockHeigh: 150,
    fontSize: 50,
  },
  medium: {
    width: 20,
    heigh: 20,
    chanceOfMiner: 0.4,
    blockWidth: 75,
    blockHeigh: 75,
    fontSize: 30,
  },
  hard: {
    width: 50,
    heigh: 50,
    chanceOfMiner: 0.45,
    blockWidth: 30,
    blockHeigh: 30,
    fontSize: 20,
  },
};
let firstClick = true;

const colorMap = new Map([
  [0, "gray"],
  [1, "#999"],
  [2, "gray"],
]);

let level = "easy";

let blockWidth = () => {
  return levelSetUp[`${level}`].blockWidth;
};
let blockHeigh = () => {
  return levelSetUp[`${level}`].blockHeigh;
};
let fontSize = () => {
  return levelSetUp[`${level}`].fontSize;
};

class Block {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value; // 0 mean unknown, 1 mean empty, 2 mean mine
    this.text = "";
    this.marked = false;
    this.show = false;
  }
  showAnswer() {
    this.show = true;
  }
  setMarked() {
    this.marked = !this.marked;
  }
  setValue(value) {
    this.value = value;
  }
  getValue() {
    return this.value;
  }
  setText(text) {
    this.text = text;
  }
  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, blockWidth(), blockHeigh());
    if (this.marked) {
      ctx.fillStyle = "#f00";
    } else {
      ctx.fillStyle = colorMap.get(this.value);
    }
    if (this.show && this.value === 2) {
      ctx.fillStyle = "#000";
    }
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();
    if (this.text === "0") {
      ctx.closePath();
      return;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontSize()}px Arial`;
    ctx.fillStyle = "black";
    ctx.fillText(
      this.text,
      this.x + blockWidth() / 2,
      this.y + blockHeigh() / 2
    );
    ctx.closePath();
  }
}

class Base {
  constructor(level) {
    this.level = level;
    this.areaMap = new Map([]);
    this.topLeftX =
      (myCanvas.width - blockWidth() * levelSetUp[`${this.level}`].width) / 2;
    this.topLeftY =
      (myCanvas.height - blockHeigh() * levelSetUp[`${this.level}`].heigh) / 2;
    this.numberOfMine = 0;
    this.numberOfRemainEmpty =
      levelSetUp[`${level}`].width * levelSetUp[`${level}`].heigh;
  }

  setLevel(level) {
    this.level = level;
  }

  getAreaMap() {
    return this.areaMap;
  }

  getArea(x, y) {
    return this.areaMap.get(`${x},${y}`);
  }

  getNumberOfRemainEmpty() {
    return this.numberOfRemainEmpty;
  }

  setAreaMap(id, value) {
    this.areaMap.set(id, value);
  }

  getWhichBlockPoint(x, y) {
    let row = Math.floor(x / (blockWidth() / 2));
    let colum = Math.floor(y / (blockHeigh() / 2));
    return [row, colum];
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
        area.x <= levelSetUp[`${level}`].width - 1 &&
        area.y >= 0 &&
        area.y <= levelSetUp[`${level}`].heigh - 1 // filter out those block which is outside the base
      ) {
        return true;
      }
      return false;
    });
  }

  openAreaWithEmpty(x, y) {
    if (this.getArea(x, y).getValue() === 1) {
      return;
    }
    const checkedArray = [{ x, y, block: this.getArea(x, y) }]; // an array for the position of checked area
    const goToCheckArray = this.getNextBlock(x, y).filter(
      (block) =>
        block.block.getValue() === 0 && this.getNumberOfMine(x, y) === 0
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
        (nextBlock) =>
          nextBlock.block.getValue() === 0 &&
          this.getNumberOfMine(block.x, block.y) === 0
      ); // get the block, which is next to position (x, y), with empty and does not have a mine near it.
      nextBlockWithEmpty.forEach((nextBlock) => {
        if (
          !goToCheckArray.some(
            (checked) => checked.x === nextBlock.x && checked.y === nextBlock.y // if near block is in goToCheck array, pass it
          )
        ) {
          goToCheckArray.push(nextBlock); // push the new block, which is next to position (x, y), into goToCheck array
        }
      });
    }
    checkedArray.forEach((block) => {
      let text = this.getNumberOfMine(block.x, block.y).toString();
      block.block.setText(text);
      block.block.setValue(1);
      this.numberOfRemainEmpty--;
    });
    this.draw();
  }

  getNumberOfMine(x, y) {
    // return the number of mine is near to the block in position (x, y)
    // 1, 2, 3
    // 4, #, 6
    // 7, 8, 9
    return [
      { x: x - 1, y: y - 1, block: this.getArea(x - 1, y - 1) }, // 1
      { x: x, y: y - 1, block: this.getArea(x, y - 1) }, // 2
      { x: x + 1, y: y - 1, block: this.getArea(x + 1, y - 1) }, // 3
      { x: x - 1, y: y, block: this.getArea(x - 1, y) }, // 4
      { x: x + 1, y: y, block: this.getArea(x + 1, y) }, // 6
      { x: x - 1, y: y + 1, block: this.getArea(x - 1, y + 1) }, // 7
      { x: x, y: y + 1, block: this.getArea(x, y + 1) }, // 8
      { x: x + 1, y: y + 1, block: this.getArea(x + 1, y + 1) }, // 9
    ].filter((area) => {
      if (
        area.x >= 0 &&
        area.x <= levelSetUp[`${level}`].width - 1 &&
        area.y >= 0 &&
        area.y <= levelSetUp[`${level}`].heigh - 1 && // filter out those block which is outside the base
        area.block.getValue() === 2 // filter out those block which is a mine
      ) {
        return true;
      }
      return false;
    }).length;
  }

  setAreaMap() {
    this.areaMap = new Map([]);
    for (let x = 0; x < levelSetUp[`${this.level}`].width; x++) {
      for (let y = 0; y < levelSetUp[`${this.level}`].heigh; y++) {
        this.areaMap.set(
          `${x},${y}`,
          new Block(
            this.topLeftX + x * blockWidth(),
            this.topLeftY + y * blockHeigh(),
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
        this.numberOfMine++;
        this.numberOfRemainEmpty--;
      }
    });
  }

  draw() {
    this.areaMap.forEach((value, area) => {
      value.draw();
    });
  }

  reset() {
    this.numberOfMine = 0;
    this.numberOfRemainEmpty =
      levelSetUp[`${level}`].width * levelSetUp[`${level}`].heigh;
    this.setAreaMap();
    this.setMine();
    this.draw();
    firstClick = true;
  }
}

const base = new Base(level);
base.reset();

document.querySelectorAll(".level").forEach((btn) => {
  btn.addEventListener("click", () => {
    level = btn.id.toString();
    base.setLevel(level);
    base.reset();
  });
});

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

const finshMessageText = document.getElementById("finsh-message");
const popUpContainer = document.getElementById("pop-up-container");

document.getElementById("ok").addEventListener("click", () => {
  editFinshContainer("reset");
});

const editFinshContainer = (result) => {
  switch (result) {
    case "reset":
      popUpContainer.style.left = "-50%";
      finshMessageText.innerHTML = "";
      return;
    case "win":
      finshMessageText.innerHTML = "You Win!🎉";
      break;
    case "boom":
      finshMessageText.innerHTML = "Boom!🔥<br>You Died☠️ <br>死💀";
      break;
  }
  popUpContainer.style.left = "37.5%";
};

myCanvas.addEventListener("mousedown", function (event) {
  const rect = myCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  [row, colum] = base.getWhichBlockPoint(x, y);
  let block = base.getArea(row, colum);
  switch (event.button) {
    case 0: // left click
      if (block.getValue() === 2 && !firstClick) {
        // if click a mine
        base.getAreaMap().forEach((value, area) => {
          value.showAnswer();
          value.draw();
        });
        editFinshContainer("boom");
        return;
      }
      if (block.getValue() === 2 && firstClick) {
        // if the first click a mine
        while (base.getArea(row, colum).getValue() === 2) {
          base.reset();
        }
        firstClick = false;
      }
      base.openAreaWithEmpty(row, colum);
      firstClick = false;
      if (base.getNumberOfRemainEmpty() === 0) {
        // if all empty area have been clicked
        base.getAreaMap().forEach((value, area) => {
          value.showAnswer();
          value.draw();
        });
        editFinshContainer("win");
      }
      break;
    case 2: // right click
      if (block.getValue() === 1) {
        // skip the opened area
        return;
      }
      block.setMarked();
      event.preventDefault();
      break;
  }
  base.draw();
});
