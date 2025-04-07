const myCanvas = document.querySelector("canvas");
const ctx = myCanvas.getContext("2d");

const blockWidth = 50;
const blockHeight = 50;
const circleRadius = 15;

const baseWidth = 15;
const baseHeight = 15;

const numberOfWin = 5;

const nodeDepth = 2;

const defenseVariable = 10; // > 1 means defense first, < 1 means attack first

let playerStatus = false; // false means player_1 round (min player), true means player_2 round (max player)
let isGameOver = false;

const comboScoresMap = new Map([
  [0, 0],
  [1, 1],
  [2, 10 ** 2],
  [3, 10 ** 4],
  [4, 10 ** 6],
  [5, Infinity],
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
      if (playerStatus) {
        ctx.strokeStyle = "white";
      } else {
        ctx.strokeStyle = "black";
      }
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

class PieceInfor {
  constructor(intMap) {
    this.pieceMap = new Map([
      [1, []],
      [2, []],
    ]);
    this.intMap = intMap;
    this.n = 0;
    this.meanX = 0;
    this.meanY = 0;
    this.scores = 0;
  }
  addPiece(x, y, player) {
    // use math to speed up rather than calcute the ave. everytime
    this.pieceMap.get(player).push(`${x},${y}`);
    this.intMap.set(`${x},${y}`, player);
    this.n++;
    const deltaX = x - this.meanX;
    const deltaY = y - this.meanY;
    this.meanX += deltaX / this.n;
    this.meanY += deltaY / this.n;
  }
  removePiece(x, y, player) {
    // use math to speed up rather than calcute the ave. everytime
    this.pieceMap.set(
      player,
      this.pieceMap.get(player).filter((position) => position != `${x},${y}`)
    );
    this.intMap.set(`${x},${y}`, 0);
    if (this.n <= 0) return;
    if (this.n === 1) {
      this.n = 0;
      this.meanX = 0;
      this.meanY = 0;
      this.sumDistSquared = 0;
      return;
    }
    const oldMeanX = this.meanX;
    const oldMeanY = this.meanY;
    this.n -= 1;
    const newMeanX = (this.n + 1) * oldMeanX - x;
    const newMeanY = (this.n + 1) * oldMeanY - y;
    this.meanX = this.n > 0 ? newMeanX / this.n : 0;
    this.meanY = this.n > 0 ? newMeanY / this.n : 0;
  }
  compareWithPoint(x, y) {
    // calcule the distance between the ave. position and the new piece
    return (x - this.meanX) ** 2 + (y - this.meanY) ** 2;
  }
  isWinOfPosition(x, y, player) {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // y = x
      [1, -1], // y = -x
    ];
    for (const [dx, dy] of directions) {
      let count = 1; // include the first piece
      // same way
      for (let i = 1; i < numberOfWin; i++) {
        let position = `${x + i * dx},${y + i * dy}`;
        if (this.intMap.get(position) && this.intMap.get(position) === player) {
          count++;
        } else {
          break;
        }
      }
      // opposite way
      for (let i = 1; i < numberOfWin; i++) {
        let position = `${x - i * dx},${y - i * dy}`;
        if (this.intMap.get(position) && this.intMap.get(position) === player) {
          count++;
        } else {
          break;
        }
      }
      if (count >= numberOfWin) {
        return true;
      }
    }
    return false;
  }
  isWin() {
    for (const position of this.pieceMap.get(1)) {
      let [x, y] = position.split(",");
      if (this.isWinOfPosition(x, y, 1)) {
        return true;
      }
    }
    for (const position of this.pieceMap.get(2)) {
      let [x, y] = position.split(",");
      if (this.isWinOfPosition(x, y, 2)) {
        return true;
      }
    }
    return false;
  }
  getTheChoice() {
    // 2. sort all choice according the distance first so that the alpha beta cutting can speed up the minimax alg.
    let positionArray = [];
    let distArray = [];
    this.intMap.forEach((player, position) => {
      if (player === 0) {
        let [x, y] = position.split(",");
        positionArray.push(position);
        distArray.push(this.compareWithPoint(x, y));
      }
    });
    // sort distArray
    const sortedDistArray = distArray.map((value, index) => ({
      value: value,
      key: positionArray[index],
    }));
    sortedDistArray.sort((a, b) => a.value - b.value);
    // sort by the index of distArray
    return sortedDistArray.map((item) => item.key);
  }
  getScoresOfPosition(x, y, player) {
    // 3. get the scores of this game node.
    let scores = 0;
    let otherPlayer = player === 1 ? 2 : 1;
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // y = x
      [1, -1], // y = -x
    ];
    // 3.1. court how many piece connect between each other
    for (const [dx, dy] of directions) {
      let combo = 1; // include the first piece
      // same way
      for (let i = 1; i < numberOfWin; i++) {
        let position = `${x + i * dx},${y + i * dy}`;
        if (this.intMap.get(position) && this.intMap.get(position) === player) {
          combo++;
        } else if (
          this.intMap.get(position) &&
          this.intMap.get(position) === otherPlayer
        ) {
          combo = 0;
          break;
        } else {
          break;
        }
      }
      // 3.2. according to the number of connect, give scores of this game node.
      scores += comboScoresMap.get(combo);
      combo = 1;
      // opposite way
      for (let i = 1; i < numberOfWin; i++) {
        let position = `${x - i * dx},${y - i * dy}`;
        if (this.intMap.get(position) && this.intMap.get(position) === player) {
          combo++;
        } else if (
          this.intMap.get(position) &&
          this.intMap.get(position) === otherPlayer
        ) {
          combo = 0;
          break;
        } else {
          break;
        }
      }
      scores += comboScoresMap.get(combo);
    }
    return scores;
  }
  getScores() {
    let scores = 0;
    // player 1 (min player)
    this.pieceMap.get(1).forEach((position) => {
      let [x, y] = position.split(",");
      scores -= this.getScoresOfPosition(x, y, 1) * defenseVariable;
    });
    // player 2 (max player)
    this.pieceMap.get(2).forEach((position) => {
      let [x, y] = position.split(",");
      scores += this.getScoresOfPosition(x, y, 2);
    });
    return scores;
  }
}

