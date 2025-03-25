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
class base {
  constructor(data) {
    this.questionArray = data.results;
    this.correctTime = 0;
    this.bonusMap = bonusMap;
    this.container = container;
    this.newCard = null;
    this.nowCard = null;
  }
  createCard() {
    // card div
    const cardDiv = document.createElement("div");
    cardDiv.classList = "card";
    // question div
    const questionDiv = document.createElement("div");
    questionDiv.classList = "question";
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
    if (this.nowCard !== null) {
      this.nowCard.style.left = "-100%";
      this.nowCard.style.display = "none";
      setTimeout(() => {
        this.container.removeChild(this.nowCard);
      }, 0);
    }
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
    setTimeout(() => {
      let questionDiv = document.querySelector(".question");
      const questionP = document.createElement("p");
      questionP.classList = "question-p";
      questionP.textContent = this.questionArray[this.correctTime].question;
      setTimeout(() => {
        questionP.style.opacity = "100%";
      }, 100);
      questionDiv.appendChild(questionP);
    }, 1100);
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
