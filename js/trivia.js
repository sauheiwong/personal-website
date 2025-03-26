const container = document.querySelector(".container");
const finshMessageText = document.getElementById("finsh-message");
const popUpContainer = document.getElementById("pop-up-container");

const bonusMap = new Map([
  [10, { element: document.createElement("div"), money: 500000 }],
  [9, { element: document.createElement("div"), money: 300000 }],
  [8, { element: document.createElement("div"), money: 150000 }],
  [7, { element: document.createElement("div"), money: 100000 }],
  [6, { element: document.createElement("div"), money: 60000 }],
  [5, { element: document.createElement("div"), money: 40000 }],
  [4, { element: document.createElement("div"), money: 20000 }],
  [3, { element: document.createElement("div"), money: 10000 }],
  [2, { element: document.createElement("div"), money: 5000 }],
  [1, { element: document.createElement("div"), money: 1000 }],
  [0, { element: document.createElement("div"), money: 0 }],
]);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function speakText(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

class base {
  constructor() {
    this.questionArray = null;
    this.correctTime = 0;
    this.bonusMap = bonusMap;
    this.container = container;
    this.Card = null;
    this.answerMap = null;
    this.correctElement = null;
    this.answerStatus = false;
    this.bonusBar = document.querySelector(".bonus-bar");
    this.opitionDiv = document.querySelector(".opition");
  }
  setData(data) {
    this.questionArray = data;
    this.createBonusBar();
    this.showUp();
  }
  createBonusBar() {
    this.correctTime = 0;
    this.bonusMap.forEach((value, key) => {
      value.element.textContent = value.money;
      value.element.style.backgroundColor = "black";
      value.element.style.color = "white";
      this.bonusBar.appendChild(value.element);
    });
    this.changeBonusBar();
  }
  changeBonusBar() {
    this.bonusMap.forEach((value, key) => {
      if (this.correctTime >= key) {
        value.element.style.backgroundColor = "var(--highlight-color)";
        value.element.style.color = "black";
      }
    });
  }
  showUp() {
    document.querySelector(".answer-container").innerHTML = ""; // clear all the thing inside the answer container;
    document.querySelectorAll(".opition *").forEach((element) => {
      element.style.display = "none";
    });
    this.answerStatus = false;
    setTimeout(() => {
      let questionData = this.questionArray[this.correctTime];
      // question
      let questionP = document.querySelector(".question-p");
      questionP.textContent = "";
      questionP.textContent = questionData.question;
      questionP.style.opacity = "0";
      // answer
      let answerDiv = document.querySelector(".answer-container");
      const answerArray = [
        questionData.correct_answer,
        ...questionData.incorrect_answers,
      ];
      //  shuffle the answer array
      shuffle(answerArray);
      // set up the answer map
      this.answerMap = new Map([]);
      this.answerMap.set(questionData.correct_answer, true);
      questionData.incorrect_answers.forEach((answer) =>
        this.answerMap.set(answer, false)
      );
      // show the answer opition
      answerArray.forEach((answerText) => {
        const answer = document.createElement("div");
        answer.classList = "answer";
        answer.innerHTML = `<p>${answerText}</p>`;
        answerDiv.appendChild(answer);
      });
      // the qesution and answer will show up after the movement of card
      setTimeout(() => {
        questionP.style.opacity = "100%";
        // question will be spoken when it shows up
        speakText(`question ${this.correctTime + 1}
          ${questionData.question}
          `);
        document.querySelectorAll(".answer").forEach((element, index) => {
          // when mouse enter the answer element, use can hear the answer
          element.addEventListener("mouseenter", () =>
            speakText(element.textContent)
          );
          // when use click the answer element, check it is correct or not
          element.addEventListener("click", () =>
            this.answerIsCorrect(element)
          );
          // the answer element will show up by order
          setTimeout(
            () => (element.style.opacity = "100%"),
            500 * index + 1000
          );
        });
      }, 100);
    }, 1100);
  }
  answerIsCorrect(element) {
    // if use has chosen the answer, pass it
    if (this.answerStatus) {
      return;
    }
    let answer = element.textContent;
    if (this.answerMap.get(answer)) {
      // if use choose the correct answer, change the background color of the div and show the opition
      element.style.backgroundColor = "#0a0";
      speakText("Correct!");
      this.correctTime++;
      document.querySelectorAll(".opition *").forEach((element) => {
        element.style.display = "block";
      });
    } else {
      // if use choose an incorrect answer, change the background color of the div and show the correct answer and pop up message
      element.style.backgroundColor = "#a00";
      element.style.color = "white";
      this.correctTime = 0;
      this.editFinshContainer("incorrect");
    }
    this.changeBonusBar();
    document.querySelectorAll(".answer").forEach((elementLoop) => {
      if (this.answerMap.get(elementLoop.textContent)) {
        elementLoop.style.backgroundColor = "#0a0";
      }
    });
    this.answerStatus = true;
  }
  next() {
    // question
    document.querySelector(".question-p").style.opacity = "0";
    document
      .querySelectorAll(".answer-container *")
      .forEach((element) => (element.style.opacity = "0"));
    document.querySelector(".answer-container").innerHTML = ""; // clear all the thing inside the answer container;
    document.querySelectorAll(".opition *").forEach((element) => {
      element.style.display = "none";
    });
    this.answerStatus = false;
    this.showUp();
  }
  editFinshContainer(result) {
    switch (result) {
      case "reset":
        popUpContainer.style.left = "-50%";
        finshMessageText.textContent = "";
        getQuestions();
        return;
      case "ok":
        popUpContainer.style.left = "-50%";
        finshMessageText.textContent = "";
        return;
      case "quit":
        finshMessageText.textContent = `You leave with $${
          this.bonusMap.get(this.correctTime).money
        }🤩`;
        break;
      case "incorrect":
        finshMessageText.textContent = "You leave with nothing😭";
        break;
      case "allCorrect":
        finshMessageText.textContent = "OMG You got 500,000!🎉";
        break;
    }
    popUpContainer.style.left = "37.5%";
  }
}

let Base = null;

async function getQuestions() {
  const response = await fetch(
    "https://opentdb.com/api.php?amount=10&category=17&difficulty=easy&type=multiple"
  );
  let data = await response.json();
  data = data.results;
  Base = new base();
  Base.setData(data);
  document.querySelector(".quit").addEventListener("click", () => {
    Base.editFinshContainer("quit");
  });

  document.querySelector(".next-question").addEventListener("click", () => {
    Base.next();
  });

  document.querySelector("#ok").addEventListener("click", () => {
    Base.editFinshContainer("ok");
  });

  document.querySelector("#restart").addEventListener("click", () => {
    Base.editFinshContainer("reset");
  });
}

getQuestions();
