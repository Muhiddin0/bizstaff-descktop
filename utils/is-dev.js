function isDevelopement() {
  return process.env.NODE_ENV === "development";
}

module.exports = isDevelopement;
