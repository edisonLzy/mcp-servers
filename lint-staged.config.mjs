export default {
  '*.{js,ts}': () => {
    // Only lint the staged files instead of the entire codebase
    return ['pnpm eslint --fix'];
  },
};