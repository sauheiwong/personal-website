const myCanvas = document.querySelector("canvas");
const ctx = myCanvas.getContext("2d");

const lineWidth = 3;

const blockWidth = 50;
const blockHeight = 50;
const circleRadius = 15;

const baseWidth = 15;
const baseHeight = 15;

const numberOfWin = 5;

const nodeDepth = 1; // total depth is nodeDepth + 1

const defenseVariable = 10; // > 1 means defense first, < 1 means attack first

let playerStatus = false; // false means player_1 round (min player), true means player_2 round (max player)
let isGameOver = false;

const scoresWithoutBlockedMap = new Map([
  // 0 means no piece, 1 means 1 piece connect, 2 means 2 pieces connect, 3 means 3 pieces connect, 4 means 4 pieces connect, 5 means 5 pieces connect
  [0, 0],
  [1, 10 ** 1],
  [2, 10 ** 2],
  [3, 10 ** 3],
  [4, 10 ** 4],
  [5, 10 ** 10],
]);

const scoresWithBlockedMap = new Map([
  // It needs to be negative value so the computer will defense first
  [0, 0],
  [1, -5],
  [2, -50],
  [3, -500],
  [4, -5000],
]);

class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.draw();
    this.playerStatus = 0; // 0 means empty, 1 means player_1, 2 means player_2
    this.isPointed = false; // mark if user is pointing this block
  }

  /**
   * Set the player status
   * @param {number} s - The player status
   */
  setPlayerStatus(s) {
    this.playerStatus = s;
  }

  /**
   * Get the player status
   * @returns {number} The player status
   */
  getPlayerStatus() {
    return this.playerStatus;
  }

  /**
   * Set the pointed status
   * @param {boolean} isPointed - The pointed status
   */
  setIsPointed(isPointed) {
    this.isPointed = isPointed;
  }

  /**
   * Draw the block in the canvas
   */
  draw() {
    // --- Fill the block itself ---
    ctx.beginPath();
    ctx.rect(this.x, this.y, blockWidth, blockHeight);
    ctx.fillStyle = "#f90";
    ctx.fill();
    ctx.closePath();

    // --- Draw the row line ---
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(this.x + blockWidth / 2, this.y);
    ctx.lineTo(this.x + blockWidth / 2, this.y + blockHeight);
    ctx.stroke();
    ctx.closePath();

    // --- Draw the colum line ---
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + blockHeight / 2);
    ctx.lineTo(this.x + blockWidth, this.y + blockHeight / 2);
    ctx.stroke();
    ctx.closePath();

    // --- Draw the circle if user is pointing this block ---
    if (this.isPointed) {
      ctx.beginPath();
      ctx.arc(
        this.x + blockWidth / 2,
        this.y + blockHeight / 2,
        circleRadius,
        0,
        2 * Math.PI,
      );
      ctx.lineWidth = 2;
      if (playerStatus) {
        ctx.strokeStyle = "white";
      } else {
        ctx.strokeStyle = "black";
      }
      ctx.stroke();
    }

    /**
     * Draw the piece in the canvas
     * @param {0 | 1 | 2} player - The player status
     */
    const drawPiece = (player) => {
      if (player === 0) return;
      ctx.beginPath();
      ctx.arc(
        this.x + blockWidth / 2,
        this.y + blockHeight / 2,
        circleRadius,
        0,
        2 * Math.PI,
      );
      ctx.lineWidth = 2;
      if (player === 1) {
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
      } else {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
      }
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    };

    drawPiece(this.playerStatus);
  }
}

// class to record the information of the pieces with map
class PieceInfor {
  constructor(intMap) {
    // pieces information
    this.pieceMap = new Map([
      [1, []],
      [2, []],
    ]);
    // combo map, combo means the consecutive pieces that connect together
    this.comboMap = new Map([
      [1, []],
      [2, []],
    ]);
    // intMap to record the pieces information
    this.intMap = intMap;
    this.n = 0; // number of pieces
    // --- the information for calculate the score ---
    this.meanX = 0; // mean x coordinate
    this.meanY = 0; // mean y coordinate
    this.scores = 0; // scores of the board
    // ----------------------------------------
    this.winer = null; // winner
  }

  /**
   * Add a piece to the board
   * @param {number} x - The x coordinate of the piece
   * @param {number} y - The y coordinate of the piece
   * @param {0 | 1 | 2} player - The player status
   */
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

