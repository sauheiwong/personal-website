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
      ["area-6", 0], // 1 means cross   ❌
      ["area-7", 0], // 2 means circle  ⭕
      ["area-8", 0],
      ["area-9", 0],
    ]);
    this.round = 0; // The round of the game
  }
  // Set the area with the player
  setArea(area_id, player) {
    this.areaMap.set(area_id, player); // Set the area with the player
    let area = document.getElementById(area_id);
    area.style.backgroundSize = "100% 100%"; // Set the background size to 100% 100% so that the image will fit the area
    if (player === 1) {
      area.style.backgroundImage = "url('../img/game/cross.png')"; // Set the background image to cross
    } else {
      area.style.backgroundImage = "url('../img/game/circle.png')"; // Set the background image to circle
    }
    this.round++; // Increase the round
  }
  // Get the area
  getArea(area_id) {
    return this.areaMap.get(area_id);
  }

  // Check if there is a winner
  checkWin() {
    const winList = [
      ["area-1", "area-2", "area-3"],
      ["area-4", "area-5", "area-6"],
      ["area-7", "area-8", "area-9"],
      ["area-1", "area-4", "area-7"],
      ["area-2", "area-5", "area-8"],
      ["area-3", "area-6", "area-9"],
      ["area-1", "area-5", "area-9"],
      ["area-3", "area-5", "area-7"],
    ];
    for (let winListElement of winList) {
      let [a, b, c] = winListElement;
      if (
        this.getArea(a) === this.getArea(b) &&
        this.getArea(b) === this.getArea(c) &&
        this.getArea(a) !== 0
      ) {
        document.getElementById("restart").style.display = "block"; // Display the restart button
        return 1; // If there is a winner, return 1
      }
    }
    return 0; // If there is no winner, return 0
  }
  // Reset the game
  reset() {
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
}

document.getElementById("restart").addEventListener("click", () => {
  base.reset(); // Reset the game
  document.getElementById("restart").style.display = "none"; // Hide the restart button
});

const base = new Base(); // Create a new instance of a new game
let player = 1; // 1 means cross, 2 means circle

// how the web know user click which area
[...document.getElementsByClassName("area")].forEach((area) => {
  area.addEventListener("click", () => {
    if (base.getArea(area.id) !== 0) {
      alert(
        `This area has been click by ${
          base.getArea(area.id) === 1 ? "player_1" : "player_2"
        }`
      );
      return; // If the area is not empty, give an alert
    }
    console.log(area.id);
    base.setArea(area.id, player);
    if (base.checkWin() === 1) {
      alert(`Player ${player === 1 ? "player_1" : "player_2"} wins!`);
      return; // If there is a winner, give an alert
    }
    if (base.round === 9) {
      alert("Draw!");
      return; // If it is a draw, give an alert
    }
    player = player === 1 ? (player = 2) : (player = 1); // Change the player after click
  });
});
//
