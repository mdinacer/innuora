// @ts-check

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // Standard prettier options
  printWidth: 120,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  plugins: ["prettier-plugin-tailwindcss"],
  // Since prettier 3.0, manually specifying plugins is required
  //   plugins: ["@ianvs/prettier-plugin-sort-imports"],
  //   // This plugin's options
  //   importOrder: [
  //     "^@core/(.*)$",
  //     "",
  //     "^@server/(.*)$",
  //     "",
  //     "^@ui/(.*)$",
  //     "",
  //     "^[./]",
  //   ],
  //   importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  //   importOrderTypeScriptVersion: "5.0.0",
  //   importOrderCaseSensitive: false,
};

export default config;
