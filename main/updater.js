// main/updater.js
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const { dialog } = require("electron");

// Updater loglarini sozlash
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let mainWindow; // Asosiy oynaga havola

// Yangilanish holati haqida rendererga xabar yuborish funksiyasi
function sendStatusToWindow(channel, text) {
  log.info(`Update status: ${text}`);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, text);
  }
}

function checkForUpdates(win) {
  mainWindow = win; // Asosiy oynani saqlab qo'yish

  log.info("Checking for updates...");
  sendStatusToWindow("update-message", "Checking for updates...");

  // Yangilanish mavjud emasligini tinglash
  autoUpdater.on("update-not-available", (info) => {
    sendStatusToWindow("update-message", "No new updates available.");
    log.info("Update not available.", info);
  });

  // Yangilanish mavjudligini tinglash
  autoUpdater.on("update-available", (info) => {
    sendStatusToWindow("update-message", `Update available: v${info.version}`);
    log.info("Update available.", info);
    // Avtomatik yuklashni boshlash (standart xolat)
    // Agar foydalanuvchidan so'rash kerak bo'lsa, bu yerda dialog ko'rsatish mumkin
  });

  // Yangilanish yuklanish jarayonini tinglash
  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
    log_message =
      log_message + ` - Downloaded ${progressObj.percent.toFixed(2)}%`;
    log_message =
      log_message + ` (${progressObj.transferred}/${progressObj.total})`;
    sendStatusToWindow("update-progress", {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
    log.info(log_message);
  });

  // Yangilanish yuklab bo'linganini tinglash
  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded.", info);
    sendStatusToWindow(
      "update-downloaded",
      `Update v${info.version} downloaded. Restart to install.`
    );

    // Foydalanuvchiga ilovani qayta ishga tushirishni taklif qilish
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Ready",
        message: `A new version (v${info.version}) has been downloaded. Restart the application to apply the updates.`,
        buttons: ["Restart Now", "Later"],
        defaultId: 0, // "Restart Now" standart tugma
        cancelId: 1, // "Later" bekor qilish tugmasi
      })
      .then((result) => {
        if (result.response === 0) {
          // Agar "Restart Now" bosilsa
          log.info("User chose to restart. Quitting and installing...");
          autoUpdater.quitAndInstall();
        } else {
          log.info("User chose to install later.");
          // Rendererga xabar yuborish mumkin, masalan, "Update Later" tugmasini ko'rsatish uchun
          sendStatusToWindow("update-install-later");
        }
      });
  });

  // Yangilanishda xatolik yuz berganda tinglash
  autoUpdater.on("error", (err) => {
    const errorMessage = `Error during update: ${err.message}`;
    sendStatusToWindow("update-error", errorMessage);
    log.error(errorMessage, err);
    // dialog.showErrorBox('Update Error', `Failed to check for updates: ${err.message}`);
  });

  // Yangilanishlarni tekshirish va xabarnoma ko'rsatish (agar mavjud bo'lsa)
  // yoki faqat tekshirish uchun: autoUpdater.checkForUpdates();
  autoUpdater.checkForUpdatesAndNotify();
}

module.exports = { checkForUpdates };
