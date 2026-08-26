const base = require("./index.js");

module.exports = {
  ...base,
  env: {
    ...base.env,
    browser: true,
    es2023: true,
  },
  extends: [...base.extends, "plugin:react/recommended", "plugin:react-hooks/recommended"],
  plugins: [...base.plugins, "react", "react-hooks"],
  rules: {
    ...base.rules,
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    ...base.settings,
    react: { version: "detect" },
  },
};
