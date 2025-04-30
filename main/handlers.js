// main/handlers.js
const { desktopCapturer, ipcMain } = require("electron");
const log = require("electron-log");

const osu = require("os-utils");
const getActiveWindowHyprland = require("../utils/get-active-window");

function setupHandlers(mainWindow) {
  // screenshot olish
  ipcMain.handle("take-screenshot", async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 }, // Yuqori sifat
    });

    if (sources.length === 0) {
      throw new Error("No screen sources found");
    }

    // `thumbnail` ni base64 formatga o‘girish
    return sources[0].thumbnail.toDataURL();
  });

  // CPU va RAM statistikasi
  ipcMain.handle("get-system-stats", async () => {
    return new Promise((resolve) => {
      osu.cpuUsage((cpuUsage) => {
        resolve({
          cpuUsage: (cpuUsage * 100).toFixed(2) + "%",
          freeMem: ((osu.freemem() / osu.totalmem()) * 100).toFixed(2) + "%",
          totalMem: `${(osu.totalmem() / 1024).toFixed(2)} GB`,
        });
      });
    });
  });

  // Mavjud handlerni yangi funksiya bilan almashtirish
  ipcMain.handle("get-active-app", async () => {
    // Platformani tekshirish (ixtiyoriy, lekin foydali)
    if (
      process.env.XDG_SESSION_TYPE === "wayland" &&
      process.env.HYPRLAND_INSTANCE_SIGNATURE
    ) {
      log.info("Detected Wayland/Hyprland session, using hyprctl.");
      try {
        return await getActiveWindowHyprland();
      } catch (hyprError) {
        log.error(
          `Hyprland method failed: ${hyprError.message}. Falling back (if possible) or returning error.`
        );
        // Bu yerda X11 usuliga qaytish mantiqini qo'shish mumkin,
        // lekin Hyprlandda bu mantiqsiz bo'lishi mumkin.
        // Yaxshiroq variant - xatolikni qaytarish.
        // throw hyprError; // Xatoni rendererga yuborish
        // Yoki default qiymat qaytarish:
        return { title: "Error getting window", app: "Error" };
      }
    } else {
      // Boshqa muhitlar uchun eski (yoki boshqa) usulni qo'llash
      log.warn(
        "Not on Hyprland/Wayland or detection failed. Trying original method (might fail)."
      );
      // Bu yerga original `activeWindow()` chaqiruvini qo'yishingiz mumkin,
      // agar boshqa muhitlarni ham qo'llab-quvvatlash kerak bo'lsa.
      // Hozircha xatolik yoki default qiymat qaytaramiz:
      const originalActiveWindow = require("active-win"); // yoki qayerdan import qilingan bo'lsa
      try {
        const window = await originalActiveWindow();
        return {
          title: window?.title || "N/A",
          app: window?.owner?.name || "N/A",
        };
      } catch (fallbackError) {
        log.error(`Fallback activeWindow failed: ${fallbackError.message}`);
        return { title: "Fallback failed", app: "Error" };
      }
    }
  });

  // // Foydalanilgan ilovalar statistikasi
  // ipcMain.handle("get-active-app", async () => {
  //   const window = await activeWindow();
  //   return {
  //     title: window.title,
  //     app: window.owner.name,
  //   };
  // });
}

module.exports = setupHandlers;
