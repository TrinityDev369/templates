// ---------------------------------------------------------------------------
// @myorg/eslint-config — Shareable ESLint configuration
// ---------------------------------------------------------------------------
// Provides a consistent lint baseline across every workspace package.
// Extend or override rules in each app/package's own .eslintrc as needed.
// ---------------------------------------------------------------------------

/** @type {import("eslint").Linter.Config} */
module.exports = {
  // Use the TypeScript parser so ESLint understands TS syntax.
  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },

  plugins: ["@typescript-eslint", "import"],

  extends: [
    // Core recommended rules from ESLint itself.
    "eslint:recommended",

    // TypeScript-aware recommended rules.
    "plugin:@typescript-eslint/recommended",

    // Enforce consistent import ordering and resolve correctness.
    "plugin:import/recommended",
    "plugin:import/typescript",

    // Turn off all rules that conflict with Prettier (must be last).
    "prettier",
  ],

  settings: {
    // Help eslint-plugin-import resolve TypeScript path aliases.
    "import/resolver": {
      typescript: {
        project: ["tsconfig.json"],
      },
    },
  },

  rules: {
    // --------------- TypeScript ---------------
    // Allow unused vars when prefixed with _ (common pattern for ignored params).
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],

    // Prefer explicit return types on exported functions for better DX.
    "@typescript-eslint/explicit-function-return-type": "off",

    // --------------- Imports ---------------
    // Enforce a consistent import order: built-ins, externals, internals.
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],

    // --------------- General ---------------
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },

  // Ignore build artifacts and dependency folders.
  ignorePatterns: ["dist/", "node_modules/", ".turbo/", "coverage/"],
};
