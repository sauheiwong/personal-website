// const titleElement = document.createElement("h2");
// titleElement.classList += "title";
// const divImageContainer = document.createElement("div");
// divImageContainer.classList += "image-container";
// const divLeftClick = document.createElement("div");
// divLeftClick.classList += "click-div";
// divLeftClick.id = "left-click";
// divLeftClick.innerHTML += `
// <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="50"
//     height="50"
//     fill="currentColor"
//     class="bi bi-arrow-left"
//     viewBox="0 0 16 16"
// >
// <path
// fill-rule="evenodd"
// d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
// />
// </svg>
// `;
// divImageContainer.appendChild(divLeftClick);
// const divRightClick = document.createElement("div");
// divRightClick.classList += "click-div";
// divRightClick.id = "right-click";
// divRightClick.innerHTML += `
// <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="50"
//     height="50"
//     fill="currentColor"
//     class="bi bi-arrow-right"
//     viewBox="0 0 16 16"
// >
//     <path
//     fill-rule="evenodd"
//     d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
//     />
// </svg>
// `;
// divImageContainer.appendChild(divRightClick);

class title {
  constructor(titleElement, title) {
    this.titleElement = titleElement;
    this.title = title;
  }
  show() {
    this.titleElement.innerHTML = this.title; // change the text to title
    this.titleElement.style.left = "15%"; // come out from left
  }
  hide() {
    this.titleElement.style.left = "-50%"; // go out
  }
}

class text {
  constructor(textElement, text) {
    this.textElement = textElement;
    this.text = text;
  }
  show() {
    this.textElement.innerHTML = this.text; // change the text
    this.textElement.style.right = "15%"; // come out from left
  }
  hide() {
    this.textElement.style.right = "-50%"; // go out
  }
}

class imageContainer {
  constructor(container, imagesMap) {
    this.container = container;
    this.imagesMap = imagesMap;
    this.imageID = 0;
    this.imageElement = null;
  }
  show() {
    let id = null;
    let opacity = 0;
    // create a img element
    this.imageElement = document.createElement("img");
    this.imageElement.classList += "img";
    this.imageElement.id = `${this.imageID}-image`;
    this.imageElement.src = this.imagesMap.get(this.imageID);
    //
    this.container.appendChild(this.imageElement); // add to it's container
    let childrenArray = [...this.container.children]; // get all children element
    clearInterval(id);
    id = setInterval(() => {
      if (opacity === 100) {
        // when opcaity is 100, stop it
        clearInterval(id);
      } else {
        opacity++;
        this.container.style.opacity = `${opacity / 100}`; // the container will come out
        childrenArray.forEach(
          // all the children element of the container will come out
          (element) => (element.style.opacity = `${opacity / 100}`)
        );
      }
    }, 1);
  }
  hide() {
    let id = null;
    let opacity = 100;
    let childrenArray = [...this.container.children];
    clearInterval(id);
    id = setInterval(() => {
      // Use arrow function
      if (opacity === 0) {
        clearInterval(id);
      } else {
        opacity -= 5;
        this.container.style.opacity = `${opacity / 100}`;
        childrenArray.forEach(
          (element) => (element.style.opacity = `${opacity / 100}`)
        );
      }
    }, 1);
  }
  rightClick() {
    this.imageID++;
    this.imageID = Math.floor(this.imageID % this.imagesMap.size); // so the image id range is from 0 to the number of images
    this.changeImage();
  }
  changeImage() {
    const imgNext = document.createElement("img"); // create a new img element
    // set the css property so that it will come out slowly
    imgNext.classList += "img";
    imgNext.id = `${this.imageID}_image`;
    imgNext.src = this.imagesMap.get(this.imageID);
    imgNext.style.animation = "showUp 1s ease forwards";
    //
    this.container.appendChild(imgNext);
    this.imageElement.style.animation = "animation: hide 1s ease forwards;"; // the previous img will disappear slowly at the same time
    this.container.removeChild(this.imageElement); // remove the previous img elemnt
    this.imageElement = imgNext; // set the new img element to be imageElement
  }
  leftClick() {
    this.imageID--;
    this.imageID += this.imagesMap.size;
    this.imageID = Math.floor(this.imageID % this.imagesMap.size); // so the image id range is from 0 to the number of images
    this.changeImage();
  }
}

class card {
  constructor(title, imagesMap, text) {
    this.title = title; // save the title of a card
    this.imagesMap = imagesMap; // save the image url
    this.elementMap = new Map([]); // save the element
    this.classMap = new Map([]); // save the class so that it can control the animation of element
    this.text = text;
  }
  show() {
    const container = document.querySelector(".container");
    // clear all the element inside a card
    while (container.lastChild.className !== "click-div") {
      container.removeChild(container.lastChild);
    }
    //
    // basic elements of a card
    const titleElement = document.createElement("h2");
    titleElement.classList += "title";
    const divImageContainer = document.createElement("div");
    divImageContainer.classList += "image-container";
    const divLeftClick = document.createElement("div");
    divLeftClick.classList += "click-div";
    divLeftClick.id = "left-click";
    divLeftClick.innerHTML += `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="currentColor"
    class="bi bi-arrow-left"
    viewBox="0 0 16 16"
>
<path
fill-rule="evenodd"
d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
/>
</svg>
`;
    divImageContainer.appendChild(divLeftClick);
    const divRightClick = document.createElement("div");
    divRightClick.classList += "click-div";
    divRightClick.id = "right-click";
    divRightClick.innerHTML += `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="currentColor"
    class="bi bi-arrow-right"
    viewBox="0 0 16 16"
>
    <path
    fill-rule="evenodd"
    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
    />
</svg>
`;
    divImageContainer.appendChild(divRightClick);
    const textDivElement = document.createElement("div");
    textDivElement.classList += "txt-container";
    const textElement = document.createElement("p");
    textElement.classList += "txt";
    textElement.innerHTML += this.text;
    textDivElement.appendChild(textElement);
    //
    // add the basic elements into the container
    container.appendChild(titleElement);
    container.appendChild(divImageContainer);
    container.appendChild(textDivElement);
    //
    // set the elementMap and classMap
    this.elementMap.set("title", titleElement);
    this.elementMap.set("imageConatiner", divImageContainer);
    this.elementMap.set("textConatiner", textDivElement);
    this.classMap.set("title", new title(titleElement, this.title));
    this.classMap.set(
      "imageContainer",
      new imageContainer(divImageContainer, this.imagesMap)
    );
    this.classMap.set("textContainer", new text(textDivElement, this.text));
    //
    // show all the element before some time
    setTimeout(() => {
      this.classMap.forEach((element, name) => {
        console.log(element);
        element.show();
      });
    }, 500);
  }
  hide() {
    this.classMap.forEach((element, name) => {
      element.hide();
    });
  }
}

const imgSki = new Map([
  [0, "img/ski01.jpg"],
  [1, "img/ski02.jpg"],
  [2, "img/ski03.jpg"],
  [3, "img/ski04.jpg"],
]);

const skiCard = new card(
  "Skiing",
  imgSki,
  "Skiing is an interesting and challenging sport.<br />I falled when skiing but I still like it❤️"
);

const cardMap = new Map([[0, skiCard]]);

let cardID = 0;
cardMap.get(cardID).show();

document
  .querySelector(".image-container #right-click")
  .addEventListener("click", () =>
    cardMap.get(cardID).classMap.get("imageContainer").rightClick()
  );

document
  .querySelector(".image-container #left-click")
  .addEventListener("click", () =>
    cardMap.get(cardID).classMap.get("imageContainer").leftClick()
  );
