class Base {
  // The information of the game will be stored in this class
  constructor() {
    this.areaMap = new Map([
      // The grid representation of the game
      ["area-1", 0], // 1,2,3
      ["area-2", 0], // 4,5,6
      ["area-3", 0], // 7,8,9
      ["area-4", 0],
      ["area-5", 0], // 0 means empty
      ["area-6", 0], // 1 means cross(player)   ❌
      ["area-7", 0], // 2 means circle(computer)  ⭕
      ["area-8", 0],
      ["area-9", 0],
    ]);
    this.round = 0; // The round of the game
    this.winList = [
      ["area-1", "area-2", "area-3"],
      ["area-4", "area-5", "area-6"],
      ["area-7", "area-8", "area-9"],
      ["area-1", "area-4", "area-7"],
      ["area-2", "area-5", "area-8"],
      ["area-3", "area-6", "area-9"],
      ["area-1", "area-5", "area-9"],
      ["area-3", "area-5", "area-7"],
    ];
  }

  setArea(area_id, player) {
    // Set the area with the player
    this.areaMap.set(area_id, player); // Set the area with the player
    let area = document.getElementById(area_id);
    area.style.backgroundSize = "100% 100%"; // Set the background size to 100% 100% so that the image will fit the area
    if (player === 1) {
      area.style.backgroundImage = "url('../img/game/cross.png')"; // Set the background image to cross
    } else {
      area.style.backgroundImage = "url('../img/game/circle.png')"; // Set the background image to circle
    }
    this.round++; // Increase the round
    player = player === 1 ? (player = 2) : (player = 1); // Change the player after seting a new area
  }

  getArea(area_id) {
    // Get the area
    return this.areaMap.get(area_id);
  }

  checkWin() {
    // Check if there is a winner
    for (let winListElement of this.winList) {
      let [a, b, c] = winListElement;
      if (
        this.getArea(a) === this.getArea(b) &&
        this.getArea(b) === this.getArea(c) &&
        this.getArea(a) !== 0
      ) {
        return 1; // If there is a winner, return 1
      }
    }
    return 0; // If there is no winner, return 0
  }

  reset() {
    // Reset the game
    this.areaMap = new Map([
      ["area-1", 0],
      ["area-2", 0],
      ["area-3", 0],
      ["area-4", 0],
      ["area-5", 0],
      ["area-6", 0],
      ["area-7", 0],
      ["area-8", 0],
      ["area-9", 0],
    ]);
    this.round = 0;
    [...document.getElementsByClassName("area")].forEach((area) => {
      area.style.backgroundImage = ""; // Reset the background image
    });
  }

  findEmptyArea() {
    // Find the empty area
    let emptyArea = [];
    for (let [key, value] of this.areaMap) {
      if (value === 0) {
        emptyArea.push(key);
      }
    }
    return emptyArea;
  }

  canComputerWin(emptyArea) {
    for (let emptyAreaElement of emptyArea) {
      this.areaMap.set(emptyAreaElement, 2); // assume the computer will set the area
      // console.log(`defense test area ${emptyAreaElement}`);
      for (let winListElement of this.winList) {
        let [a, b, c] = winListElement;
        if (
          this.getArea(a) === this.getArea(b) &&
          this.getArea(b) === this.getArea(c) &&
          this.getArea(a) !== 0
        ) {
          this.areaMap.set(emptyAreaElement, 0); // reset the area
          this.setArea(emptyAreaElement, 2); // set the area with the computer
          return 1; // If the computer can win, return
        }
      }
      this.areaMap.set(emptyAreaElement, 0); // reset the area
    }
    return 0; // If the computer cannot win, return 0
  }

  defense(emptyArea) {
    // Computer defense
    // Defense means the computer finds the area which player will win in the next round if they set the area in the next round
    // If the computer finds the area the computer will set the area
    // If the computer needs to defense, return 1
    // If the computer does not need to defense, return 0
    for (let emptyAreaElement of emptyArea) {
      this.areaMap.set(emptyAreaElement, 1); // assume the player will set the area
      // console.log(`defense test area ${emptyAreaElement}`);
      for (let winListElement of this.winList) {
        let [a, b, c] = winListElement;
        if (
          this.getArea(a) === this.getArea(b) &&
          this.getArea(b) === this.getArea(c) &&
          this.getArea(a) !== 0
        ) {
          this.areaMap.set(emptyAreaElement, 0); // reset the area
          this.setArea(emptyAreaElement, 2); // set the area with the computer
          console.log("defense");
          console.log(emptyAreaElement);
          return 1; // If the computer needs to defense, return 1
        }
      }
      this.areaMap.set(emptyAreaElement, 0); // reset the area
    }
    return 0; // If the computer does not need to defense, return 0
  }

