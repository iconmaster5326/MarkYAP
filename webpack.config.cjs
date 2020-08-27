var path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    filename: "markyap.js",
    path: path.resolve(__dirname, "dist"),
  },
};
