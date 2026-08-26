module.exports = {
  env: {
    node: true,
    es2023: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["import"],
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  rules: {
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/no-default-export": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".cjs", ".mjs", ".ts", ".tsx"] },
    },
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended", "plugin:import/typescript"],
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/consistent-type-imports": "warn",
      },
    },
    {
      files: [
        "*.config.js",
        "*.config.ts",
        "*.config.mjs",
        "*.config.cjs",
        ".eslintrc.js",
        ".prettierrc.js",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
