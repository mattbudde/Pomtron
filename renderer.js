const {ipcRenderer} = require('electron');
const notifier = require('node-notifier');
var nc = new notifier.NotificationCenter();
const path = require('path');

let countdown;
const timerDisplay = document.querySelector('.display__time-left');
const endTime = document.querySelector('.display__end-time');
const buttons = document.querySelectorAll('[data-time]');

function timer(seconds) {
  // clear any existing timers
  clearInterval(countdown);

  const now = Date.now();
  const then = now + seconds * 1000;
  displayTimeLeft(seconds);

  if(seconds >= 1500) {
    endTime.textContent = `Get to work!`;
    timerNotification(seconds);
  } else{
    displayEndTime(then);
  }

  countdown = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000);
    // check if we should stop it!
    if(secondsLeft == 0) {
      let trueAnswer = 'Keep Going';
      let label = 'Break';

      nc.notify(
        {
          title: 'Ding!',
          message: 'Keep going or take a break',
          sound: 'Funk',
          icon: path.join(__dirname, 'assets/img/logo.png'),
          // case sensitive
          closeLabel: label,
          actions: trueAnswer
        },
        function(err, response, metadata) {
          if (err) throw err;
          console.log(metadata);

          if (metadata.activationValue == trueAnswer) {
            var pomo = document.querySelector('#pomo');
            seconds = parseInt(pomo.dataset.time);
            timer(seconds);
            
          } else if(metadata.activationValue == label) {
            const shortBreak = document.querySelector('#short__break');
            seconds = parseInt(shortBreak.dataset.time);
            timer(seconds);
          } 
        }
      );
      clearInterval(countdown)
    }
    displayTimeLeft(secondsLeft);
  }, 1000);
}

function displayTimeLeft(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  const display = `${minutes}:${remainderSeconds < 10 ? '0' : '' }${remainderSeconds}`;
  document.title = display;
  timerDisplay.textContent = display;
}

function displayEndTime(timestamp) {
  const end = new Date(timestamp);
  const hour = end.getHours();
  const minutes = end.getMinutes();
  endTime.textContent = `Be Back At ${hour}:${minutes < 10 ? '0' : ''}${minutes}`;
}

function startTimer() {
  const seconds = parseInt(this.dataset.time);
  timer(seconds);
}

function timerNotification(seconds) {
    let n = new Notification('Timer started!',{
        body: 'Gotta go fast',
    });
}

buttons.forEach(button => button.addEventListener('click', startTimer));
/*document.customForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const mins = this.minutes.value;
  timer(mins * 60);
  this.reset();
});*/ 