import prefixSelector from 'postcss-prefix-selector';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-prefix-selector': {
      prefix: '#hippo-app',
      transform(prefix, selector, prefixedSelector, filePath, rule) {
        // Scope :root variables to our container
        if (selector === ':root') {
          return prefix;
        }
        // Scope html/body resets to our container
        if (selector === 'html' || selector === 'body') {
          return prefix;
        }
        // Don't double-prefix selectors already scoped to our container
        if (
          selector === prefix ||
          selector.startsWith(`${prefix} `) ||
          selector.startsWith(`${prefix}[`) ||
          selector.startsWith(`${prefix}:`)
        ) {
          return selector;
        }
        // data-theme is on the root element itself — same-element selector, no space
        if (selector.startsWith('[data-theme')) {
          return `${prefix}${selector}`;
        }
        // Default: prefix as descendant
        return prefixedSelector;
      },
    },
  },
};
