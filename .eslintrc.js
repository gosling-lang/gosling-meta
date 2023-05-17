module.exports = {
  settings: {
    react: {
     version: "detect",
    },
  },
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript',
    "prettier",
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    'react',
    "prettier"
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': "off",
  }
}