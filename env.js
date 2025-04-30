const dotenv = require("dotenv");

dotenv.config();

const APP_URL = process.env.APP_URL || "http://localhost:3000";
module.exports = { APP_URL };
