
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Custom rule to prevent debug borders
      "no-restricted-syntax": [
        "error",
        {
          "selector": "Literal[value=/.*debug.*border.*/i]",
          "message": "Debug borders are not allowed in production code. Use proper styling instead."
        },
        {
          "selector": "Literal[value=/.*border.*dashed.*red.*/i]",
          "message": "Red dashed debug borders are not allowed. Remove debug styling."
        },
        {
          "selector": "Property[key.name='border'][value.value=/.*red.*/i]",
          "message": "Red borders should not be used for debugging. Use proper CSS classes."
        }
      ]
    },
  }
);
