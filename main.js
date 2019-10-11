const os = require("os");
const path = require("path");
const fs = require("fs");
const {
  app,
  Menu,
  BrowserWindow,
  autoUpdater,
  ipcMain,
  Tray,
  dialog,
  nativeImage,
  systemPreferences
} = require("electron");

const isDev = require("electron-is-dev");
const openAboutWindow = require("about-window").default;
const powerSaveBlocker = require("electron").powerSaveBlocker;

const assetsDir = path.join(__dirname, "assets");
const version = app.getVersion();
const platform = os.platform() + "_" + os.arch();
const darkIcon = path.join(__dirname, "assets/img/icon-dark.png");
const lightIcon = path.join(__dirname, "assets/img/icon.png");

const server = "https://hazel-server-dwrilkxyqz.now.sh";
const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

let tray = undefined;
let window = undefined;

// This method is called once Electron is ready to run our code
// It is effectively the main method of our Electron app
app.on("ready", () => {
  //Check for updates on boot
  // Prevent App being put to sleep
  powerSaveBlocker.start("prevent-app-suspension");
  // Setup the menubar with an icon
  if (systemPreferences.isDarkMode(true)) {
    var icon = darkIcon;
  } else {
    var icon = lightIcon;
  }
  tray = new Tray(icon);
  //Set Menu of App
  Menu.setApplicationMenu(menu);
  // Add a click handler so that when the user clicks on the menubar icon, it shows
  // our popup window
  tray.on("click", function (event) {
    toggleWindow();
    //dev tools
    //window.webContents.openDevTools({mode: "undocked"});
  });

  ipcMain.on("open-window", () => {
    showWindow();
  });

  ipcMain.on("close-window", () => {
    window.hide();
  });

  // Make the popup window for the menubar
  window = new BrowserWindow({
    width: 305,
    height: 200,
    show: false,
    frame: false,
    resizable: false,
    backgroundColor: "#0c2a55"
  });

  // Tell the popup window to load our index.html file
  window.loadURL(`file://${path.join(__dirname, "index.html")}`);

  // Only close the window on blur if dev tools isn't opened
  window.on("blur", () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
});

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  const trayPos = tray.getBounds();
  const windowPos = window.getBounds();
  let x, y = 0;

  x = Math.round(trayPos.x + trayPos.width / 2 - windowPos.width / 2);

  if (process.platform == "darwin") {
    y = Math.round(trayPos.y + trayPos.height);
  } else {
    y = Math.round(trayPos.y + trayPos.height * 10);
  }

  window.setPosition(x, y, false);
  window.show();
  window.focus();
};

ipcMain.on("show-window", () => {
  showWindow();
});

app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const menu = Menu.buildFromTemplate([
  {
    label: app.getName(),
    submenu: [
      {
        label: "Check for Updates...",
        click: () => autoUpdater.checkForUpdates()
      },
      {
        label: "Buy me a beer 🍺",
        click: () => {
          require("electron").shell.openExternal(
            "https://monzo.me/matthewbudde"
          );
        }
      },
      {
        label: "About",
        click: () =>
          openAboutWindow({
            icon_path: path.join(__dirname, "/assets/img/logo.png"),
            copyright: "Copyright (c) 2019 Matt Budde",
            package_json_dir: __dirname
          })
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        accelerator: "'CmdOrCtrl+Q'",
        role: "quit"
      }
    ]
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Bug Report 🐛",
        click() {
          require("electron").shell.openExternal(
            "https://github.com/mattbudde/pomotron/issues"
          );
        }
      }
    ]
  }
]);

if (!isDev) {
  autoUpdater.setFeedURL(feed);
}
autoUpdater.on("error", err => console.log(err));
autoUpdater.on("checking-for-update", () => console.log("checking-for-update"));
autoUpdater.on("update-available", () => console.log("update-available"));
autoUpdater.on("update-not-available", () => {
  dialog.showMessageBox({
    type: "info",
    buttons: ["Cancel"],
    cancelId: 0,
    message: "You are running the latest version of " + app.getName() + " 🎉"
  });
}); // Ask the user if update is available

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  let message =
    app.getName() +
    " " +
    releaseName +
    " is now available. It will be installed the next time you restart the application.";
  if (releaseNotes) {
    const splitNotes = releaseNotes.split(/[^\r]\n/);
    message += "\n\nRelease notes:\n";
    splitNotes.forEach(notes => {
      message += notes + "\n\n";
    });
  } // Ask user to update the app
  dialog.showMessageBox(
    {
      type: "question",
      buttons: ["Install and Relaunch", "Later"],
      defaultId: 0,
      message: "A new version of " + app.getName() + " has been downloaded",
      detail: message
    },
    response => {
      if (response === 0) {
        setTimeout(() => autoUpdater.quitAndInstall(), 1);
      }
    }
  );
});
