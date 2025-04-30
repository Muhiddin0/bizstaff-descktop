const isDevelopement = require("./utils/is-dev");

const isDev = isDevelopement();

if (isDev) {
  // Agar ishlatayotgan bo'lsangiz
  module.exports = { APP_URL: "http://localhost:3000" };
} else {
  // Agar maxsus serverda ishlatayotgan bo'lsa
  module.exports = { APP_URL: "https://seezntv.uz" };
}
