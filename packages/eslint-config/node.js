const base = require("./index.js");

module.exports = {
  ...base,
  env: {
    ...base.env,
    node: true,
    es2023: true,
  },
};
