import { app } from "electron"
import createWindow from "src/common/base/electron/createWindow"

app.whenReady().then(() => {
  createWindow({
    src: app.isPackaged
      ? "./botServer.html"
      : "http://localhost:3334/botServer.html",
    // src: "./botServer.html",
    wOptions: {
      show: false
    }
  })

  createWindow({
    src: app.isPackaged ? "./bot.html" : "http://localhost:3334/bot.html",
    // src: "./bot.html",
    wOptions: {
      width: 800,
      height: 800
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
