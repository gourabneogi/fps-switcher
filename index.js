import readline from "readline";
import tty from "tty";
import { CHOICES, TIMEOUT } from "./config.js";

let correctCount = 0;
let wrongCount = 0;
let missedCount = 0;
const actionStats = {};

const getRandomChoice = () => {
  const randomIndex = Math.floor(Math.random() * CHOICES.length);
  const randomChoice = CHOICES[randomIndex];

  return {
    selectedAction: randomChoice.action,
    selectedGame: randomChoice.game,
    buttonToPress: randomChoice.key,
  };
};

const displayPrompt = () => {
  const { selectedAction, selectedGame, buttonToPress } = getRandomChoice();

  console.log(`Press the button corresponding to: ${selectedAction} in ${selectedGame}`);
  console.log("Press 0 to exit.");

  let missedTimerId;

  const startMissedTimer = () => {
    missedTimerId = setTimeout(() => {
      missedCount++;
      console.log("Time is up! You missed it.");
      updateActionStats(selectedAction, null);
      displayPrompt();
    }, TIMEOUT);
  };

  const handleUserInput = (key) => {
    clearTimeout(missedTimerId);
    const userInput = key.toString().toLowerCase();

    if (userInput === "0") {
      displayStats();
      process.exit();
    }

    if (userInput === buttonToPress) {
      correctCount++;
      console.log("Correct!");
      updateActionStats(selectedAction, true);
    } else {
      wrongCount++;
      console.log("Wrong button. Try again.");
      updateActionStats(selectedAction, false);
    }

    displayPrompt();
    startMissedTimer();
  };

  const stdin = process.stdin;

  if (tty.isatty(stdin.fd)) {
    stdin.setRawMode(true);
  }

  startMissedTimer();

  stdin.on("data", handleUserInput);
  readline.emitKeypressEvents(stdin);
  stdin.resume();
};

const updateActionStats = (action, isCorrect) => {
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
  for (const choice of CHOICES) {
    const { action } = choice;
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
