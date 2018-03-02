const { ipcRenderer } = require("electron");
const Timr = require("timrjs");
const notifier = require("node-notifier");
const nc = new notifier.NotificationCenter();
const fs = require("fs");
const path = require("path");
const converter = require("json-2-csv");
const usrHome = require("user-home");

//Getters
const timerDisplay = document.querySelector(".display__time-left");
const endTime = document.querySelector(".display__end-time");
const pomodoro = document.querySelector("#pomo");
const shortBreak = document.querySelector("#short__break");
const longBreak = document.querySelector("#long__break");

const pomoTimer = Timr("25:00");
const shortBreakTimer = Timr("05:00");
const longBreakTimer = Timr("15:00");

function timerNotification() {
  let n = new Notification("Timer started!", {
    body: "Gotta go fast"
  });
}

let json2csvCallback = function (err, csv) {
  if (err) throw err;
  console.log(csv);
  fs.appendFileSync( usrHome + '/Desktop/pomotron-stats.csv', csv, 'utf-8');
};

let options = {
  delimiter : {
      wrap  : '"', // Double Quote (") character
      field : ',', // Comma field delimiter
      array : ';', // Semicolon array value delimiter
      eol   : '\n', // Newline delimiter
  },
  prependHeader    : true,
  sortHeader       : false,
  trimHeaderValues : true,
  trimFieldValues  :  true,
  keys             : ['Pomodoro', 'ShortBreak', 'LongBreak', 'RecordDate', 'RecordTime']
};

function dataHandler(Pomodoro, ShortBreak, LongBreak, RecordDate, RecordTime) {
  let utc = new Date().toJSON().slice(0,10);
  this.Pomodoro = Pomodoro;
  this.ShortBreak = ShortBreak;
  this.LongBreak = LongBreak;
  this.RecordDate = utc;
  this.RecordTime = RecordTime;

  if(fs.existsSync(usrHome + '/Desktop/pomotron-stats.csv')) {
    options.prependHeader = false;
  } else {
    options.prependHeader = true;
  }
};

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
    let timerData = pomoTimer.getFt();
    let currentTime = new Date().toTimeString().split(" ")[0];
    let record = new dataHandler(timerData, '00:00', '00:00', '', currentTime);
    converter.json2csv(record, json2csvCallback, options);
    pomoTimer.destroy();
    pomodoro.disabled = false;
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
    let timerData = longBreakTimer.getFt();
    let currentTime = new Date().toTimeString().split(" ")[0];
    let record = new dataHandler('00:00', '00:00', timerData, '', currentTime);
    converter.json2csv(record, json2csvCallback, options);
    longBreakTimer.destroy();
    longBreak.disabled = false;
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
    let timerData = shortBreakTimer.getFt();
    let currentTime = new Date().toTimeString().split(" ")[0];
    let record = new dataHandler('00:00', timerData, '00:00', '', currentTime);
    converter.json2csv(record, json2csvCallback, options);
    shortBreakTimer.destroy();
    shortBreak.disabled = false;
    pomoNotify();
  });
}

function pomoNotify() {
  let trueAnswer = ["Short Break", "Long Break"];
  let label = "Keep Going";
  //console.log("Pomodoro Finished");
  nc.notify(
    {
      title: "Ding!",
      message: "Keep going or take a break",
      sound: "Funk",
      icon: path.join(__dirname, "assets/img/logo.png"),
      actions: trueAnswer, // String | Array<String>. Action label or list of labels in case of dropdown
      dropdownLabel: "Breaks", // String. Label to be used if multiple actions
      closeLabel: label,
      wait: false
    },
    function(error, response, metadata) {
      if (metadata.activationValue === "Long Break") {
        longBreak.disabled = true;
        shortBreak.disabled = false;
        startLb();
      }
      if (metadata.activationValue === "Short Break") {
        shortBreak.disabled = true;
        longBreak.disabled = false;
        startSb();
      }
      if (metadata.activationValue === "Keep Going") {
        pomodoro.disabled = true;
        shortBreak.disabled = false;
        startPomo();
      }
    }
  );
}

pomodoro.addEventListener("click", () => {
  pomodoro.disabled = true;
  shortBreak.disabled = true;
  longBreak.disabled = true;
  shortBreakTimer.stop();
  longBreakTimer.stop();
  startPomo();
});

shortBreak.addEventListener("click", () => {
  shortBreak.disabled = true;
  pomodoro.disabled = true;
  longBreak.disabled = true;
  pomoTimer.stop();
  longBreakTimer.stop();
  startSb();
});

longBreak.addEventListener("click", () => {
  longBreak.disabled = true;
  pomodoro.disabled = true;
  shortBreak.disabled = true;
  shortBreakTimer.stop();
  pomoTimer.stop();
  startLb();
});
