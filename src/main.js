const path = require("path");
const log = require("electron-log");

const { app, BrowserWindow, ipcMain } = require("electron");
const { checkForUpdates } = require("./updater"); // Updater modulini import qilish
const setupHandlers = require("./handlers"); // Agar handler'lar bo'lsa
const { APP_URL } = require("../env"); // Agar handler'lar bo'lsa

// Loglashni sozlash (ixtiyoriy lekin foydali)
log.transports.file.level = "info";
log.info("App starting...");

function createWindow() {
  // Main window
  const mainWindow = new BrowserWindow({
    title: "Bizstaff",
    icon: path.join(__dirname, "../assets/512x512.png"),
    width: 1000, // O'lchamni o'zgartirishingiz mumkin
    height: 800,
    webPreferences: {
      // Preload skriptini ko'rsatish
      preload: path.join(__dirname, "../preload/preload.js"),
      // Xavfsizlik uchun muhim sozlamalar:
      nodeIntegration: false, // Renderer processda Node.js ni o'chirish (MUHIM!)
      contextIsolation: true, // Preload va Renderer orasini izolyatsiya qilish (MUHIM!)
      // sandbox: true, // Qo'shimcha xavfsizlik qatlami (agar preload yetarli bo'lsa)
    },
  });

  // URL yuklash
  mainWindow.loadURL(APP_URL);

  // Oyna yopilganda ilovani yopishni to'xtatish
  // Faqat production versionda
  /*
  mainWindow.on("close", (event) => {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: "question",
      buttons: ["Ha", "Yo'q"],
      title: "Chiqishni tasdiqlash",
      message: "Rostan ham ilovadan chiqmoqchimisiz?",
    });

    if (choice === 1) {
      // Agar foydalanuvchi "Yo'q" ni tanlasa
      event.preventDefault(); // Ilovani yopishni to'xtatamiz
    }
  });
  */

  // Xavfsizlik: Faqat ma'lum URL'dan navigatsiyaga ruxsat berish (ixtiyoriy)
  mainWindow.webContents.on("will-navigate", (event, url) => {
    // Allow only APP_URL in env.js ;
    if (!url.startsWith(APP_URL)) {
      log.warn(`Blocked navigation to: ${url}`);
      event.preventDefault();
    }
  });

  // Ishlab chiqish vositalarini (DevTools) ochish (ixtiyoriy)
  // if (process.env.NODE_ENV !== 'production') {
  //   mainWindow.webContents.openDevTools();
  // }

  return mainWindow; // Oyna obyektini qaytarish
}

app.whenReady().then(() => {
  const mainWindow = createWindow();
  // Agar handler'lar fayli bo'lsa, uni ishga tushirish
  setupHandlers(mainWindow);
  // Updater funksiyasini chaqirish
  checkForUpdates(mainWindow);

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Barcha oynalar yopilganda chiqishni to'xtatish
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Render jarayonidan kelgan "yangilanishni tekshir" so'rovini tinglash
ipcMain.on("check-for-updates", () => {
  console.log("Renderer requested update check.");
  // Agar sozlamalar kerak bo'lsa (masalan, provider):
  // autoUpdater.setFeedURL({ provider: 'github', owner: 'your-gh-username', repo: 'your-repo-name' });
  mainWindow.webContents.send(
    "update-message",
    "Yangilanishlar tekshirilmoqda..."
  );
  autoUpdater.checkForUpdates(); // Tekshirishni boshlash
  // Yoki bildirishnoma bilan tekshirish:
  // autoUpdater.checkForUpdatesAndNotify();
});

// --- IPC Handler misoli (handlers.js ga ko'chirilishi mumkin) ---
// Preload orqali renderer'dan chaqirilishi mumkin bo'lgan funksiya
ipcMain.handle("get-app-version", () => {
  log.info("IPC: get-app-version called");
  return app.getVersion();
});

// Yangilanishni o'rnatish uchun renderer'dan kelgan so'rovni qabul qilish
ipcMain.on("restart-app-to-update", () => {
  log.info("IPC: restart-app-to-update received. Quitting and installing...");
  const { autoUpdater } = require("electron-updater");
  autoUpdater.quitAndInstall();
});

// ---------------------------------------------------------------
