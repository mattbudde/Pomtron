const {app, BrowserWindow, ipcMain, Tray, nativeImage} = require('electron');
const path = require('path');
const assetsDir = path.join(__dirname, 'assets');

//Updater
const GhReleases = require('electron-gh-releases');

let tray = undefined;
let window = undefined;

// This method is called once Electron is ready to run our code
// It is effectively the main method of our Electron app
app.on('ready', () => {
  let options = {
    repo: 'mattbudde/pomotron',
    currentVersion: app.getVersion()
  };
  
  const updater = new GhReleases(options)
  
  updater.check((err, status) => {
    if (!err && status) {
      updater.download();
    }
  })
  
  updater.on('update-downloaded', (info) => {
    updater.install();
  })
  
  updater.autoUpdater;
  // Setup the menubar with an icon
  let icon = nativeImage.createFromDataURL(base64Icon)
  tray = new Tray(icon)

  // Add a click handler so that when the user clicks on the menubar icon, it shows
  // our popup window
  tray.on('click', function(event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })

  // Make the popup window for the menubar
  window = new BrowserWindow({
    width: 305,
    height: 175,
    show: false,
    frame: false,
    resizable: true,
  })

  // Tell the popup window to load our index.html file
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Only close the window on blur if dev tools isn't opened
  window.on('blur', () => {
    if(!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
})

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds()
  const windowPos = window.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }


  window.setPosition(x, y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Tray Icon as Base64 so tutorial has less overhead
let base64Icon = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABF0lEQVQ4jZXSIU9CYRQG4EfY3Cw0/gFu/gUCSYPZzUShsenGLJiMEjFrMXqNbBr5BcxpctNiJZiZk2Q432UM72Xwbqecc973nO98L//RxD2+MMcP3nGD/YL+BWrIEilDO4m10MU41QaoFpFf8IaDNUMOMcUjKsuFLJFrK4Q7nK/kGvjGZZ5optWKJj/juiB/ihnqxMGykpXLBHbwgQvi2u0tBWCIEbF+s6TpCZ+pMY9+qp3hlfjnVonAcdpgOU5SrYcJYZJuicA63OKBcNh4S/Ku8EOHsOdcmGRT9JPAXp4YpERjA/IRfoUXFqgKe36vFlbW7ifyVVFDRdhzJkwyFF/VEwebpigbsEBdOGwk/nkirt2x9OYcf8X8QrthAWbAAAAAAElFTkSuQmCC`