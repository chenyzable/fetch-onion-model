module.exports = {
  extends: [require.resolve("@cyzeal/lint-config-lib/eslint-ts")],
  rules: {
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "no-underscore-dangle": 0,
  },
}