class Base {
  constructor() {
    this.blockMap = new Map([]); // ['x,y', new block(x, y)]
    this.intMap = new Map([]); // ['x,y', i] i = {0, 1, 2}
    this.setUp();
    this.draw();
  }
  setUp() {
    for (let x = 0; x < baseWidth; x++) {
      for (let y = 0; y < baseHeight; y++) {
        this.blockMap.set(
          `${x},${y}`,
          new Block(x * blockWidth, y * blockHeight)
        );
        this.intMap.set(`${x},${y}`, 0);
      }
    }
    this.pieceInfor = new PieceInfor(this.intMap);
  }
  draw() {
    this.blockMap.forEach((block) => block.draw());
  }
  whichBlockPointing(x, y) {
    let row = Math.floor(x / blockWidth);
    let colum = Math.floor(y / blockHeight);
    return [row, colum];
  }
  setBlock(x, y, player) {
    this.getBlock(x, y).setPlayerStatus(player);
    this.pieceInfor.addPiece(x, y, player);
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
      // same way
      for (let i = 1; i < numberOfWin; i++) {
        if (
          this.getBlock(x + i * dx, y + i * dy) &&
          this.getBlock(x + i * dx, y + i * dy).getPlayerStatus() === player
        ) {
          count++;
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
        } else {
          break;
        }
      }
      if (count >= numberOfWin) {
        return true;
      }
    }
    return false;
  }
  // minimax part
  minimax(pieceInfor, depth, alpha, beta, isMax) {
    // isMax is true or false, false means player 1 (min player), true means player_2 (max player)
    // init alpha shound be -Infinity, init beta shound be +Infinity
    if (depth === 0 || pieceInfor.isWin()) {
      return pieceInfor.getScores();
    }
    if (isMax) {
      let maxEval = -Infinity;
      let player = 1;
      for (const position of pieceInfor.getTheChoice()) {
        let [x, y] = position.split(",");
        pieceInfor.addPiece(x, y, player);
        maxEval = Math.max(
          maxEval,
          this.minimax(pieceInfor, depth - 1, alpha, beta, false)
        );
        alpha = Math.max(alpha, maxEval);
        pieceInfor.removePiece(x, y, player);
        if (beta <= alpha) {
          break;
        }
      }
      return maxEval;
    } else {
      let minEval = +Infinity;
      let player = 2;
      for (const position of pieceInfor.getTheChoice()) {
        let [x, y] = position.split(",");
        pieceInfor.addPiece(x, y, player);
        minEval = Math.min(
          minEval,
          this.minimax(pieceInfor, depth - 1, alpha, beta, true)
        );
        beta = Math.min(beta, minEval);
        pieceInfor.removePiece(x, y, player);
        if (beta <= alpha) {
          break;
        }
      }
      return minEval;
    }
  }
  findBestPosition() {
    // only for PC is player 2
    let bestPosition = null;
    let bestEval = -Infinity;
    for (const position of this.pieceInfor.getTheChoice()) {
      let [x, y] = position.split(",");
      this.pieceInfor.addPiece(x, y, 2);
      let scores = this.minimax(
        this.pieceInfor,
        nodeDepth,
        -Infinity,
        +Infinity,
        true
      );
      this.pieceInfor.removePiece(x, y, 2);
      if (scores > bestEval) {
        bestEval = scores;
        bestPosition = position;
      }
    }
    return bestPosition;
  }
}

// findBestMove
// 1. get the map infor
// 2. sort all choice according the distance first so that the alpha beta cutting can speed up the minimax alg.
// 2.2. calcute the distance between the ave. position of origin pieces and the position of new piece.
// 2.3. according the distance to sort the choice position because the most close piece have higher chance to get hight scores
// 3. get the scores of this game node.
// 3.1. court how many piece connect between each other
// 3.2. according to the number of connect, give scores of this game node.
// 4. use minimax alg with alpha beta cutting
// 5. return the best move

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
  base.setBlock(row, colum, player);
  if (base.isWinInMap(row, colum, player)) {
    console.log(`player ${player} Win!`);
    isGameOver = true;
    base.draw();
    return;
  }
  playerStatus = !playerStatus;
  base.draw();

  // computer move
  let [bestX, bestY] = base.findBestPosition().split(",");
  [bestX, bestY] = [Number(bestX), Number(bestY)];
  base.setBlock(bestX, bestY, 2);
  if (base.isWinInMap(bestX, bestY, 2)) {
    console.log(`computer Win!`);
    isGameOver = true;
  }
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
