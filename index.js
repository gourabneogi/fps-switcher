import readline from "readline";
import tty from "tty";

import { CHOICES, TIMEOUT } from "./config.js";

// Configurable options
const actions = CHOICES.map((choice) => choice.action);
const buttons = CHOICES.map((choice) => choice.key);
const game = CHOICES.map((choice) => choice.game);

// Stats variables
let correctCount = 0;
let wrongCount = 0;
let missedCount = 0;
const actionStats = {};

const getGame = (action) => {
  for (const choice of CHOICES) {
    if (choice.action === action) {
      return choice.game;
    }
  }
};

const getRandomaction = (arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

const displayPrompt = () => {
  const actionToShow = getRandomaction(actions);
  const game = getGame(actionToShow);
  const buttonIndex = actions.indexOf(actionToShow);
  const buttonToPress = buttons[buttonIndex];

  console.log(`Press the button corresponding to: ${actionToShow} in ${game}`);
  console.log("Press 0 to exit.");

  let missedTimerId;
  const startMissedTimer = () => {
    missedTimerId = setTimeout(() => {
      missedCount++;
      console.log("Time is up! You missed it.");
      updateactionStats(actionToShow, null); // Increment missed count
      displayPrompt(); // Restart the loop
    }, TIMEOUT);
  };

  const stdin = process.stdin;

  if (tty.isatty(stdin.fd)) {
    stdin.setRawMode(true);
  }

  startMissedTimer(); // Start the missed timer

  stdin.on("data", (key) => {
    const userInput = key.toString().toLowerCase();
    if (userInput === "0") {
      clearTimeout(missedTimerId);
      displayStats();
      process.exit();
    } else if (userInput === buttonToPress) {
      clearTimeout(missedTimerId);
      correctCount++;
      console.log("Correct!");
      updateactionStats(actionToShow, true);
      displayPrompt(); // Restart the loop
    } else {
      console.log("Wrong button. Try again.");
      wrongCount++;
      updateactionStats(actionToShow, false);
    }

    startMissedTimer(); // Restart the missed timer for the next round
  });

  readline.emitKeypressEvents(stdin);
  stdin.resume();
};

const updateactionStats = (action, isCorrect) => {
  if (!actionStats[action]) {
    actionStats[action] = { correct: 0, wrong: 0, missed: 0 };
  }

  if (isCorrect === true) {
    actionStats[action].correct++;
  } else if (isCorrect === false) {
    actionStats[action].wrong++;
  } else if (isCorrect === null) {
    actionStats[action].missed++;
  }
};

const displayStats = () => {
  const totalAttempts = correctCount + wrongCount + missedCount;
  const accuracy =
    totalAttempts === 0 ? 0 : (correctCount / totalAttempts) * 100;

  console.log("\nGame Stats:");
  console.log(`Total Attempts: ${totalAttempts}`);
  console.log(`Correct: ${correctCount}`);
  console.log(`Wrong: ${wrongCount}`);
  console.log(`Missed: ${missedCount}`);
  console.log(`Accuracy: ${accuracy.toFixed(2)}%\n`);

  console.log("Action Stats:");
  for (const action of actions) {
    const stats = actionStats[action] || { correct: 0, wrong: 0, missed: 0 };
    const actionAccuracy =
      stats.correct + stats.wrong === 0
        ? 0
        : (stats.correct / (stats.correct + stats.wrong)) * 100;

    console.log(
      `${action}: Correct: ${stats.correct}, Wrong: ${stats.wrong}, Missed: ${
        stats.missed
      }, Accuracy: ${actionAccuracy.toFixed(2)}%`
    );
  }
};

// Run the program
displayPrompt();