  heightWinningChance(emptyArea) {
    // 3.1  find any area which computer can win if the computer set the area
    // 3.2. the most winning chance means the area has the hightest frequency in the winList for the computer
    // 3.3. if the computer finds the area which has the most winning chance, the computer will set the area
    // 3.4. return the area
    let maxWinningChance = 0;
    let bestMove = "";
    for (let emptyAreaElement of emptyArea) {
      let winningChance = 0;
      for (let winListElement of this.winList) {
        let [a, b, c] = winListElement;
        if (
          a === emptyAreaElement ||
          b === emptyAreaElement ||
          c === emptyAreaElement
        ) {
          if (
            this.getArea(a) !== 1 &&
            this.getArea(b) !== 1 &&
            this.getArea(c) !== 1
          ) {
            winningChance++;
          }
        }
      }
      if (winningChance > maxWinningChance) {
        maxWinningChance = winningChance;
        bestMove = emptyAreaElement;
      }
    }
    if (maxWinningChance === 0) {
      // If the computer does not find the area which has the most winning chance, the computer will set the area randomly
      bestMove = emptyArea[Math.floor(Math.random() * emptyArea.length)];
    }
    this.setArea(bestMove, 2); // Set the area with the computer
  }

  // Find the best move for the computer
  // 1. find the empty area
  // 2. if the computer can win, the computer will set the area
  // 3. computer defense
  // 3.1. defense means the computer finds the area which player will win in the next round if they set the area in the next round
  // 3.2. if the computer finds the area which player will win in the next round, the computer will set the area
  // 3.3.1 if the computer needs to defense, return 1
  // 3.3.2 if the computer does not need to defense, return 0
  // 4. find which area has the most winning chance if the computer does not need to defense
  // 4.1  find any area which computer can win if the computer set the area
  // 4.2. the most winning chance means the area has the hightest frequency in the winList for the computer
  // 4.3. if the computer finds the area which has the most winning chance, the computer will set the area
  // 4.4. return the area
  // 5. set the area with the computer
  findBestMove() {
    let emptyArea = this.findEmptyArea();
    if (this.canComputerWin(emptyArea) === 1) {
      finshMessage("player_2");
      winStatus = true;
      return;
    }
    if (this.defense(emptyArea) == 1) {
      return;
    }
    this.heightWinningChance(emptyArea);
    if (this.checkWin() === 1) {
      finshMessage(`${player === 1 ? "player_1" : "computer"} Win!`);
      winStatus = true;
      return; // If there is a winner, give an alert
    }
  }
}

const base = new Base(); // Create a new instance of a new game
let player = 1; // 1 means cross(player), 2 means circle(computer)
const finshMessageText = document.getElementById("finsh-message");
const popUpContainer = document.getElementById("pop-up-container");
const restart2Button = document.getElementById("restart-2");
let winStatus = false; // if false, player can not click the area, if true, player can click

const restartFunc = () => {
  base.reset(); // Reset the game
  popUpContainer.style.display = "none"; // Hide the pop up
  restart2Button.style.display = "none";
  winStatus = false;
};

restart2Button.addEventListener("click", restartFunc);

document.getElementById("restart").addEventListener("click", restartFunc);

document.getElementById("ok").addEventListener("click", () => {
  popUpContainer.style.display = "none"; // Hide the pop up
  document.getElementById("restart-2").style.display = "flex";
});

const finshMessage = (result) => {
  popUpContainer.style.display = "block";
  switch (result) {
    case "player_1":
      finshMessageText.textContent = "player 1 Win!🎉";
      break;
    case "player_2":
      finshMessageText.textContent = "Computer Win!💻";
      break;
    case "draw":
      finshMessageText.textContent = "Draw!";
      break;
  }
};

// how the web know user click which area
[...document.getElementsByClassName("area")].forEach((area) => {
  area.addEventListener("click", () => {
    if (winStatus) {
      return;
    }
    player = 1;
    if (base.getArea(area.id) !== 0) {
      alert(
        `This area has been click by ${
          base.getArea(area.id) === 1 ? "player_1" : "player_2"
        }`
      );
      return; // If the area is not empty, give an alert
    }
    base.setArea(area.id, player);
    console.log(`round ${base.round}`);
    console.log(player);
    if (base.checkWin() === 1) {
      finshMessage(player === 1 ? "player_1" : "player_2");
      winStatus = true;
      return; // If there is a winner, give an alert
    }
    if (base.round === 9) {
      finshMessage("draw");
      winStatus = true;
      return; // If it is a draw, give an alert
    }
    if (player === 1) {
      base.findBestMove(); // Find the best move for the computer
      player = 2;
    }
  });
});
//
