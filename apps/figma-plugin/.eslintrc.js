const OFF = 0;
const WARNING = 1;
const ERROR = 2;

module.exports = {
  root: true,
  extends: [
    'dyn-base',
    'plugin:tailwindcss-jsx/recommended',
    'plugin:storybook/recommended',
  ],
};
