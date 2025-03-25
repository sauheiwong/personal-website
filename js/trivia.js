const sample = {
  response_code: 0,
  results: [
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question:
        "Rhinoplasty is a surgical procedure on what part of the human body?",
      correct_answer: "Nose",
      incorrect_answers: ["Ears", "Chin", "Neck"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question: "Which element has the highest melting point?",
      correct_answer: "Carbon",
      incorrect_answers: ["Tungsten", "Platinum", "Osmium"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question: "What is the primary addictive substance found in tobacco?",
      correct_answer: "Nicotine",
      incorrect_answers: ["Cathinone", "Ephedrine", "Glaucine"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question: "Which of these bones is hardest to break?",
      correct_answer: "Femur",
      incorrect_answers: ["Cranium", "Humerus", "Tibia"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question:
        "Which of the following blood vessels carries deoxygenated blood?",
      correct_answer: "Pulmonary Artery",
      incorrect_answers: ["Pulmonary Vein", "Aorta", "Coronary Artery"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question:
        "What animal takes part in Schr&ouml;dinger&#039;s most famous thought experiment?",
      correct_answer: "Cat",
      incorrect_answers: ["Dog", "Bat", "Butterfly"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question: "What does DNA stand for?",
      correct_answer: "Deoxyribonucleic Acid",
      incorrect_answers: [
        "Deoxyribogenetic Acid",
        "Deoxyribogenetic Atoms",
        "Detoxic Acid",
      ],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question: "The human heart has how many chambers?",
      correct_answer: "4",
      incorrect_answers: ["2", "6", "3"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question: "Which is the most abundant element in the universe?",
      correct_answer: "Hydrogen",
      incorrect_answers: ["Helium", "Lithium", "Oxygen"],
    },
    {
      type: "multiple",
      difficulty: "easy",
      category: "Science &amp; Nature",
      question: "How many planets make up our Solar System?",
      correct_answer: "8",
      incorrect_answers: ["7", "9", "6"],
    },
  ],
};

const container = document.querySelector(".container");
const bonusMap = new Map([
  [0, 0],
  [1, 1000],
  [2, 5000],
  [3, 10000],
  [4, 20000],
  [5, 40000],
  [6, 60000],
  [7, 100000],
  [8, 150000],
  [9, 300000],
  [10, 500000],
]);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function speakText(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

class base {
  constructor(data) {
    this.questionArray = data.results;
    this.correctTime = 0;
    this.bonusMap = bonusMap;
    this.container = container;
    this.newCard = null;
    this.nowCard = null;
    this.answerMap = null;
    this.correctElement = null;
    this.answerStatus = false;
  }
  createCard() {
    // card div
    const cardDiv = document.createElement("div");
    cardDiv.classList = "card";
    // bonus div
    const bonusDiv = document.createElement("div");
    bonusDiv.classList = "bonus";
    // question div
    const questionDiv = document.createElement("div");
    questionDiv.classList = "question-container";
    cardDiv.appendChild(questionDiv);
    // answer div
    const answerDiv = document.createElement("div");
    answerDiv.classList = "answer-container";
    cardDiv.appendChild(answerDiv);
    //
    container.appendChild(cardDiv);
    this.newCard = cardDiv;
  }
  showUp() {
    // if there have a card on screen, move it out of the screen and delete it
    if (this.nowCard !== null) {
      this.nowCard.style.left = "-100%";
      this.nowCard.style.display = "none";
      setTimeout(() => {
        this.container.removeChild(this.nowCard);
      }, 0);
    }
    // if there are not any card on screen, create a new card
    if (this.newCard === null) {
      this.createCard();
    }
    // Set initial state and display
    this.newCard.style.left = "100%";
    this.newCard.style.display = "flex";
    // Trigger reflow to apply the transition
    void this.newCard.offsetWidth;
    // Animate to the target position
    this.newCard.style.left = "10%";
    // after the new card has been slided into the screen, set up the question and answer
    setTimeout(() => {
      // bonus

      // question
      let questionData = this.questionArray[this.correctTime];
      let questionDiv = document.querySelector(".question-container");
      const questionP = document.createElement("p");
      questionP.classList = "question-p";
      questionP.textContent = questionData.question;
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
      questionDiv.appendChild(questionP);
    }, 1100);
    // set now card to be the card show on screen
    this.nowCard = document.querySelector(".card");
    // empty the new card
    this.newCard = null;
  }
  answerIsCorrect(element) {
    if (this.answerStatus) {
      return;
    }
    let answer = element.textContent;
    if (this.answerMap.get(answer)) {
      element.style.backgroundColor = "#0a0";
    } else {
      element.style.backgroundColor = "#a00";
      element.style.color = "white";
    }
    document.querySelectorAll(".answer").forEach((elementLoop) => {
      elementLoop.removeEventListener;
      if (this.answerMap.get(elementLoop.textContent)) {
        elementLoop.style.backgroundColor = "#0a0";
      }
    });
    this.answerStatus = true;
  }
}

async function getQuestions() {
  const response = await fetch(
    "https://opentdb.com/api.php?amount=10&category=17&difficulty=easy&type=multiple"
  );
  let data = await response.json();
  data = data.results;
  console.log(data);
  data.forEach((question) => {
    console.log(question);
  });
}

// getQuestions();
const Base = new base(sample);
Base.showUp();
