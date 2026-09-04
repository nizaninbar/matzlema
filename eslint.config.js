import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

// Division of labour: ESLint owns correctness, Prettier owns formatting.
// `prettier` must stay last so it can switch off every stylistic rule the
// other configs turn on - otherwise `npm run lint` and `npm run format`
// disagree forever.
export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      // The report document is one big single-purpose template; these two
      // conventions buy nothing here.
      'vue/multi-word-component-names': 'off',
      'vue/attributes-order': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
]
