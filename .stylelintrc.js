module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-rational-order', // provides a rational order of properites as a base
    'stylelint-config-prettier',
  ],
  plugins: ['stylelint-order', 'stylelint-config-rational-order/plugin'],
  rules: {
    'declaration-colon-newline-after': null, // let Prettier decide (when to put values on a new line new line)
    'property-no-vendor-prefix': null, // some properties need vendor prefixes
    'value-list-comma-newline-after': null, // let Prettier decide (when to put comma separated values on new lines)
    'color-hex-length': null, // 6 digits is fine / coming from figma
    'custom-property-empty-line-before': null, // Space makes nested css more readable
    'selector-type-no-unknown': [
      true,
      {
        ignore: ['custom-elements'], // allow custom element selectors
      },
    ],
  },
  syntax: 'postcss',
};
