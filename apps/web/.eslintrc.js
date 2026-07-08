/**
 * ESLint config for the web app.
 *
 * Kept self-contained (rather than extending the shared type-checked config) so
 * `next lint` runs in CI without needing `parserOptions.project`, and uses only
 * plugins that are installed. `eslint-config-next` is intentionally not required.
 *
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', '@next/next'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@next/next/core-web-vitals',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['.next/', 'node_modules/', 'next-env.d.ts'],
}
