import prefixSelector from 'postcss-prefix-selector';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-prefix-selector': {
      prefix: '#hippo-app',
      transform(prefix, selector, prefixedSelector, filePath, rule) {
        // Scope :root variables to #hippo-app
        if (selector === ':root') {
          return prefix;
        }
        // Scope html/body resets to #hippo-app
        if (selector === 'html' || selector === 'body') {
          return prefix;
        }
        // Don't double-prefix if selector already starts with #hippo-app
        if (selector.startsWith(prefix)) {
          return selector;
        }
        // Scope [data-theme] selectors to within #hippo-app
        if (selector.startsWith('[data-theme')) {
          return `${prefix} ${selector}`;
        }
        // Default: prefix the selector
        return prefixedSelector;
      },
    },
  },
};
