const myCanvas = document.querySelector("canvas");
const ctx = myCanvas.getContext("2d");

const blockWidth = 50;
const blockHeight = 50;
const circleRadius = 15;

const baseWidth = 15;
const baseHeight = 15;

const numberOfWin = 5;

let playerStatus = false; // false means player_1 round (min player), true means player_2 round (max player)
let isGameOver = false;

const comboScoresMap = new Map([
  [1, 1],
  [2, 10],
  [3, 100],
  [4, 1000],
  [5, 10000],
]);

class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.draw();
    this.playerStatus = 0; // 0 means empty, 1 means player_1, 2 means player_2
    this.isPointed = false;
  }
  setPlayerStatus(s) {
    this.playerStatus = s;
  }
  getPlayerStatus() {
    return this.playerStatus;
  }
  setIsPointed(isPointed) {
    this.isPointed = isPointed;
  }
  draw() {
    // the block itself
    ctx.beginPath();
    ctx.rect(this.x, this.y, blockWidth, blockHeight);
    ctx.fillStyle = "#f90";
    ctx.fill();
    // ctx.strokeStyle = "green";
    // ctx.lineWidth = 5;
    // ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 3;
    // row line
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(this.x + blockWidth / 2, this.y);
    ctx.lineTo(this.x + blockWidth / 2, this.y + blockHeight);
    ctx.stroke();
    ctx.closePath();
    // colum line
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + blockHeight / 2);
    ctx.lineTo(this.x + blockWidth, this.y + blockHeight / 2);
    ctx.stroke();
    ctx.closePath();
    // if user is pointing this block, add a stroke circle on this block
    if (this.isPointed) {
      ctx.beginPath();
      ctx.arc(
        this.x + blockWidth / 2,
        this.y + blockHeight / 2,
        circleRadius,
        0,
        2 * Math.PI
      );
      ctx.lineWidth = 2;
      ctx.strokeStyle = "blue";
      ctx.stroke();
    }
    // if someone pick this block, add white or black piece on this block
    switch (this.playerStatus) {
      case 0:
        break;
      case 2:
        ctx.beginPath();
        ctx.arc(
          this.x + blockWidth / 2,
          this.y + blockHeight / 2,
          circleRadius,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
        break;
      case 1:
        ctx.beginPath();
        ctx.arc(
          this.x + blockWidth / 2,
          this.y + blockHeight / 2,
          circleRadius,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.stroke();
        break;
    }
    ctx.closePath();
  }
}

class Base {
  constructor() {
    this.blockMap = new Map([]); // ['x,y', new block(x, y)]
    this.setUp();
    this.draw();
    this.winSetMap = new Map([
      [1, []], // the win combination of player 1
      [2, []], // the win combination of player 2
    ]);
    this.unprocessWinCombination = [];
  }
  setUp() {
    for (let x = 0; x < baseWidth; x++) {
      for (let y = 0; y < baseHeight; y++) {
        this.blockMap.set(
          `${x},${y}`,
          new Block(x * blockWidth, y * blockHeight)
        );
      }
    }
  }
  draw() {
    this.blockMap.forEach((block) => block.draw());
  }
  whichBlockPointing(x, y) {
    let row = Math.floor(x / blockWidth);
    let colum = Math.floor(y / blockHeight);
    return [row, colum];
  }
  getBlock(x, y) {
    return this.blockMap.get(`${x},${y}`);
  }
  isWinInMap(x, y, player) {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // y = x
      [1, -1], // y = -x
    ];

