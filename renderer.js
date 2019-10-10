const { ipcRenderer } = require("electron");
const Timr = require("timrjs");
const notifier = require("node-notifier");
const fs = require("fs");
const path = require("path");
const converter = require("json-2-csv");
const usrHome = require("user-home");

const nc = new notifier.NotificationCenter();

//Getters
const timerDisplay = document.querySelector(".display__time-left");
const endTime = document.querySelector(".display__end-time");
const standardBreakSelector = document.querySelector("#pomo");
const shortBreakSelector = document.querySelector("#short__break");
const longBreakSelector = document.querySelector("#long__break");

const shortBreakTimer = Timr("05:00");
const standardBreakTimer = Timr("25:00");
const longBreakTimer = Timr("15:00");

function timerNotification() {
  let n = new Notification("Timer started!", {
    body: "Gotta go fast"
  });
}

let writeLogStatsCallback = function (err, csv) {
  if (err) throw err;
  let fileDate = new Date().toJSON().slice(0, 10);
  fs.appendFile(usrHome + '/Desktop/pomotron-stats ' + fileDate + '.csv', csv, 'utf-8');
};

let options = {
  delimiter: {
    wrap: '"', // Double Quote (") character
    field: ',', // Comma field delimiter
    array: ';', // Semicolon array value delimiter
    eol: '\n', // Newline delimiter
  },
  prependHeader: true,
  sortHeader: false,
  trimHeaderValues: true,
  trimFieldValues: true,
  keys: ['Pomodoro', 'ShortBreak', 'LongBreak', 'RecordDate', 'RecordTime']
};

function dataHandler(pomodoro, ShortBreak, LongBreak, RecordDate, RecordTime) {
  let utc = new Date().toJSON().slice(0, 10);
  this.Pomodoro = Pomodoro;
  this.ShortBreak = ShortBreak;
  this.LongBreak = LongBreak;
  this.RecordDate = utc;
  this.RecordTime = RecordTime;

  if (fs.existsSync(usrHome + '/Desktop/pomotron-stats ' + utc + '.csv')) {
    options.prependHeader = false;
  } else {
    options.prependHeader = true;
  }
};

function startStandardBreak() {
  shortBreakTimer.destroy();
  longBreakTimer.destroy();
  standardBreakTimer.start();

  timerNotification();

  timerDisplay.textContent = standardBreakTimer.getFt();
  endTime.textContent = "Get to work!";

  standardBreakTimer.ticker(({
    formattedTime
  }) => {
    timerDisplay.textContent = formattedTime;
  });

  standardBreakTimer.finish(() => {
    let timerData = standardBreakTimer.getFt();
    let currentTime = new Date().toTimeString().split(" ")[0];
    let record = new dataHandler(timerData, '00:00', '00:00', '', currentTime);

    converter.json2csv(record, writeLogStatsCallback, options);
    standardBreakTimer.destroy();
    standardBreakSelector.disabled = false;

    notifyUser();
  });
}

function startLongBreak() {
  shortBreakTimer.destroy();
  standardBreakTimer.destroy();
  longBreakTimer.start();

  timerDisplay.textContent = longBreakTimer.getFt();
  endTime.textContent = "Take a break!";

  longBreakTimer.ticker(({
    formattedTime
  }) => {
    timerDisplay.textContent = formattedTime;
  });

  longBreakTimer.finish(() => {
    let timerData = longBreakTimer.getFt();
    let currentTime = new Date().toTimeString().split(" ")[0];
    let record = new dataHandler('00:00', '00:00', timerData, '', currentTime);
    converter.json2csv(record, writeLogStatsCallback, options);
    longBreakTimer.destroy();
    longBreak.disabled = false;
    notifyUser();
  });
}

function startShortBreak() {
  standardBreakTimer.destroy();
  longBreakTimer.destroy();
  shortBreakTimer.start();

  timerDisplay.textContent = shortBreakTimer.getFt();
  endTime.textContent = "Take a quick break!";

  shortBreakTimer.ticker(({
    formattedTime
  }) => {
    timerDisplay.textContent = formattedTime;
  });

  shortBreakTimer.finish(() => {
    let timerData = shortBreakTimer.getFt();
    let currentTime = new Date().toTimeString().split(" ")[0];
    let record = new dataHandler('00:00', timerData, '00:00', '', currentTime);

    converter.json2csv(record, writeLogStatsCallback, options);
    shortBreakTimer.destroy();
    shortBreak.disabled = false;

    notifyUser();
  });
}

function notifyUser() {
  let trueAnswer = ["Short Break", "Long Break"];
  let label = "Keep Going";
  //console.log("Pomodoro Finished");
  nc.notify({
      title: "Ding!",
      message: "Keep going or take a break",
      sound: "Funk",
      icon: path.join(__dirname, "assets/img/logo.png"),
      actions: trueAnswer, // String | Array<String>. Action label or list of labels in case of dropdown
      dropdownLabel: "Breaks", // String. Label to be used if multiple actions
      closeLabel: label,
      wait: false
    },
    function (error, response, metadata) {
      if (metadata.activationValue === "Long Break") {
        longBreakSelector.disabled = true;
        shortBreakSelector.disabled = false;
        startLongBreak();
      }
      if (metadata.activationValue === "Short Break") {
        shortBreakSelector.disabled = true;
        longBreakSelector.disabled = false;
        startShortBreak();
      }
      if (metadata.activationValue === "Keep Going") {
        standardBreakSelector.disabled = true;
        shortBreakSelector.disabled = false;
        startStandardBreak();
      }
    }
  );
}

function reset() {
  standardBreakSelector.disabled = true;
  shortBreakSelector.disabled = true;
  longBreakSelector.disabled = true;

  shortBreakTimer.stop();
  longBreakTimer.stop();
};

standardBreak.addEventListener("click", () => {
  reset();
  startStandardBreak();
});

shortBreak.addEventListener("click", () => {
  reset();
  startShortBreak();
});

longBreak.addEventListener("click", () => {
  reset();
  startLongBreak();
});
