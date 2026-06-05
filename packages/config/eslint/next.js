/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve('./base'),
    'plugin:@next/eslint-plugin-next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
}
