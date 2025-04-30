const isDevelopement = require("./utils/is-dev");

//  --- Ishglashdan oldin o'qi! ---
// Elelctron js .env bilan yaxshi ishlamaganligi
// uchun .env js code bilan hal qilindi
// Shunchake .env.example.js dan exampleni olib
// tashla va o'zinga kerakli key valuelarni qo'yib ishlayver

if (isDev) {
  // Agar ishlatayotgan bo'lsangiz
  module.exports = { APP_URL: "http://localhost:3000" };
} else {
  // Agar maxsus serverda ishlatayotgan bo'lsa
  module.exports = { APP_URL: "https://example.com" };
}
