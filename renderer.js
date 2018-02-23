const { ipcRenderer } = require("electron");
const Timr = require("timrjs");
const notifier = require("node-notifier");
const nc = new notifier.NotificationCenter();
const path = require("path");

const timerDisplay = document.querySelector(".display__time-left");
const endTime = document.querySelector(".display__end-time");
const pomodoro = document.querySelector("#pomo");
const shortBreak = document.querySelector("#short__break");
const longBreak = document.querySelector("#long__break");

const pomoTimer = Timr("00:05");
const shortBreakTimer = Timr("05:00");
const longBreakTimer = Timr("15:00");

function timerNotification() {
  let n = new Notification("Timer started!", {
    body: "Gotta go fast"
  });
}

function startPomo() {
  shortBreakTimer.destroy();
  longBreakTimer.destroy();
  pomoTimer.start();
  timerNotification();

  timerDisplay.textContent = pomoTimer.getFt();
  endTime.textContent = "Get to work!";

  pomoTimer.ticker(({ formattedTime }) => {
    timerDisplay.textContent = formattedTime;
  });

  pomoTimer.finish(() => {
    pomodoro.disabled = false;
    pomoTimer.destroy();
    pomoNotify();
  });
}

function startLb() {
  shortBreakTimer.destroy();
  pomoTimer.destroy();
  longBreakTimer.start();

  timerDisplay.textContent = longBreakTimer.getFt();
  endTime.textContent = "Take a break!";

  longBreakTimer.ticker(({ formattedTime }) => {
    timerDisplay.textContent = formattedTime;
  });

  longBreakTimer.finish(() => {
    longBreak.disabled = false;
    longBreakTimer.destroy();
    pomoNotify();
  });
}

function startSb() {
  pomoTimer.destroy();
  longBreakTimer.destroy();
  shortBreakTimer.start();

  timerDisplay.textContent = shortBreakTimer.getFt();
  endTime.textContent = "Take a quick break!";

  shortBreakTimer.ticker(({ formattedTime }) => {
    timerDisplay.textContent = formattedTime;
  });

  shortBreakTimer.finish(() => {
    shortBreak.disabled = false;
    shortBreakTimer.destroy();
    pomoNotify();
  });
}

function pomoNotify() {
  let trueAnswer = ["Short Break", "Long Break"];
  let label = "Close";
  //console.log("Pomodoro Finished");
  nc.notify(
    {
      title: "Ding!",
      message: "Click Me to Keep going or take a break",
      sound: "Funk",
      icon: path.join(__dirname, "assets/img/logo.png"),
      actions: trueAnswer, // String | Array<String>. Action label or list of labels in case of dropdown
      dropdownLabel: "Breaks", // String. Label to be used if multiple actions
      closeLabel: label,
      wait: false
    },
    function(error, response, metadata) {
      if (error) throw error;
      if (metadata.activationValue === "Long Break") {
        longBreak.disabled = true;
        shortBreak.disabled = false;
        startLb();
      }
      if (metadata.activationValue === "Short Break") {
        shortBreak.disabled = true;
        longBreak.disable = false;
        startSb();
      }
    }
  );
}

pomodoro.addEventListener("click", () => {
  pomodoro.disabled = true;
  shortBreakTimer.stop();
  longBreakTimer.stop();
  startPomo();
});

shortBreak.addEventListener("click", () => {
  shortBreak.disabled = true;
  pomoTimer.stop();
  longBreakTimer.stop();
  startSb();
});

longBreak.addEventListener("click", () => {
  longBreak.disabled = true;
  shortBreakTimer.stop();
  pomoTimer.stop();
  startLb();
});
