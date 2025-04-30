// preload/preload.js
const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload script loaded.");

// Faqat kerakli va xavfsiz funksiyalarni rendererga ochib berish
contextBridge.exposeInMainWorld("electronAPI", {
  // Asosiy jarayondan ma'lumot so'rash (invoke/handle uchun)
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Yangilanishni qayta ishga tushirishni so'rash
  requestUpdateRestart: () => ipcRenderer.send("restart-app-to-update"), // <<<--- YANGI QATOR

  // Asosiy jarayonga xabar yuborish (send/on uchun)
  // Masalan: Foydalanuvchi "Update Later" tugmasini bossa
  // requestUpdateRestart: () => ipcRenderer.send('restart-app-to-update'),

  // Asosiy jarayondan keladigan xabarlarni tinglash (on/send uchun)
  onUpdateMessage: (callback) =>
    ipcRenderer.on("update-message", (_event, value) => callback(value)),
  onUpdateProgress: (callback) =>
    ipcRenderer.on("update-progress", (_event, value) => callback(value)),
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on("update-downloaded", (_event, value) => callback(value)),
  onUpdateError: (callback) =>
    ipcRenderer.on("update-error", (_event, value) => callback(value)),
  onUpdateInstallLater: (callback) =>
    ipcRenderer.on("update-install-later", (_event) => callback()),

  // Kerak bo'lsa, tinglovchilarni o'chirish uchun funksiya
  removeListener: (channel) => ipcRenderer.removeAllListeners(channel),

  // Ish davomidagi fa'oliyatlarni ko'rib borish uchun
  // working handlerlar

  takeScreenshot: async () => {
    return await ipcRenderer.invoke("take-screenshot");
  },

  cpuRamActivity: async () => {
    return await ipcRenderer.invoke("get-system-stats");
  },

  applicationActivity: async () => {
    return await ipcRenderer.invoke("get-active-app");
  },

  shoUpdate: async () => {
    return await ipcRenderer.invoke("show-update");
  },
});

// // Brauzer oynasi yuklanganda xabar berish (ixtiyoriy)
// window.addEventListener("DOMContentLoaded", () => {
//   console.log("DOM content loaded in renderer.");
//   // Bu yerda boshlang'ich ma'lumotlarni so'rashingiz mumkin
//   // Misol: window.electronAPI.getAppVersion().then(v => console.log('App Version:', v));
// });
