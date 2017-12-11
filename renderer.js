// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron');
const moment = require('moment-timezone');

document.addEventListener('DOMContentLoaded', () => {
    let n = new Notification('You did it!', {
      body: 'Nice work.'
    })
  
    // Tell the notification to show the menubar popup window on click
    n.onclick = () => { ipcRenderer.send('show-window') }
  
  })