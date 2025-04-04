const myCanvas = document.querySelector("canvas");
const ctx = myCanvas.getContext("2d");

const blockWidth = 50;
const blockHeight = 50;
const circleRadius = 15;

const baseWidth = 15;
const baseHeight = 15;

const numberOfWin = 5;

const nodeBreadth = 20;
const nodeDepth = 5;

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

class Base {
  constructor() {
    this.blockMap = new Map([]); // ['x,y', new block(x, y)]
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
  getIntMap() {
    // 1. get the map infor
    const intMap = new Map([]);
    this.blockMap.forEach((block, position) =>
      intMap.set(position, block.getPlayerStatus())
    );
    return intMap;
  }
  getTheDeltaOfIntMap(intMap) {
    // 2. decide which N areas should be included into the game tree.
    // 2.1. get all piece of both player
    // 2.2. use sparation function to calcute the ave. different between the ave. position and each position of piece.
    const mapInfor = new Map([
      [1, { x: 0, y: 0, positionArray: [] }],
      [2, { x: 0, y: 0, positionArray: [] }],
    ]);
    intMap.forEach((player, position) => {
      if (player !== 0) {
        let [newX, newY] = position.split(",");
        [newX, newY] = [Number(newX), Number(newY)];
        let aveObj = mapInfor.get(player);
        if (aveObj.positionArray.length === 0) {
          aveObj.x = newX;
          aveObj.y = newY;
        } else {
          let n = aveObj.positionArray.length;
          aveObj.x = (newX + aveObj.x * n) / (n + 1);
          aveObj.y = (newY + aveObj.y * n) / (n + 1);
        }
        aveObj.positionArray.push({ x: newX, y: newY });
      }
    });
    return [
      this.separationFunction(mapInfor.get(1)),
      this.separationFunction(mapInfor.get(2)),
    ];
  }
  separationFunction({ x, y, positionArray }) {
    let delta = 0;
    positionArray.forEach((position) => {
      delta += (x - position.x) ** 2 + (y - position.y) ** 2;
    });
    return delta;
  }
  isGameOverInIntMap(intMap) {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // y = x
      [1, -1], // y = -x
    ];
    for (const [position, player] of intMap) {
      let [x, y] = position.split(",");
      [x, y] = [Number(x), Number(y)];
      if (player !== 0) {
        for (const [dx, dy] of directions) {
          let count = 1; // include the first piece
          // same way
          for (let i = 1; i < numberOfWin; i++) {
            if (
              intMap.get(`${x + i * dx},${y + i * dy}`) &&
              intMap.get(`${x + i * dx},${y + i * dy}`) === player
            ) {
              count++;
            } else {
              break;
            }
          }
          // opposite way
          for (let i = 1; i < numberOfWin; i++) {
            if (
              intMap.get(`${x - i * dx},${y - i * dy}`) &&
              intMap.get(`${x - i * dx},${y - i * dy}`) === player
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
    }
  }
  covertCombination(combination) {
    // covert origin combination (legth >= numberOfWin) to noraml (legth === numberOfWin) combination
    let combinationArray = []; // contain the normal combination
    let i = 0;
    while (i + numberOfWin <= combination.length) {
      combinationArray.push(
        combination.filter(
          (value, index) => index >= i && index < i + numberOfWin
        )
      );
      i++;
    }
    return combinationArray;
  }
  getCombinationOfPosition(x, y, intMap) {
    // get the combination of this position
    let combinationArray = [];
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // y = x
      [1, -1], // y = -x
    ];
    for (const [dx, dy] of directions) {
      let combination = [`${x},${y}`];
      // same way
      for (let i = 1; i < numberOfWin; i++) {
        let position = `${x + i * dx},${y + i * dy}`;
        if (intMap.get(position) >= 0) {
          combination.push(position); // here use push so the position will be placed in order
        } else {
          break;
        }
      }
      // opposite way
      for (let i = 1; i < numberOfWin; i++) {
        let position = `${x - i * dx},${y - i * dy}`;
        if (intMap.get(position) >= 0) {
          combination.unshift(position); // unshift use push so the position will be placed in order
        } else {
          break;
        }
      }
      if (combination.length >= numberOfWin) {
        combinationArray = [
          ...combinationArray,
          ...this.covertCombination(combination),
        ];
      }
    }
    return combinationArray;
  }
  getScoresOfCombination(combination, intMap, player) {
    let combo = 0;
    let otherplayer = player === 1 ? 2 : 1;
    for (const position of combination) {
      if (intMap.get(position) === player) {
        combo++;
      } else if (intMap.get(position) === otherplayer) {
        return 0;
      }
    }
    return comboScoresMap.get(combo);
  }
  getScoresOfIntMap(intMap) {
    // 3. get the scores of this game node.
    let scores = 0;
    const scoresMap = new Map([
      [1, []], // the array contains the combination set of player 1
      [2, []],
    ]);
    // 3.1. get how many and where the piece of player are
    // 3.2. court how many piece connect between each other
    // 3.3. according to the number of connect, give scores of this game node.
    for (const [position, player] of intMap) {
      if (player != 0) {
        let [x, y] = position.split(",");
        [x, y] = [Number(x), Number(y)];
        let combinationArray = this.getCombinationOfPosition(x, y, intMap);
        combinationArray = combinationArray.filter(
          // filter those overlap with those exist in scoresMap
          (value) =>
            !scoresMap.get(player).some(
              (combination) =>
                combination[0] === value[0] &&
                combination[numberOfWin - 1] === value[numberOfWin - 1]
              // because they have been placed in order so only consider the first and last one
            )
        );
        scoresMap.set(player, [...scoresMap.get(player), ...combinationArray]);
      }
    }
    scoresMap.forEach((combinationArray, player) => {
      if (player === 1) {
        for (const combination of combinationArray) {
          scores -= this.getScoresOfCombination(combination, intMap, player);
        }
      } else {
        for (const combination of combinationArray) {
          scores += this.getScoresOfCombination(combination, intMap, player);
        }
      }
    });
    return scores;
  }
  minimax(intMap, depth, isMax, player) {
    // isMax is true or false, false means player 1 (min player), true means player_2 (max player)
    if (depth === 0 || this.isGameOverInIntMap(intMap)) {
      return this.getScoresOfIntMap(intMap);
    }

    // 2.3. only include the first nodeBreadth areas into the game tree.
    if (isMax) {
      let maxEval = -Infinity;
      let considerPosition = [];
      let considerPositionDelta = [];
      // get all the delta in each position
      for (let x = 0; x < blockWidth; x++) {
        for (let y = 0; y < blockHeight; y++) {
          let position = `${x},${y}`;
          if (intMap.get(position) === 0) {
            intMap.set(position, player);
            considerPosition.push(position);
            considerPositionDelta.push(
              this.getTheDeltaOfIntMap(intMap)[player - 1]
            );
            intMap.set(position, 0);
          }
        }
      }
      const sortedConsiderPositionDelta = considerPositionDelta.map(
        (value, index) => ({
          value: value,
          key: considerPosition[index],
        })
      );

      // sort considerPositionDelta
      sortedConsiderPositionDelta.sort((a, b) => a.value - b.value);
      // sort by the index of considerPositionDelta and only get the first nodeBreadth element
      const sortedConsiderPosition = sortedConsiderPositionDelta
        .map((item) => item.key)
        .filter((value, index) => index >= 0 && index < nodeBreadth);
    } else {
    }
  }
}

// scores system
// 1. get the map infor
// 2. decide which N areas should be included into the game tree.
// 2.1. get all piece of both player
// 2.2. use sparation function to calcute the ave. different between the ave. position and each position of piece.
// 2.3. only include the first nodeBreadth areas into the game tree.
// 3. get the scores of this game node.
// 3.1. get how many and where the piece of player are
// 3.2. court how many piece connect between each other
// 3.3. according to the number of connect, give scores of this game node.

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
  const intMap = base.getIntMap();
  console.log(base.getScoresOfIntMap(intMap));
  if (base.isWinInMap(row, colum, player)) {
    console.log(`player ${player} Win!`);
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
