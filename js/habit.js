class title {
  // the title element
  constructor(titleElement, title) {
    this.titleElement = titleElement;
    this.title = title;
  }
  show() {
    this.titleElement.innerHTML = this.title; // change the text to title of the card
    this.titleElement.style.left = "15%"; // come out from left
  }
  hide() {
    this.titleElement.style.left = "-50%"; // go out
  }
}

class text {
  // the text contect
  constructor(textElement, text) {
    this.textElement = textElement;
    this.text = text;
  }
  show() {
    this.textElement.innerHTML = this.text; // change the text to text of the card
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
    this.promptContainer = null;
  }
  show() {
    let id = null;
    let opacity = 0;
    let imageItem = this.imagesMap.get(this.imageID);
    // create a img element
    this.imageElement = document.createElement("img");
    this.imageElement.classList += "img";
    this.imageElement.id = `${this.imageID}-image`;
    this.imageElement.src = imageItem.src;
    // if the image has a link (only music card has link), then add a click event
    if ("link" in imageItem) {
      this.imageElement.addEventListener("click", () => {
        playStatus = true;
        console.log(`<a href='${imageItem.url}'>${imageItem.title}</a>`);

        player.loadVideoById(imageItem.link); // player the music
      });
    }
    //
    if ("prompt" in imageItem) {
      // if the image has a prompt (only Stable Diffusion card has prompt), then add a mouse enter event
      this.promptContainer = document.createElement("div");
      this.promptContainer.classList += "txt-in-img";
      this.promptContainer.innerHTML += imageItem.prompt;
      this.imageElement.style.right = "0%";
      this.container.appendChild(this.promptContainer);
      setTimeout(() => {
        // the interactive part will complete after the DOM has done
        this.imageElement.addEventListener("mouseenter", () => {
          this.imageElement.style.right = "-20%";
          this.promptContainer.style.display = "block";
          let opacity = 0;
          clearInterval(id);
          id = setInterval(() => {
            if (opacity === 100) {
              // when opcaity is 100, stop it
              clearInterval(id);
            } else {
              opacity++;
              this.promptContainer.style.opacity = `${opacity / 100}`; // the container will come out
            }
          }, 7);
        });
        this.imageElement.addEventListener("mouseleave", () => {
          this.imageElement.style.right = "0%";
          let opacity = 100;
          clearInterval(id);
          id = setInterval(() => {
            if (opacity === 0) {
              // when opcaity is 0, stop it
              clearInterval(id);
            } else {
              opacity--;
              this.promptContainer.style.opacity = `${opacity / 100}`; // the container will come out
            }
          }, 7);
        });
      }, 500);
    }
    this.container.appendChild(this.imageElement); // add to it's container
    let childrenArray = [...this.container.children]; // get all children element
    clearInterval(id);
    opacity = 0;
    id = setInterval(() => {
      if (opacity === 100) {
        // when opcaity is 100, stop it
        if ("prompt" in imageItem) {
          this.promptContainer.style.opacity = "0";
        }
        clearInterval(id);
      } else {
        opacity++;
        this.container.style.opacity = `${opacity / 100}`; // the container will come out
        childrenArray.forEach(
          // all the children element of the container will come out
          (element) => (element.style.opacity = `${opacity / 100}`)
        );
      }
    }, 7);
  }
  hide() {
    let id = null;
    let opacity = 100;
    let childrenArray = [...this.container.children];
    clearInterval(id);
    id = setInterval(() => {
      if (opacity === 0) {
        clearInterval(id);
      } else {
        opacity -= 1;
        this.container.style.opacity = `${opacity / 100}`;
        childrenArray.forEach(
          (element) => (element.style.opacity = `${opacity / 100}`)
        );
      }
    }, 7);
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
    imgNext.src = this.imagesMap.get(this.imageID).src;
    imgNext.style.animation = "showUp 1s ease forwards";
    imgNext.style.right = "0%";
    if ("link" in this.imagesMap.get(this.imageID)) {
      imgNext.addEventListener("click", () => {
        playStatus = true;
        player.loadVideoById(this.imagesMap.get(this.imageID).link); // play the music
      });
    }
    //
    if ("prompt" in this.imagesMap.get(this.imageID)) {
      let id = null;
      let NewpromptContainer = document.createElement("div");
      NewpromptContainer.classList += "txt-in-img";
      NewpromptContainer.innerHTML += this.imagesMap.get(this.imageID).prompt;
      setTimeout(() => {
        imgNext.addEventListener("mouseenter", () => {
          imgNext.style.right = "-20%";
          NewpromptContainer.style.display = "block";
          let opacity = 0;
          clearInterval(id);
          id = setInterval(() => {
            if (opacity === 100) {
              // when opcaity is 100, stop it
              clearInterval(id);
            } else {
              opacity++;
              NewpromptContainer.style.opacity = `${opacity / 100}`; // the container will come out
            }
          }, 7);
        });
        imgNext.addEventListener("mouseleave", () => {
          imgNext.style.right = "0%";
          let opacity = 100;
          clearInterval(id);
          id = setInterval(() => {
            if (opacity === 0) {
              // when opcaity is 0, stop it
              clearInterval(id);
            } else {
              opacity--;
              NewpromptContainer.style.opacity = `${opacity / 100}`; // the container will come out
            }
          }, 7);
        });
      }, 500);
      this.container.appendChild(NewpromptContainer);
      this.container.removeChild(this.promptContainer);
      this.promptContainer = NewpromptContainer;
    }
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
    this.imagesMap = imagesMap; // save the image infor
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
    divLeftClick.addEventListener("click", () =>
      this.classMap.get("imageContainer").leftClick()
    );
    divRightClick.addEventListener("click", () =>
      this.classMap.get("imageContainer").rightClick()
    );
    //
    // show all the element after some time
    setTimeout(() => {
      this.classMap.forEach((element, name) => {
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
  [0, { src: "img/ski01.jpg" }],
  [1, { src: "img/ski02.jpg" }],
  [2, { src: "img/ski03.jpg" }],
  [3, { src: "img/ski04.jpg" }],
]);

const skiCard = new card(
  "Skiing",
  imgSki,
  "Skiing is an interesting and challenging sport.<br />I falled when skiing but I still like it❤️"
);

const imgSD = new Map([
  [
    0,
    {
      src: "img/SD01.png",
      prompt: `sundress, hat,<br />
                1girl, solo,<br />

                (large breasts:1.2), cleavage, collarbone, <br />

                blush, happy, smile, open mouth, looking at viewer, holding
                flowers, <br />

                finely beautiful blue eyes, big eyes, finely beautiful face,
                beautiful detailed hands and body,<br />

                super intricate finely detailed anime girl , (very long black
                straight hair:1.2), (black hair, bangs hair:1.1),

                <br />day, nature, outdoors, grasslands, flower,`,
    },
  ],
  [
    1,
    {
      src: "img/firefly.png",
      prompt: `fireflyhsr, hairband, skirt, holding henshin device, henshin,
                veins, burning clothes,<br />

                sfw,<br />

                medium breasts, keyhole, <br />

                serious, glaring, looking at viewer, <br />

                masterpiece,highly_detailed,best quailty,offical
                art,Amazing,1girl,solo,Depth of field,extremely detailed CG
                unity 8k wallpaper,<br />

                finely beautiful detailed eyes, big eyes, glowing eyes, finely
                beautiful face,beautiful detailed hands and body,<br />

                super intricate finely detailed girl , (very long sliver
                straight hair:1.05), sliver hair, (bangs hair:1.05) (cowboy
                shot:1.2),<br />

                fire, simple background, flame,`,
    },
  ],
  [
    2,
    {
      src: "img/miku_concert.png",
      prompt: `white shirt, black pleated miniskirt, black thighhighs, black
                detached sleeves, <br />

                1girl,<br />

                medium breasts,<br />

                standing, heart hands,<br />

                blush, smile, happy, looking at viewer, open mouth, wink, one
                eye closed, <br />

                finely beautiful aqua eyes, big eyes, finely beautiful face,
                beautiful detailed hands and body,<br />

                hatsune miku, (aqua twintails:1.05), (aqua hair,bangs hair:1.1)
                (dutch angle:1.4), cowboy shot,`,
    },
  ],
]);

const SDCard = new card(
  "Stable Diffusion",
  imgSD,
  "I use Stable Diffusion to generate images in my free time."
);

const imgMusic = new Map([
  [
    0,
    {
      src: "img/god-ish.jpeg",
      link: "EHBFKhLUVig",
    },
  ],
  [
    1,
    {
      src: "img/konton-boggie.jpeg",
      link: "1Swg-aBO9eY",
    },
  ],
  [
    2,
    {
      src: "img/Tetoris.png",
      link: "Soy4jGPHr3g",
    },
  ],
  [
    3,
    {
      src: "img/rabbit-hole.jpeg",
      link: "eSW2LVbPThw",
    },
  ],
  [
    4,
    {
      src: "img/moon.jpg",
      link: "HxkCT-vtm_I",
    },
  ],
  [
    5,
    {
      src: "img/two-face-lover.png",
      link: "b_cuMcDWwsI",
    },
  ],
]);

const MusicCard = new card(
  "Music",
  imgMusic,
  "The bottom image in previos section is Hatsune Miku which is one of the member of VOCALOID. <br> Click the image to listen it❤️"
);

const cardMap = new Map([
  [0, skiCard],
  [1, SDCard],
  [2, MusicCard],
]);

let cardID = 0;
cardMap.get(cardID).show();

document.querySelector("#Next-habit").addEventListener("click", () => {
  cardMap.get(cardID).hide();
  cardID++;
  cardID = Math.floor(cardID % cardMap.size);
  setTimeout(() => {
    cardMap.get(cardID).show();
  }, 250);
});

document.querySelector("#Pre-habit").addEventListener("click", () => {
  cardMap.get(cardID).hide();
  cardID--;
  cardID += cardMap.size;
  cardID = Math.floor(cardID % cardMap.size);
  setTimeout(() => {
    cardMap.get(cardID).show();
  }, 250);
});