    for (const [dx, dy] of directions) {
      let count = 1; // include the first piece
      let winCombination = [`${x},${y}`];
      // same way
      for (let i = 1; i < numberOfWin; i++) {
        if (
          this.getBlock(x + i * dx, y + i * dy) &&
          this.getBlock(x + i * dx, y + i * dy).getPlayerStatus() === player
        ) {
          count++;
          winCombination.push(`${x + i * dx},${y + i * dy}`);
        } else if (
          this.getBlock(x + i * dx, y + i * dy) &&
          this.getBlock(x + i * dx, y + i * dy).getPlayerStatus() === 0
        ) {
          winCombination.push(`${x + i * dx},${y + i * dy}`);
        } else {
          break;
        }
      }
      // opposite way
      for (let i = 1; i < numberOfWin; i++) {
        if (
          this.getBlock(x - i * dx, y - i * dy) &&
          this.getBlock(x - i * dx, y - i * dy).getPlayerStatus() === player
        ) {
          count++;
          winCombination.unshift(`${x - i * dx},${y - i * dy}`);
        } else if (
          this.getBlock(x - i * dx, y - i * dy) &&
          this.getBlock(x - i * dx, y - i * dy).getPlayerStatus() === 0
        ) {
          winCombination.unshift(`${x - i * dx},${y - i * dy}`);
        } else {
          break;
        }
      }
      // if the length of winCombination is greater than numberOfWin,
      // it means this winCombination is vaild so push into unprocessedWinCombination
      if (winCombination.length >= numberOfWin) {
        this.unprocessWinCombination.push(winCombination);
      }
      if (count >= numberOfWin) {
        return true;
      }
    }
    return false;
  }
  processWinCombination(player) {
    let playerWinSet = this.winSetMap.get(player);
    // convent unprocessedWinCombination to normal (length is numberOfWin) winCombination
    this.unprocessWinCombination.forEach((winCombination) => {
      let i = 0;
      while (i + numberOfWin - 1 < winCombination.length) {
        let unCheckWinCombination = winCombination.filter(
          (value, index) => index >= i && index <= i + numberOfWin - 1
        );
        if (
          // if the winCombination does not exist in winSet, push it into winSet
          !playerWinSet.some(
            (value) =>
              value[0] === unCheckWinCombination[0] &&
              value[numberOfWin - 1] === unCheckWinCombination[numberOfWin - 1]
          )
        ) {
          playerWinSet.push(unCheckWinCombination);
        }
        i++;
      }
    });
    this.unprocessWinCombination = []; // clear unprocessWinCombination
  }
  removeBlockedWinSet(x, y) {
    let otherPlayer = playerStatus ? 1 : 2;
    this.winSetMap.set(
      otherPlayer,
      this.winSetMap.get(otherPlayer).filter((combination) => {
        return !combination.includes(`${x},${y}`);
      })
    );
  }
  getTheScores(player) {
    let scores = 0;
    const intMap = this.getBlockMapToIntMap();
    this.winSetMap.get(player).forEach((winSet) => {
      scores += this.getTheScoresOfWinSet(winSet, intMap, player);
    });
    return scores;
  }
  getTheScoresOfWinSet(winSet, intMap, player) {
    let combo = 0;
    winSet.forEach((position) => {
      if (intMap.get(position) === player) {
        combo++;
      }
    });
    return comboScoresMap.get(combo);
  }
  getBlockMapToIntMap() {
    const intMap = new Map([]);
    this.blockMap.forEach((block, position) =>
      intMap.set(position, block.getPlayerStatus())
    );
    return intMap;
  }
}

const base = new Base();

// click event
myCanvas.addEventListener("click", (event) => {
  if (isGameOver) {
    return;
  }
  let player = playerStatus ? 2 : 1;
  const rect = myCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const [row, colum] = base.whichBlockPointing(x, y);
  if (base.getBlock(row, colum).getPlayerStatus() !== 0) {
    return;
  }
  base.getBlock(row, colum).setPlayerStatus(player);
  if (base.isWinInMap(row, colum, player)) {
    console.log(`player ${player} Win!`);
    isGameOver = true;
  }
  base.processWinCombination(player);
  base.removeBlockedWinSet(row, colum);
  playerStatus = !playerStatus;
  base.draw();
});

// point event
myCanvas.addEventListener("mousemove", (event) => {
  if (isGameOver) {
    return;
  }
  const rect = myCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const [row, colum] = base.whichBlockPointing(x, y);
  base.blockMap.forEach((block, position) => {
    block.setIsPointed(false);
  });
  if (base.getBlock(row, colum).getPlayerStatus() === 0) {
    base.getBlock(row, colum).setIsPointed(true);
  }
  base.draw();
});
