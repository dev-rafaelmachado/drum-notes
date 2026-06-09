// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

/**
 * Central flat config for the whole monorepo.
 * Architecture rules (see .claude/architecture.md) are encoded here:
 * the domain layer (packages/core, packages/notation-engine) must stay
 * framework-agnostic, so React / Next / browser frameworks are banned there.
 */
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/next-env.d.ts",
    ],
  },

  // Base TypeScript rules for every package.
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Domain layer must remain framework-agnostic.
  {
    files: ["packages/core/**/*.{ts,tsx}", "packages/notation-engine/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "next", "next/*", "zustand"],
              message:
                "The domain layer must stay framework-agnostic (see .claude/architecture.md). No React / Next / store imports here.",
            },
          ],
        },
      ],
    },
  },

  // React + Next rules for UI-bearing projects.
  {
    files: ["packages/ui/**/*.{ts,tsx}", "apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // App Router only — this rule looks for a pages/ directory.
      "@next/next/no-html-link-for-pages": "off",
    },
  },

  // Node-context config files.
  {
    files: ["**/*.{config,setup}.{js,mjs,ts}", "**/vitest.config.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
