// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    rules: {
      'arrow-parens': 'off',
      semi: ['error', 'always'],
      'space-before-function-paren': ['error', 'never'],
      'no-template-curly-in-string': 'off',
      'vue/multi-word-component-names': 'off'
    }
  }
);
