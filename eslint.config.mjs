import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  //globalIgnores(["./src/components/ui/**/*"]),
  ...compat.extends("next", "next/core-web-vitals", "prettier"),
  {
    plugins: {
      "jsx-a11y": jsxA11y,
      prettier,
    },

    rules: {
      "prettier/prettier": "warn",
      camelcase: "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      "import/prefer-default-export": "off",
      "react/jsx-filename-extension": "off",
      "react/jsx-props-no-spreading": "off",
      "react/no-unused-prop-types": "off",
      "react/require-default-props": "off",
      "react/no-unescaped-entities": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "never",
          tsx: "never",
          js: "never",
          jsx: "never",
        },
      ],
    },
  },
  ...compat.extends("plugin:@typescript-eslint/recommended", "prettier").map((config) => ({
    ...config,
    files: ["**/*.+(ts|tsx)"],
  })),
  {
    files: ["**/*.+(ts|tsx)"],
    // plugins: {
    //   "@typescript-eslint": typescriptEslintEslintPlugin,
    // },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-use-before-define": [0],
      //"@typescript-eslint/no-use-before-define": [1],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-use-before-define": "warn",
    },
  },
];

// import { FlatCompat } from "@eslint/eslintrc";
// import jsxA11y from "eslint-plugin-jsx-a11y";
// import prettier from "eslint-plugin-prettier";
// import { globalIgnores } from "eslint/config";
// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import reactHooks from "eslint-plugin-react-hooks";
// import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
// import tsParser from "@typescript-eslint/parser";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/recommended", "prettier"),
//   reactHooks.configs["recommended-latest"],
//   {
//     plugins: {
//       "jsx-a11y": jsxA11y,
//       prettier,
//     },

//     rules: {
//       "prettier/prettier": "warn",
//       camelcase: "off",
//       "react/react-in-jsx-scope": "off",
//       "@typescript-eslint/no-unused-vars": "warn",
//       "@typescript-eslint/no-explicit-any": "warn",
//       "jsx-a11y/alt-text": "warn",
//       "jsx-a11y/aria-props": "warn",
//       "jsx-a11y/aria-proptypes": "warn",
//       "jsx-a11y/aria-unsupported-elements": "warn",
//       "jsx-a11y/role-has-required-aria-props": "warn",
//       "jsx-a11y/role-supports-aria-props": "warn",
//       "import/prefer-default-export": "off",
//       "react/jsx-filename-extension": "off",
//       "react/jsx-props-no-spreading": "off",
//       "react/no-unused-prop-types": "off",
//       "react/require-default-props": "off",
//       "react/no-unescaped-entities": "off",
//       "import/extensions": [
//         "error",
//         "ignorePackages",
//         {
//           ts: "never",
//           tsx: "never",
//           js: "never",
//           jsx: "never",
//         },
//       ],
//     },
//   },
//   ...compat.extends("plugin:@typescript-eslint/recommended", "prettier").map((config) => ({
//     ...config,
//     files: ["**/*.+(ts|tsx)"],
//   })),
//   {
//     files: ["**/*.+(ts|tsx)"],
//     plugins: {
//       "@typescript-eslint": typescriptEslintEslintPlugin,
//     },
//     languageOptions: {
//       parser: tsParser,
//     },
//     rules: {
//       "@typescript-eslint/explicit-function-return-type": "off",
//       "@typescript-eslint/explicit-module-boundary-types": "off",
//       "no-use-before-define": [0],
//       //"@typescript-eslint/no-use-before-define": [1],
//       "@typescript-eslint/no-explicit-any": "off",
//       "@typescript-eslint/no-var-requires": "off",
//       "@typescript-eslint/no-unused-vars": "warn",
//       "@typescript-eslint/no-use-before-define": "warn",
//     },
//   },
//   globalIgnores(["./src/lib/generated/prisma/**/*", "./src/components/ui/**/*"]),
// ];

// export default eslintConfig;

// import { FlatCompat } from "@eslint/eslintrc";

// const compat = new FlatCompat({
//   // import.meta.dirname is available after Node.js v20.11.0
//   baseDirectory: import.meta.dirname,
// });

// const eslintConfig = [
//   ...compat.config({
//     extends: [
//       "next",
//       "next/core-web-vitals",
//       "next/typescript",
//       "plugin:prettier/recommended",
//       "plugin:jsx-a11y/recommended",
//     ],
//     plugins: ["prettier", "jsx-a11y"],
//     rules: {
//       "prettier/prettier": [
//         "error",
//         {
//           trailingComma: "all",
//           semi: false,
//           tabWidth: 2,
//           singleQuote: true,
//           printWidth: 80,
//           endOfLine: "auto",
//           arrowParens: "always",
//           plugins: ["prettier-plugin-tailwindcss"],
//         },
//         {
//           usePrettierrc: false,
//         },
//       ],
//       "react/react-in-jsx-scope": "off",
//       "jsx-a11y/alt-text": "warn",
//       "jsx-a11y/aria-props": "warn",
//       "jsx-a11y/aria-proptypes": "warn",
//       "jsx-a11y/aria-unsupported-elements": "warn",
//       "jsx-a11y/role-has-required-aria-props": "warn",
//       "jsx-a11y/role-supports-aria-props": "warn",
//     },
//   }),
// ];

// export default eslintConfig;