  /**
   * Remove a piece from the board
   * Use it when backtracking
   * @param {number} x - The x coordinate of the piece
   * @param {number} y - The y coordinate of the piece
   * @param {0 | 1 | 2} player - The player status
   * @returns {void}
   */
  removePiece(x, y, player) {
    // use math to speed up rather than calcute the ave. everytime
    this.pieceMap.set(
      player,
      this.pieceMap.get(player).filter((position) => position != `${x},${y}`),
    );
    // set the point to empty
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
  /**
   * Calculate the distance between the ave. position and the new piece
   * @param {number} x - The x coordinate of the piece
   * @param {number} y - The y coordinate of the piece
   * @returns {number} The distance between the ave. position and the new piece
   */
  compareWithPoint(x, y) {
    return (x - this.meanX) ** 2 + (y - this.meanY) ** 2;
  }

  isOutOfBounds(x, y) {
    return x < 0 || x >= baseWidth || y < 0 || y >= baseHeight;
  }

  /**
   * Check if the piece is a winning piece
   * @param {number} x - The x coordinate of the piece
   * @param {number} y - The y coordinate of the piece
   * @param {0 | 1 | 2} player - The player status
   * @returns {boolean} True if the piece is a winning piece, false otherwise
   */
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
        if (this.isOutOfBounds(x + i * dx, y + i * dy)) break;
        let position = `${x + i * dx},${y + i * dy}`;
        if (this.intMap.get(position) && this.intMap.get(position) === player) {
          count++;
        } else {
          break;
        }
      }
      // opposite way
      for (let i = 1; i < numberOfWin; i++) {
        if (this.isOutOfBounds(x - i * dx, y - i * dy)) break;
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

  /**
   * Check if the board has a winner
   * @returns {boolean} True if the board has a winner, false otherwise
   */
  isWin() {
    for (const position of this.pieceMap.get(1)) {
      let [x, y] = position.split(",");
      if (this.isWinOfPosition(x, y, 1)) {
        this.winer = 1;
        return true;
      }
    }
    for (const position of this.pieceMap.get(2)) {
      let [x, y] = position.split(",");
      if (this.isWinOfPosition(x, y, 2)) {
        this.winer = 2;
        return true;
      }
    }
    return false;
  }

  /**
   * Get the best choice for the current player
   * Sort all choice according the distance so that the alpha beta cutting can speed up the minimax alg.
   * @returns {string} The best choice for the current player
   */
  getTheChoice() {
    let positionArray = [];
    let distArray = [];
    this.intMap.forEach((player, position) => {
      // find the empty points
      if (player === 0) {
        let [x, y] = position.split(",");
        positionArray.push(position);
        // calculate the distance between the empty point and the center of the board
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

  /**
   * Get the score of the current state
   * @param {number} x - The x coordinate of the piece
   * @param {number} y - The y coordinate of the piece
   * @param {0 | 1 | 2} player - The player status
   * @returns {number} The score of the current state
   */
  getScoresOfPosition(x, y, player) {
    // 3. get the scores of this game node.
    let scores = 0;
    let otherPlayer = player === 1 ? 2 : 1;
    let courtedCombination = this.comboMap.get(player);
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // y = x
      [1, -1], // y = -x
    ];
    // 3.1. court how many piece connect between each other
    for (const [dx, dy] of directions) {
      let combination = `(${x},${y})`;
      let blocked = 0;
      let combo = 1;
      // same way
      for (let i = 1; i < numberOfWin; i++) {
        if (this.isOutOfBounds(x + i * dx, y + i * dy)) {
          blocked++;
          break;
        }
        let position = `${x + i * dx},${y + i * dy}`;
        if (this.intMap.get(position) && this.intMap.get(position) === player) {
          combination = combination + `,(${position})`;
          combo++;
        } else if (
          // if blocked by other player, then add the blocked variable, and break
          this.intMap.get(position) &&
          this.intMap.get(position) === otherPlayer
        ) {
          blocked++;
          break;
        } else {
          break;
        }
      }
      // opposite way
      for (let i = 1; i < numberOfWin; i++) {
        if (this.isOutOfBounds(x - i * dx, y - i * dy)) {
          blocked++;
          break;
        }
        let position = `${x - i * dx},${y - i * dy}`;
        if (this.intMap.get(position) && this.intMap.get(position) === player) {
          combination = `(${position}),` + combination;
          combo++;
        } else if (
          this.intMap.get(position) &&
          this.intMap.get(position) === otherPlayer
        ) {
          blocked++;
          break;
        } else {
          break;
        }
      }
      if (!courtedCombination.includes(combination)) {
        courtedCombination.push(combination);
        switch (blocked) {
          // if blocked by two side, then it is useless
          case 2:
            scores += 0;
            break;
          case 1:
            // if blocked by one side, then it is valuable
            scores += scoresWithBlockedMap.get(combo);
            break;
          case 0:
            // if not blocked, then it is more valuable
            scores += scoresWithoutBlockedMap.get(combo);
            break;
        }
      }
    }
    return scores;
  }
  getScores() {
    let scores = 0;
    this.comboMap = new Map([
      [1, []],
      [2, []],
    ]);
    // player 1 (min player)
    this.pieceMap.get(1).forEach((position) => {
      let [x, y] = position.split(",");
      scores -=
        this.getScoresOfPosition(Number(x), Number(y), 1) * defenseVariable;
    });
    // player 2 (max player)
    this.pieceMap.get(2).forEach((position) => {
      let [x, y] = position.split(",");
      scores += this.getScoresOfPosition(Number(x), Number(y), 2);
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

  /**
   * Set up the base
   */
  setUp() {
    for (let x = 0; x < baseWidth; x++) {
      for (let y = 0; y < baseHeight; y++) {
        this.blockMap.set(
          `${x},${y}`,
          new Block(x * blockWidth, y * blockHeight),
        );
        this.intMap.set(`${x},${y}`, 0);
      }
    }
    this.pieceInfor = new PieceInfor(this.intMap);
  }

  /**
   * Draw the base
   */
  draw() {
    this.blockMap.forEach((block) => block.draw());
  }

  /**
   * Get the block that the mouse is pointing to
   * @param {number} x - The x coordinate of the mouse
   * @param {number} y - The y coordinate of the mouse
   * @returns {[number, number]} The row and column of the block
   */
  whichBlockPointing(x, y) {
    let row = Math.floor(x / blockWidth);
    let colum = Math.floor(y / blockHeight);
    return [row, colum];
  }

  /**
   * Set the block to a player
   * @param {number} x - The x coordinate of the block
   * @param {number} y - The y coordinate of the block
   * @param {0 | 1 | 2} player - The player status
   */
  setBlock(x, y, player) {
    this.getBlock(x, y).setPlayerStatus(player);
    this.pieceInfor.addPiece(x, y, player);
  }

  /**
   * Get the block at the given coordinates
   * @param {number} x - The x coordinate of the block
   * @param {number} y - The y coordinate of the block
   * @returns {Block} The block at the given coordinates
   */
  getBlock(x, y) {
    return this.blockMap.get(`${x},${y}`);
  }

  /**
   * Check if the piece is a winning piece
   * @param {number} x - The x coordinate of the piece
   * @param {number} y - The y coordinate of the piece
   * @param {0 | 1 | 2} player - The player status
   * @returns {boolean} True if the piece is a winning piece, false otherwise
   */
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

  /**
   * Minimax algorithm with alpha-beta cutting
   * @param {PieceInfor} pieceInfor - The piece information
   * @param {number} depth - The depth of the minimax algorithm
   * @param {number} alpha - The alpha value
   * @param {number} beta - The beta value
   * @param {boolean} isMax - True if the current player is the maximizer, false otherwise
   * @returns {number} The score of the current state
   */
  minimax(pieceInfor, depth, alpha, beta, isMax) {
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
          this.minimax(pieceInfor, depth - 1, alpha, beta, false),
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
          this.minimax(pieceInfor, depth - 1, alpha, beta, true),
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

  /**
   * Find the best position for AI/PC
   * ONLY for AI/PC is player 2
   * @returns {string} The best position for the AI/PC
   */
  findBestPosition() {
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
        true,
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

// --- workflow of findBestMove ---
// 1. get the map infor
// 2. sort all choice according the distance between the center of all pieces and the new piece so that the alpha beta cutting can speed up the minimax alg.
// --- explain about this step ---
// in a game, those piece will be put close to other piece, because it will make combo with other piece or block the opponent's combo,
// so we can sort the choice position according the distance between the center of all pieces and the new piece.
// closer the distance, higher the chance to get higher scores, so alpha-beta cutting will run faster because the best move will be found faster.
// ---------------------------
// 2.2. calcute the distance between the ave. position of origin pieces and the position of new piece.
// 2.3. according the distance to sort the choice position because the most close piece have higher chance to get hight scores
// 3. get the scores of this game node.
// 3.1. court how many piece connect between each other
// 3.2. according to the number of connect, give scores of this game node.
// 4. use minimax alg with alpha beta cutting
// 5. return the best move
// --- end of workflow ---

const base = new Base();
const finshMessageText = document.querySelector("#finsh-message");
const popUpContainer = document.getElementById("pop-up-container");

const editFinshContainer = (result) => {
  switch (result) {
    case "reset":
      popUpContainer.style.left = "-50%";
      finshMessageText.innerHTML = "";
      isGameOver = false;
      base.setUp();
      base.draw();
      return;
    case "player1":
      finshMessageText.innerHTML = "You Win!🎉";
      break;
    case "player2":
      finshMessageText.innerHTML = "(My) Computer Win!😉";
      break;
  }
  popUpContainer.style.left = "37.5%";
};

document
  .querySelector("#restart")
  .addEventListener("click", () => editFinshContainer("reset"));

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
    isGameOver = true;
    base.draw();
    editFinshContainer(`player1`);
    return;
  }
  playerStatus = !playerStatus;
  base.draw();
  document.querySelector("#loading-spinner").style.display = "block";
  // computer move
  setTimeout(() => {
    let [bestX, bestY] = base.findBestPosition().split(",");
    [bestX, bestY] = [Number(bestX), Number(bestY)];
    base.setBlock(bestX, bestY, 2);
    if (base.isWinInMap(bestX, bestY, 2)) {
      isGameOver = true;
      editFinshContainer(`player2`);
    }
    playerStatus = !playerStatus;
    base.draw();
    document.querySelector("#loading-spinner").style.display = "none";
  }, 10);
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
