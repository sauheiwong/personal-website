const container = document.querySelector(".container");

function createCard(container, question) {
  const cardDiv = document.createElement("div");
  cardDiv.classList = "card";
  const questionDiv = document.createElement("div");
  questionDiv.classList = "question";
  const answerDiv = document.createElement("div");
  answerDiv.classList = "answer-container";
  answerMap = new Map([]);
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

getQuestions();
