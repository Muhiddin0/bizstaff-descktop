// main/handlers.js yoki main/main.js ichida
const { ipcMain } = require("electron");
const { exec } = require("child_process"); // Node.js ning o'zidan
const log = require("electron-log"); // Agar ishlatayotgan bo'lsangiz

// Aktiv oynani olish uchun Wayland (Hyprland) usuli
function getActiveWindowHyprland() {
  return new Promise((resolve, reject) => {
    // hyprctl activewindow buyrug'ini ishga tushirish
    exec("hyprctl activewindow", (error, stdout, stderr) => {
      if (error) {
        log.error(`hyprctl error: ${error.message}`);
        // Xatolikni yanada aniqroq qilish (masalan, agar hyprctl topilmasa)
        if (error.code === "ENOENT") {
          reject(
            new Error(
              "hyprctl command not found. Is Hyprland running and hyprctl in PATH?"
            )
          );
        } else {
          reject(
            new Error(
              `Failed to get active window via hyprctl: ${
                stderr || error.message
              }`
            )
          );
        }
        return;
      }
      if (stderr) {
        log.warn(`hyprctl stderr: ${stderr}`);
        // Ba'zan xato bo'lmasa ham stderr ga chiqishi mumkin, lekin davom etamiz
      }

      try {
        // hyprctl chiqishini qatorlarga bo'lish va parse qilish
        const lines = stdout.trim().split("\n");
        const windowInfo = {};
        let currentTitle = "Unknown Title";
        let currentApp = "Unknown App";

        lines.forEach((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("title:")) {
            currentTitle = trimmedLine.substring("title:".length).trim();
          } else if (trimmedLine.startsWith("class:")) {
            // Ko'pincha 'class' ilova nomiga yaqinroq bo'ladi
            currentApp = trimmedLine.substring("class:".length).trim();
          }
          // Agar 'initialTitle', 'initialClass' kerak bo'lsa, ularni ham olish mumkin
        });

        log.info(
          `Active window (Hyprland): App='${currentApp}', Title='${currentTitle}'`
        );
        resolve({
          title: currentTitle,
          app: currentApp, // yoki 'class' ni ishlating
          // owner: { name: currentApp } // Agar eski format kerak bo'lsa
        });
      } catch (parseError) {
        log.error(`Error parsing hyprctl output: ${parseError.message}`);
        log.error(`hyprctl stdout was: ${stdout}`);
        reject(new Error("Failed to parse hyprctl output."));
      }
    });
  });
}

module.exports = getActiveWindowHyprland;
