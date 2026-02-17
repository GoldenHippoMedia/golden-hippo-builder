import prefixSelector from 'postcss-prefix-selector';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-prefix-selector': {
      prefix: '#hippo-funnel-app',
      transform(prefix, selector, prefixedSelector, filePath, rule) {
        if (selector === ':root') {
          return prefix;
        }
        if (selector === 'html' || selector === 'body') {
          return prefix;
        }
        if (selector.startsWith(prefix)) {
          return selector;
        }
        if (selector.startsWith('[data-theme')) {
          return `${prefix} ${selector}`;
        }
        return prefixedSelector;
      },
    },
  },
};
