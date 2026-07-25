module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.base.json', './apps/*/tsconfig.json', './libs/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@nx', '@typescript-eslint', 'unicorn'],
  extends: [
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:unicorn/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/require-await': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'unicorn/prefer-module': 'off',
    'unicorn/filename-case': ['error', { cases: { camelCase: true, kebabCase: true, pascalCase: true } }],
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/expiring-todo-comments': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off'
  },
  ignorePatterns: ['dist', 'node_modules', '*.js', 'jest.config.ts'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {}
    }
  ]
};
