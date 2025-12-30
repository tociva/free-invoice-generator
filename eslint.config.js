// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "array-callback-return": "error",
      "accessor-pairs": "error",
      "block-scoped-var": "error",
      "class-methods-use-this": ["error", { exceptMethods: ["render"] }],
      "complexity": ["error", 20],
      "consistent-return": "error",
      "curly": "error",
      "default-param-last": "error",
      "dot-location": ["error", "property"],
      "dot-notation": ["error", { allowKeywords: false }],
      "eqeqeq": ["error", "always"],
      "no-alert": "error",
      "no-empty-function": ["error", { allow: ["constructors"] }],
      "no-eval": "error",
      "no-floating-decimal": "error",
      "no-implicit-coercion": "error",
      "no-implied-eval": "error",
      "no-loop-func": "error",
      "no-multi-spaces": "error",
      "no-new": "error",
      "no-return-await": "error",
      "no-throw-literal": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "radix": "error",
      "require-await": "error",
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
      "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
      "@typescript-eslint/no-shadow": ["error"],
      "no-shadow": "off",
      "quotes": ["error", "single"],
      "semi": "error",
      "space-before-blocks": "error",
      "arrow-parens": ["error", "always"],
      "arrow-spacing": "error",
      "no-duplicate-imports": "error",
      "object-shorthand": "error",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
