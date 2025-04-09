# Tommy Wong Personal Website

Hi everyone, welcome to my website!

This is my first website, created while learning the basics of HTML, CSS, JavaScript, and Bootstrap 5.

As it's my initial project, the website might not be the most visually stunning or perfectly designed.

I hope to improve it in the future.

---

The website has **four** main sections:

1. Home Page

2. Habit

3. Reading📖

4. Game Center🕹️

---

## Home Page

![home_page](/img/home_page.png "home page")

On the home page, you'll find a brief overview of my background and a photo of me in Vancouver😎.

Below that, I showcase my programming skills.

## Habit

![habit_stable_diffusion](/img/habit_SD.png "habit page")

Here, I used JavaScript to build three interactive cards.

Users can click the arrow icon to cycle through these cards and view the different images within them.

I've also added background music to this page to share some of my favorite tunes❤️🎶.

## Reading

![reading_page](/img/reading.png "reading page")

The reading page features a selection of books I enjoy.

The information is presented in two different styles:

1. Table Style (implemented using HTML tables)

2. Card Style (styled with CSS Flexbox)

While I've read many other books, these are some of my favorites.

> This doesn't mean I don't want to write reviews for all the books I've read😜.

## Game Center

Welcome to my game center!

There are **five** games you can try out:

1. Circle Cross ⭕❌

   1. Player VS Player

   2. Player VS Computer

2. Breakout

3. Minesweeper

4. Trivia

5. Gomoku

![game_center](/img/game_center.png "game center")

Building these games significantly enhanced my JavaScript skills.

The Breakout game still has a bug, even after seeking help from AI☠️.

**IMPORTANT FEATURE!**

**IMPORTANT FEATURE!**

**IMPORTANT FEATURE!**

This is a crucial point, so I'm emphasizing it thrice.

> there are some bugs that I haven't yet discovered😜.

By the way, you can actually beat the computer in my Circle Cross game😉.

For Trivia, I'm using an API to fetch the questions.

[Open Triva Database](https://opentdb.com/)

In Gomoku, there's a Player VS Environment (PVE) mode powered by the Minimax Algorithm with a depth of 3.

The process of finding the best move involves three steps:

1. Sorting all possible moves based on the distance between the average position of the remaining pieces and the potential move's location.

   - A piece closer to the cluster of remaining pieces has a higher probability of being the optimal move.

   - Therefore, the algorithm evaluates the closest moves first, saving considerable time due to alpha-beta pruning.

   - Standard deviation wasn't used because its calculation would be more time-consuming.

2. Evaluating the scores of potential moves according to the number of connected pieces they create.

   - If an opponent blocks a chain of pieces, the chain's score becomes negative, prompting the algorithm to prioritize blocking rather than building its own chains.

3. Utilizing the Minimax algorithm to determine the best move.

---

## Short Summary

In this project, I used basic HTML, CSS, JavaScript, and Bootstrap 5 icons to develop my personal website. My initial goal was to create a few games to improve my JavaScript coding skills. These games are:

1. Circle Cross

2. Breakout

3. Minesweeper

4. Trivia

5. Gomoku

Beyond the games, I also enhanced the habit page using JavaScript, adding animations and background music.

---

## Difficulties

1. Alert problems

   - Previously, I used the `alert` function to communicate with the user. However, the `alert` function would halt the entire DOM, preventing subsequent events from running.

   - Ultimately, I implemented a pop-up card instead, allowing the DOM to remain active while the user receives messages.

2. Complex animation effects and event listener problems

   - Since animation effects require some time to execute, certain functions were being initiated before the necessary elements were created or visible on the screen.

   - I resolved this by adding `setTimeout` to these functions, ensuring they run after the elements have been properly created.

3. Unresolved bug

   - In the Breakout game, if the ball hits the side of the paddle, it can sometimes pass through it.

   - The collision detection function needs further improvement in the future, perhaps by changing the ball's speed upon collision instead of just its direction.

---

## Wins

1. Fast response times

   - All pages with JavaScript load quickly.

   - The interactions are very responsive, ensuring users don't experience delays while playing the games.

2. Expanded knowledge of APIs

   - I successfully integrated two APIs: `onYouTubeIframeAPIReady` and `openTriviaDatabase`.

3. Understanding asynchronous functions

   - I learned how to create HTML elements and control animation effects using JavaScript.

   - On the habit page, I managed to display three different cards within a single container.

4. Implementation of the Minimax algorithm in Gomoku.

> Edited by AI.
